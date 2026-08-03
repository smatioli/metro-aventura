import "./style.css";
import { fleetThemes, lines, platformSideFor, type CompanyId, type MetroLine } from "../metro-aventura/data";
import { nextStation, routeFor } from "../metro-aventura/game-state";
import { trainAudio } from "../metro-aventura/train-audio";
import {
  facingFor,
  nextStationAnnouncementText,
  rideAnnouncementFor,
  rideProgress,
  SCENE_BOUNDS,
  stepPosition,
  walkZonesFor,
  zoneAt,
  type Facing,
  type Position,
  type Screen,
  type WalkZone,
  type ZoneId
} from "./game-state";

const app = document.querySelector<HTMLDivElement>("#app")!;

let screen: Screen = "linha";
let selection = 0;
let line: MetroLine = lines[0];
let startStationIndex = 0;
let direction: 1 | -1 = 1;
let speechEnabled = true;

type PlatformPhase = "aguardando-trem" | "trem-chegando" | "portas-abertas" | null;
let platformPhase: PlatformPhase = null;
let doorsOpen = false;
let ticketValidated = false;

let avatarPos: Position = { x: 50, y: 90 };
let facing: Facing = "up";
let heldKeys = new Set<string>();
let moveTarget: Position | null = null;
let sceneZones: WalkZone[] = [];
let previousZoneId: ZoneId | null = null;
let rafId = 0;
let lastFrameTime = 0;
const WALK_SPEED = 42;

let arrivalTimer1 = 0;
let arrivalTimer2 = 0;

let rideRoute: string[] = [];
let rideIndex = 0;
let arrivalStationName = "";

let avatarEl: HTMLElement | null = null;
let catracaEl: HTMLElement | null = null;

function speak(text: string): void {
  if (!speechEnabled || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pt-BR";
  utterance.rate = 0.78;
  speechSynthesis.speak(utterance);
}

function speakRideStatus(): void {
  if (!speechEnabled || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const { current } = rideAnnouncementFor(rideRoute, rideIndex);
  const first = new SpeechSynthesisUtterance(`Estação ${current}.`);
  first.lang = "pt-BR";
  first.rate = 0.78;
  const second = new SpeechSynthesisUtterance(nextStationAnnouncementText(rideRoute, rideIndex));
  second.lang = "pt-BR";
  second.rate = 0.78;
  speechSynthesis.speak(first);
  speechSynthesis.speak(second);
}

function companyShort(id: CompanyId): string {
  if (id === "metro") return "Metrô";
  if (id === "cptm") return "CPTM";
  return "ViaMobilidade";
}

function keyHint(keys: string[], label: string): string {
  return `<div class="key-hint" aria-label="${label}">${keys.map(key => `<kbd>${key}</kbd>`).join("")}<span>${label}</span></div>`;
}

function shell(content: string, className = ""): void {
  app.innerHTML = `<main class="app-shell ${className}" style="--line:${line.color};--line-soft:${line.colorSoft}"><button class="sound-button" aria-label="Ligar ou desligar som">${speechEnabled ? "🔊" : "🔇"}</button>${content}</main>`;
}

function screenMax(): number {
  if (screen === "linha") return lines.length;
  if (screen === "estacao") return line.stations.length;
  if (screen === "direcao") return 2;
  if (screen === "viagem") return rideAnnouncementFor(rideRoute, rideIndex).isTerminal ? 1 : 2;
  return 1;
}

function announceSelection(): void {
  if (screen === "linha") speak(lines[selection].name);
  else if (screen === "estacao") speak(line.stations[selection]);
  else if (screen === "direcao") speak(`Destino ${routeFor(line.stations, selection === 0 ? 1 : -1).at(-1)}`);
}

function render(): void {
  if (screen === "linha") renderLinha();
  else if (screen === "estacao") renderEstacao();
  else if (screen === "direcao") renderDirecao();
  else if (screen === "estacao-livre" || screen === "embarque") renderStationWalk();
  else if (screen === "viagem") renderViagem();
  else renderChegada();
  app.querySelector(".selected")?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
}

function renderLinha(): void {
  shell(`<header><span class="eyebrow">ESCOLHA A LINHA</span><h1>Qual linha vamos explorar?</h1></header><section class="choice-grid multi" style="--cols:4">${lines.map((item, i) => `<button class="choice-card line-card ${selection === i ? "selected" : ""}" data-line-id="${item.id}" style="--card-color:${item.color};--card-soft:${item.colorSoft}" aria-label="Escolher ${item.name}"><span class="company-badge">${companyShort(item.companyId)}</span><div class="line-number">${item.id}</div><h2>${item.name.replace(`Linha ${item.id} `, "")}</h2><div class="track-line"></div></button>`).join("")}</section><footer>${keyHint(["←", "→"], "escolher")}${keyHint(["ESPAÇO"], "confirmar")}</footer>`);
}

function renderEstacao(): void {
  shell(`<header><span class="eyebrow">ESCOLHA A ESTAÇÃO</span><h1>De onde vamos partir?</h1></header><section class="station-list" aria-label="Estações da linha">${line.stations.map((name, i) => `<button class="station-row ${selection === i ? "selected" : ""}" data-station-index="${i}"><span class="station-index">${i + 1}</span><span class="station-name">${name}</span></button>`).join("")}</section><footer>${keyHint(["←", "→"], "escolher")}${keyHint(["ESPAÇO"], "confirmar")}</footer>`);
}

function renderDirecao(): void {
  const options = [1, -1] as const;
  shell(`<header><span class="eyebrow">ESCOLHA O SENTIDO</span><h1>Para onde vamos?</h1></header><section class="choice-grid two">${options.map((dir, i) => { const route = routeFor(line.stations, dir); return `<button class="choice-card direction-card ${selection === i ? "selected" : ""}" data-direction="${dir}"><div class="train-arrow">${dir === 1 ? "🚇 →" : "← 🚇"}</div><h2>${route.at(-1)}</h2><p>Destino</p></button>`; }).join("")}</section><footer>${keyHint(["←", "→"], "escolher")}${keyHint(["ESPAÇO"], "confirmar")}</footer>`);
}

function stationSceneHeader(): { eyebrow: string; title: string } {
  if (screen === "estacao-livre") return { eyebrow: "ANDANDO", title: !ticketValidated ? "Vá até a catraca" : "Vá até a plataforma" };
  if (platformPhase === "aguardando-trem") return { eyebrow: "PLATAFORMA", title: "Aguardando o trem" };
  if (platformPhase === "trem-chegando") return { eyebrow: "PLATAFORMA", title: "O trem está chegando" };
  return { eyebrow: "PLATAFORMA", title: "Entre no trem" };
}

function rectFor(zones: WalkZone[], id: ZoneId): { x: number; y: number; w: number; h: number } {
  return zones.find(zone => zone.id === id)!.rect;
}

function renderSceneMarkup(zones: WalkZone[]): string {
  const entrada = rectFor(zones, "entrada");
  const catraca = rectFor(zones, "catraca");
  const corredor = rectFor(zones, "corredor");
  const plataforma = rectFor(zones, "plataforma");
  const trem = rectFor(zones, "trem-portas");
  const side = platformSideFor(line.id, line.stations[startStationIndex]);
  const theme = fleetThemes[line.fleets[0]];
  return `
    <div class="scene-floor"></div>
    <div class="scene-corredor" style="left:${corredor.x}%;top:${corredor.y}%;width:${corredor.w}%;height:${corredor.h}%"><span class="wall-left"></span><span class="wall-right"></span></div>
    <div class="scene-entrada" style="left:${entrada.x}%;top:${entrada.y}%;width:${entrada.w}%;height:${entrada.h}%"><span class="door-glass"></span></div>
    <div class="scene-catraca ${ticketValidated ? "validado" : ""}" style="left:${catraca.x}%;top:${catraca.y}%;width:${catraca.w}%;height:${catraca.h}%">
      <div class="catraca-post"><span class="catraca-arm"></span><span class="catraca-light"></span></div>
      <div class="catraca-post"><span class="catraca-arm"></span><span class="catraca-light"></span></div>
    </div>
    <div class="scene-plataforma edge-${side}" style="left:${plataforma.x}%;top:${plataforma.y}%;width:${plataforma.w}%;height:${plataforma.h}%">
      <div class="station-sign-mini">${line.stations[startStationIndex]}</div>
      <div class="platform-edge-strip"></div>
    </div>
    <div class="scene-trem edge-${side} phase-${platformPhase ?? "none"}" style="left:${trem.x}%;top:${trem.y}%;width:${trem.w}%;height:${trem.h}%;--fleet-body:${theme.body};--fleet-stripe:${theme.stripe};--fleet-accent:${theme.accent}">
      <div class="train-doors ${doorsOpen ? "open" : ""}"><span></span><span></span></div>
    </div>
    <div class="scene-avatar facing-${facing}" style="--x:${avatarPos.x};--y:${avatarPos.y}"><span class="avatar-shadow"></span><span class="avatar-body"></span><span class="avatar-head"></span></div>
  `;
}

function renderStationWalk(): void {
  const header = stationSceneHeader();
  shell(`<header><span class="eyebrow">${header.eyebrow}</span><h1>${header.title}</h1></header><section class="station-scene" aria-label="Cena da estação">${renderSceneMarkup(sceneZones)}</section><footer>${keyHint(["↑", "↓", "←", "→"], "andar")}<div class="mouse-hint">🖱️ clique para andar</div></footer>`, "station-shell");
  cacheSceneEls();
}

function renderProgressBar(): string {
  const percent = Math.round(rideProgress(rideRoute, rideIndex) * 100);
  return `<div class="progress-fill-track"><div class="progress-fill" style="width:${percent}%"></div></div><section class="metro-map" aria-label="Progresso na linha"><div class="map-track" style="--stations:${rideRoute.length}">${rideRoute.map((station, i) => `<div class="map-station ${i < rideIndex ? "done" : i === rideIndex ? "current" : "upcoming"}"><i></i><span>${station}</span></div>`).join("")}</div></section>`;
}

function renderViagem(): void {
  const { current, next, isTerminal } = rideAnnouncementFor(rideRoute, rideIndex);
  const actions = isTerminal
    ? `<div class="choice-grid one"><button class="choice-card ride-card selected" data-ride-action="desembarcar"><div class="choice-icon">🚉</div><h2>Fim de linha</h2><p>Desembarcar</p></button></div>`
    : `<div class="choice-grid two"><button class="choice-card ride-card ${selection === 0 ? "selected" : ""}" data-ride-action="continuar"><div class="choice-icon">🚇</div><h2>Continuar viagem</h2><p>Seguir para ${next}</p></button><button class="choice-card ride-card ${selection === 1 ? "selected" : ""}" data-ride-action="desembarcar"><div class="choice-icon">🚶</div><h2>Desembarcar aqui</h2><p>Sair em ${current}</p></button></div>`;
  shell(`<header><span class="eyebrow">VIAGEM EM ANDAMENTO</span><h1>${current}</h1><p class="next-station">${isTerminal ? "Fim de linha" : `Próxima estação: <strong>${next}</strong>`}</p></header>${renderProgressBar()}${actions}<footer>${keyHint(["←", "→"], "escolher")}${keyHint(["ESPAÇO"], "confirmar")}</footer>`);
}

function renderChegada(): void {
  shell(`<div class="finish"><div class="finish-train">🚉</div><span class="eyebrow">CHEGAMOS!</span><h1>${arrivalStationName}</h1><p>Você concluiu sua viagem na ${line.name}</p><div class="finish-actions"><button class="finish-option selected" data-restart-action="nova"><span>↻</span><b>Nova viagem</b></button></div></div><footer>${keyHint(["ESPAÇO"], "confirmar")}</footer>`);
}

function cacheSceneEls(): void {
  avatarEl = app.querySelector(".scene-avatar");
  catracaEl = app.querySelector(".scene-catraca");
}

function updateAvatarDom(): void {
  if (!avatarEl) return;
  avatarEl.style.setProperty("--x", String(avatarPos.x));
  avatarEl.style.setProperty("--y", String(avatarPos.y));
  avatarEl.className = `scene-avatar facing-${facing}`;
}

function movementVector(): { dx: number; dy: number } {
  let dx = 0;
  let dy = 0;
  if (heldKeys.has("ArrowLeft")) dx -= 1;
  if (heldKeys.has("ArrowRight")) dx += 1;
  if (heldKeys.has("ArrowUp")) dy -= 1;
  if (heldKeys.has("ArrowDown")) dy += 1;
  if (dx !== 0 || dy !== 0) {
    if (dx !== 0 && dy !== 0) { dx *= Math.SQRT1_2; dy *= Math.SQRT1_2; }
    return { dx, dy };
  }
  if (moveTarget) {
    const vx = moveTarget.x - avatarPos.x;
    const vy = moveTarget.y - avatarPos.y;
    const len = Math.hypot(vx, vy);
    if (len < 0.01) return { dx: 0, dy: 0 };
    return { dx: vx / len, dy: vy / len };
  }
  return { dx: 0, dy: 0 };
}

function checkZoneTrigger(): void {
  const zone = zoneAt(avatarPos, sceneZones);
  if (zone === previousZoneId) return;
  previousZoneId = zone;
  if (zone === "catraca" && !ticketValidated) {
    ticketValidated = true;
    catracaEl?.classList.add("validado");
    const titleEl = app.querySelector<HTMLElement>(".station-shell h1");
    if (titleEl) titleEl.textContent = stationSceneHeader().title;
    speak("Bilhete validado!");
  } else if (zone === "plataforma" && !platformPhase) {
    reachPlatform();
  } else if (zone === "trem-portas" && doorsOpen) {
    boardTrain();
  }
}

function walkFrame(now: number): void {
  const deltaSeconds = Math.min(0.5, (now - lastFrameTime) / 1000);
  lastFrameTime = now;
  const { dx, dy } = movementVector();
  if (dx !== 0 || dy !== 0) {
    avatarPos = stepPosition(avatarPos, dx, dy, WALK_SPEED * deltaSeconds, SCENE_BOUNDS);
    facing = facingFor(dx, dy, facing);
    if (moveTarget && Math.hypot(moveTarget.x - avatarPos.x, moveTarget.y - avatarPos.y) < 1.5) moveTarget = null;
    updateAvatarDom();
    checkZoneTrigger();
  }
  rafId = requestAnimationFrame(walkFrame);
}

function startWalkLoop(): void {
  lastFrameTime = performance.now();
  rafId = requestAnimationFrame(walkFrame);
}

function stopWalkLoop(): void {
  cancelAnimationFrame(rafId);
}

function beginWalk(): void {
  avatarPos = { x: 50, y: SCENE_BOUNDS.maxY - 4 };
  facing = "up";
  ticketValidated = false;
  platformPhase = null;
  doorsOpen = false;
  previousZoneId = null;
  heldKeys = new Set();
  moveTarget = null;
  sceneZones = walkZonesFor(platformSideFor(line.id, line.stations[startStationIndex]));
  screen = "estacao-livre";
  render();
  startWalkLoop();
  speak(`Ande até a plataforma da estação ${line.stations[startStationIndex]}.`);
}

function reachPlatform(): void {
  platformPhase = "aguardando-trem";
  screen = "embarque";
  render();
  speak("Aguarde o trem chegar.");
  arrivalTimer1 = window.setTimeout(trainApproaching, 2200);
}

function trainApproaching(): void {
  platformPhase = "trem-chegando";
  trainAudio.setMotion(70, "cruising");
  render();
  speak("O trem está chegando.");
  arrivalTimer2 = window.setTimeout(openTrainDoors, 2600);
}

function openTrainDoors(): void {
  trainAudio.setMotion(0, "braking");
  trainAudio.stop();
  platformPhase = "portas-abertas";
  doorsOpen = true;
  render();
  speak("Portas abertas. Entre no trem quando quiser.");
}

function boardTrain(): void {
  stopWalkLoop();
  rideRoute = routeFor(line.stations, direction);
  rideIndex = rideRoute.indexOf(line.stations[startStationIndex]);
  screen = "viagem";
  selection = 0;
  render();
  speakRideStatus();
}

function continuarViagem(): void {
  rideIndex = nextStation(rideIndex, 1, rideRoute.length) ?? rideIndex;
  selection = 0;
  render();
  speakRideStatus();
}

function desembarcar(): void {
  arrivalStationName = rideAnnouncementFor(rideRoute, rideIndex).current;
  screen = "chegada";
  selection = 0;
  render();
  speak(`Você chegou em ${arrivalStationName}.`);
}

function novaViagem(): void {
  window.clearTimeout(arrivalTimer1);
  window.clearTimeout(arrivalTimer2);
  stopWalkLoop();
  trainAudio.stop();
  speechSynthesis.cancel();
  screen = "linha";
  selection = 0;
  render();
  announceSelection();
}

function rideConfirm(): void {
  const { isTerminal } = rideAnnouncementFor(rideRoute, rideIndex);
  if (isTerminal) { desembarcar(); return; }
  if (selection === 0) continuarViagem(); else desembarcar();
}

function confirmSelection(): void {
  if (screen === "linha") { line = lines[selection]; screen = "estacao"; selection = 0; render(); announceSelection(); }
  else if (screen === "estacao") { startStationIndex = selection; screen = "direcao"; selection = 0; render(); announceSelection(); }
  else if (screen === "direcao") { direction = selection === 0 ? 1 : -1; beginWalk(); }
  else if (screen === "viagem") rideConfirm();
  else if (screen === "chegada") novaViagem();
}

document.addEventListener("keydown", event => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].includes(event.code)) event.preventDefault();
  if (screen === "estacao-livre" || screen === "embarque") {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.code)) { heldKeys.add(event.code); moveTarget = null; }
    return;
  }
  const max = screenMax();
  if (event.code === "ArrowLeft") { selection = (selection - 1 + max) % max; render(); announceSelection(); return; }
  if (event.code === "ArrowRight") { selection = (selection + 1) % max; render(); announceSelection(); return; }
  if (event.code === "Space") confirmSelection();
});

document.addEventListener("keyup", event => {
  if (screen === "estacao-livre" || screen === "embarque") heldKeys.delete(event.code);
});

app.addEventListener("click", event => {
  const target = event.target as HTMLElement;
  const lineCard = target.closest<HTMLButtonElement>("[data-line-id]");
  if (lineCard) { line = lines.find(item => item.id === lineCard.dataset.lineId) ?? lines[0]; screen = "estacao"; selection = 0; render(); announceSelection(); return; }
  const stationRow = target.closest<HTMLButtonElement>("[data-station-index]");
  if (stationRow) { startStationIndex = Number(stationRow.dataset.stationIndex); screen = "direcao"; selection = 0; render(); announceSelection(); return; }
  const directionCard = target.closest<HTMLButtonElement>("[data-direction]");
  if (directionCard) { direction = Number(directionCard.dataset.direction) as 1 | -1; beginWalk(); return; }
  const rideAction = target.closest<HTMLButtonElement>("[data-ride-action]");
  if (rideAction) { if (rideAction.dataset.rideAction === "continuar") continuarViagem(); else desembarcar(); return; }
  const restartAction = target.closest<HTMLButtonElement>("[data-restart-action]");
  if (restartAction) { novaViagem(); return; }
  if (target.closest(".sound-button")) { speechEnabled = !speechEnabled; trainAudio.setEnabled(speechEnabled); speechSynthesis.cancel(); render(); return; }
  const scene = target.closest<HTMLElement>(".station-scene");
  if (scene && (screen === "estacao-livre" || screen === "embarque")) {
    const rect = scene.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    moveTarget = {
      x: Math.min(SCENE_BOUNDS.maxX, Math.max(SCENE_BOUNDS.minX, x)),
      y: Math.min(SCENE_BOUNDS.maxY, Math.max(SCENE_BOUNDS.minY, y))
    };
  }
});

render();
