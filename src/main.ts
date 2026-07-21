import "./style.css";
import { fleetImages, fleetThemes, lines, prototypeViewMedia, type FleetId } from "./data";
import { SAVE_KEY, distinctKeys, nextView, routeFor, type JourneyPhase, type SaveGame, type Screen, type View } from "./game-state";

const app = document.querySelector<HTMLDivElement>("#app")!;

let screen: Screen = loadSave() ? "home" : "line";
let selection = 0;
let line = lines[0];
let direction: 1 | -1 = 1;
let fleet: FleetId = "E";
let stationIndex = 0;
let phase: JourneyPhase = "travelling";
let view: View = "side";
let doorsOpen = false;
let actionReady = false;
let journeyTimer = 0;
let speechEnabled = true;
let travelSeconds = Number(localStorage.getItem("metro-aventura-travel-seconds")) || 8;
let settingsOpen = false;
let speedKmh = 0;
let speedTrend: "idle" | "accelerating" | "cruising" | "braking" = "idle";
let speedInterval = 0;
type DriveStage = "await-accelerate" | "accelerating" | "cruising" | "await-brake" | "braking";
let driveStage: DriveStage = "await-accelerate";
let randomDriveKeys = localStorage.getItem("metro-aventura-random-keys") === "true";
let accelerateKey = "A";
let brakeKey = "P";
const driveKeyPool = ["A", "S", "D", "F", "J", "K", "L", "P"];

function loadSave(): SaveGame | null {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY) || "null") as SaveGame | null; }
  catch { return null; }
}

function save(): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ lineId: line.id, fleetId: fleet, direction, stationIndex } satisfies SaveGame));
}

function speak(text: string): void {
  if (!speechEnabled || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pt-BR";
  utterance.rate = 0.78;
  utterance.pitch = 1;
  speechSynthesis.speak(utterance);
}

function currentRoute(): string[] { return routeFor(line.stations, direction); }

function keyHint(keys: string[], label: string): string {
  return `<div class="key-hint" aria-label="${label}">${keys.map(key => `<kbd>${key}</kbd>`).join("")}<span>${label}</span></div>`;
}

function speedTrendText(): string {
  if (speedTrend === "idle") return "PRONTO";
  if (speedTrend === "accelerating") return "ACELERANDO";
  if (speedTrend === "braking") return "PARANDO";
  return "EM MOVIMENTO";
}

function speedTrendIcon(): string {
  if (speedTrend === "idle") return "◆";
  if (speedTrend === "accelerating") return "▲";
  if (speedTrend === "braking") return "▼";
  return "●";
}

function shell(content: string, className = ""): void {
  app.innerHTML = `<main class="app-shell ${className}" style="--line:${line.color};--line-soft:${line.colorSoft}">${content}</main>`;
}

function render(): void {
  if (screen === "home") return renderHome();
  if (screen === "line") return renderLineSelect();
  if (screen === "direction") return renderDirection();
  if (screen === "fleet") return renderFleet();
  if (screen === "journey") return renderJourney();
  renderFinished();
}

function renderHome(): void {
  const saved = loadSave();
  const cards = [
    `<button class="choice-card continue ${selection === 0 ? "selected" : ""}" data-home-action="continue"><div class="choice-icon">🚇</div><h2>Continuar</h2><p>Voltar para a viagem</p></button>`,
    `<button class="choice-card ${selection === 1 ? "selected" : ""}" data-home-action="new"><div class="choice-icon">🔵 🟢 🔴</div><h2>Nova viagem</h2><p>Escolher outra linha</p></button>`
  ];
  shell(`<header><span class="eyebrow">METRÔ AVENTURA</span><h1>Vamos viajar?</h1></header><section class="choice-grid two">${cards.join("")}</section><footer>${keyHint(["←","→"], "escolher")}${keyHint(["ESPAÇO"], "confirmar")}</footer>`);
  if (!saved) { screen = "line"; render(); }
}

function renderLineSelect(): void {
  shell(`<header><span class="eyebrow">ESCOLHA A LINHA</span><h1>Qual trem vamos pegar?</h1></header><section class="choice-grid three">${lines.map((item, i) => `<button class="choice-card line-card ${selection === i ? "selected" : ""}" data-line-index="${i}" style="--card-color:${item.color};--card-soft:${item.colorSoft}" aria-label="Escolher ${item.name}"><div class="line-number">${item.id}</div><h2>${item.name.replace(`Linha ${item.id} `, "")}</h2><div class="track-line"></div></button>`).join("")}</section><footer>${keyHint(["←","→"], "escolher")}${keyHint(["ESPAÇO"], "confirmar")}</footer>`);
}

function renderDirection(): void {
  const options = [1, -1] as const;
  shell(`<header><span class="eyebrow">ESCOLHA O SENTIDO</span><h1>Para onde vamos?</h1></header><section class="choice-grid two">${options.map((dir, i) => { const route = routeFor(line.stations, dir); return `<button class="choice-card direction-card ${selection === i ? "selected" : ""}" data-direction="${dir}"><div class="train-arrow">${dir === 1 ? "🚇 →" : "← 🚇"}</div><h2>${route.at(-1)}</h2><p>Destino</p></button>`; }).join("")}</section><footer>${keyHint(["←","→"], "escolher")}${keyHint(["ESPAÇO"], "confirmar")}</footer>`);
}

function renderFleet(): void {
  shell(`<header><span class="eyebrow">ESCOLHA O TREM</span><h1>Qual frota você quer?</h1></header><section class="fleet-grid">${line.fleets.map((id, i) => `<button class="fleet-card ${selection === i ? "selected" : ""}" data-fleet-index="${i}" aria-label="Escolher frota ${id}"><img src="${fleetImages[id]}" alt="Frente do trem da frota ${id}"/><div><span>FROTA</span><strong>${id}</strong></div></button>`).join("")}</section><footer>${keyHint(["←","→"], "escolher")}${keyHint(["ESPAÇO"], "confirmar")}</footer>`);
}

function trainArt(): string {
  const next = currentRoute()[stationIndex + 1] ?? "Terminal";
  if (view === "cab") return `<div class="photo-scene cab-photo" style="--photo:url('${prototypeViewMedia.cab}')"><div class="motion-lines" style="--speed:${speedKmh}"></div><div class="photo-vignette"></div><div class="cab-status"><span>PRÓXIMA ESTAÇÃO</span><strong>${currentRoute()[stationIndex]}</strong></div><div class="speed-panel ${speedTrend}" style="--speed-angle:${-120 + speedKmh * 3.42}deg"><div class="speed-dial"><i></i><div><strong data-speed>${speedKmh}</strong><span>km/h</span></div></div><div class="speed-trend"><b class="trend-arrow">${speedTrendIcon()}</b><span data-trend>${speedTrendText()}</span></div><div class="power-bars">${Array.from({length: 7}, (_, i) => `<i class="${i < Math.ceil(speedKmh / 10) ? "active" : ""}"></i>`).join("")}</div></div><div class="fleet-chip">FROTA ${fleet}</div></div>`;
  if (view === "interior") return `<div class="photo-scene interior-photo" style="--photo:url('${prototypeViewMedia.interior}')"><div class="photo-vignette"></div><div class="interior-route"><span>AGORA</span><strong>${currentRoute()[stationIndex]}</strong><b>→</b><span>DEPOIS</span><strong>${next}</strong></div><div class="fleet-chip">FROTA ${fleet}</div></div>`;
  const theme = fleetThemes[fleet];
  return `<div class="platform illustrated-platform"><div class="station-sign">${currentRoute()[stationIndex]}</div><div class="train-side fleet-${fleet.toLowerCase()} front-${theme.front} ${phase === "travelling" || phase === "arriving" ? "moving" : ""}" style="--fleet-body:${theme.body};--fleet-stripe:${theme.stripe};--fleet-accent:${theme.accent}"><div class="train-nose"><div class="driver-window"></div><div class="headlight"></div></div><div class="window"></div><div class="train-doors ${doorsOpen ? "open" : ""}"><span></span><span></span></div><div class="window"></div><div class="train-doors second ${doorsOpen ? "open" : ""}"><span></span><span></span></div><div class="fleet-mark"><img src="${fleetImages[fleet]}" alt="Referência da frota ${fleet}"/><b>${fleet}</b></div></div>${doorsOpen && phase === "doors-open" ? `<div class="passenger-flow" aria-hidden="true"><div class="person exit person-one"><i></i><b></b></div><div class="person exit person-two"><i></i><b></b></div><div class="person enter person-three"><i></i><b></b></div><div class="person enter person-four"><i></i><b></b></div></div><div class="passenger-message"><span>↙</span> SAINDO <i></i> ENTRANDO <span>↗</span></div>` : ""}<div class="platform-edge"></div><div class="door-caption ${doorsOpen ? "open" : ""}">${doorsOpen ? "PORTAS ABERTAS" : "PORTAS FECHADAS"}</div></div>`;
}

function renderMap(): string {
  return `<section class="metro-map" aria-label="Mapa da viagem"><div class="map-track" style="--stations:${currentRoute().length}">${currentRoute().map((station, i) => `<div class="map-station ${i < stationIndex ? "done" : i === stationIndex ? "current" : "upcoming"}"><i></i><span>${station}</span></div>`).join("")}</div></section>`;
}

function renderSettings(): string {
  if (!settingsOpen) return "";
  return `<div class="settings-backdrop"><section class="settings-panel" role="dialog" aria-modal="true" aria-label="Configurações"><button class="close-settings" aria-label="Fechar configurações">×</button><span class="eyebrow">PAINEL ADULTO</span><h2>Tempo em velocidade</h2><div class="time-options">${[6,8,12,16].map(seconds => `<button class="time-option ${travelSeconds === seconds ? "selected" : ""}" data-seconds="${seconds}"><b>${seconds}</b><span>segundos</span></button>`).join("")}</div><h2 class="control-title">Teclas de condução</h2><div class="control-options"><button class="control-option ${!randomDriveKeys ? "selected" : ""}" data-random="false"><kbd>A</kbd><kbd>P</kbd><span>Sempre iguais</span></button><button class="control-option ${randomDriveKeys ? "selected" : ""}" data-random="true"><div class="random-letters">A Z M</div><span>Letras sorteadas</span></button></div><p>A alteração das teclas vale a partir do próximo trecho.</p></section></div>`;
}

function renderActionPrompt(): string {
  if (phase === "travelling" && driveStage === "await-accelerate") {
    return `<div class="action-prompt accelerate" role="status"><span class="action-symbol">▲</span><div><small>ACELERAR</small><kbd>${accelerateKey}</kbd></div></div>`;
  }
  if (phase === "travelling" && driveStage === "await-brake") {
    return `<div class="action-prompt brake" role="status"><span class="action-symbol">▼</span><div><small>PARAR</small><kbd>${brakeKey}</kbd></div></div>`;
  }
  if (phase === "waiting-open" && actionReady) {
    return `<div class="action-prompt doors" role="status"><span class="action-symbol">↔</span><div><small>ABRIR PORTAS</small><kbd>ESPAÇO</kbd></div></div>`;
  }
  if (phase === "waiting-close" && actionReady) {
    return `<div class="action-prompt doors close" role="status"><span class="action-symbol">→←</span><div><small>FECHAR PORTAS</small><kbd>ESPAÇO</kbd></div></div>`;
  }
  return "";
}

function phaseMessage(): { title: string; subtitle: string } {
  const route = currentRoute();
  if (phase === "travelling" && driveStage === "await-accelerate") return { title: `Próxima: ${route[stationIndex]}`, subtitle: `Aperte ${accelerateKey} para acelerar` };
  if (phase === "travelling" && driveStage === "await-brake") return { title: `Próxima: ${route[stationIndex]}`, subtitle: `Aperte ${brakeKey} para parar` };
  if (phase === "travelling") return { title: `Próxima: ${route[stationIndex]}`, subtitle: speedTrendText() };
  if (phase === "arriving") return { title: route[stationIndex], subtitle: "Chegando à estação" };
  if (phase === "waiting-open") return { title: route[stationIndex], subtitle: "Abra as portas" };
  if (phase === "doors-open") return { title: "Portas abertas", subtitle: "Passageiros entrando e saindo" };
  return { title: "Tudo pronto", subtitle: "Feche as portas" };
}

function renderJourney(): void {
  const message = phaseMessage();
  const cameraLocked = phase !== "travelling";
  const drivePrompt = phase === "travelling" && driveStage === "await-accelerate" ? keyHint([accelerateKey], "acelerar") : phase === "travelling" && driveStage === "await-brake" ? keyHint([brakeKey], "parar") : `<div class="calm-wait">●　●　●</div>`;
  shell(`<header class="journey-header"><div class="line-pill"><b>${line.id}</b>${line.name}</div><div class="station-copy"><span>${message.subtitle}</span><h1>${message.title}</h1></div><div class="header-actions"><button class="settings-button" aria-label="Abrir configurações">⚙️</button><button class="sound-button" aria-label="Ligar ou desligar voz">${speechEnabled ? "🔊" : "🔇"}</button></div></header><section class="game-stage view-${view}">${trainArt()}<div class="view-pill">${view === "side" ? "LATERAL" : view === "interior" ? "INTERIOR" : "CABINE"}</div>${renderActionPrompt()}</section>${renderMap()}<footer>${!cameraLocked ? keyHint(["↑","↓"], "mudar vista") : `<div class="camera-locked">👁️ Vista lateral na estação</div>`}${phase === "travelling" ? drivePrompt : (phase === "waiting-open" || phase === "waiting-close") && actionReady ? keyHint(["ESPAÇO"], phase === "waiting-open" ? "abrir portas" : "fechar portas") : `<div class="calm-wait">●　●　●</div>`}</footer>${renderSettings()}`, "journey-shell");
}

function renderFinished(): void {
  shell(`<div class="finish"><div class="finish-train">🚇</div><span class="eyebrow">CHEGAMOS!</span><h1>${currentRoute().at(-1)}</h1><p>Viagem completa na ${line.name}</p><div class="finish-actions"><button class="finish-option ${selection === 0 ? "selected" : ""}" data-finish-action="repeat"><span>↻</span><b>Repetir viagem</b></button><button class="finish-option ${selection === 1 ? "selected" : ""}" data-finish-action="new"><span>🔵 🟢 🔴</span><b>Escolher linha</b></button></div></div><footer>${keyHint(["←","→"], "escolher")}${keyHint(["ESPAÇO"], "confirmar")}</footer>`);
}

function announceSelection(): void {
  if (screen === "line") speak(lines[selection].name);
  if (screen === "direction") speak(`Destino ${routeFor(line.stations, selection === 0 ? 1 : -1).at(-1)}`);
  if (screen === "fleet") speak(`Frota ${line.fleets[selection]}`);
}

function startJourney(): void {
  stationIndex = 0; view = "cab"; doorsOpen = false; phase = "travelling"; screen = "journey";
  beginTravel();
}

function updateSpeedPanel(): void {
  const number = document.querySelector<HTMLElement>("[data-speed]");
  const panel = document.querySelector<HTMLElement>(".speed-panel");
  const trend = document.querySelector<HTMLElement>("[data-trend]");
  const arrow = document.querySelector<HTMLElement>(".trend-arrow");
  if (!number || !panel || !trend || !arrow) return;
  number.textContent = String(speedKmh);
  panel.className = `speed-panel ${speedTrend}`;
  panel.style.setProperty("--speed-angle", `${-120 + speedKmh * 3.42}deg`);
  trend.textContent = speedTrendText();
  arrow.textContent = speedTrendIcon();
  panel.querySelectorAll<HTMLElement>(".power-bars i").forEach((bar, index) => bar.classList.toggle("active", index < Math.ceil(speedKmh / 10)));
  document.querySelector<HTMLElement>(".motion-lines")?.style.setProperty("--speed", String(speedKmh));
}

function beginTravel(): void {
  window.clearTimeout(journeyTimer);
  window.clearInterval(speedInterval);
  if (randomDriveKeys) {
    [accelerateKey, brakeKey] = distinctKeys(driveKeyPool, Math.floor(Math.random() * driveKeyPool.length), Math.floor(Math.random() * driveKeyPool.length));
  } else { accelerateKey = "A"; brakeKey = "P"; }
  speedKmh = 0;
  speedTrend = "idle";
  driveStage = "await-accelerate";
  render();
  speak(`Aperte a tecla ${accelerateKey} para acelerar`);
}

function animateSpeed(from: number, to: number, duration: number, onDone: () => void): void {
  window.clearInterval(speedInterval);
  const startedAt = performance.now();
  speedInterval = window.setInterval(() => {
    const progress = Math.min(1, (performance.now() - startedAt) / duration);
    speedKmh = Math.round(from + (to - from) * progress);
    updateSpeedPanel();
    if (progress === 1) { window.clearInterval(speedInterval); onDone(); }
  }, 100);
}

function accelerateTrain(): void {
  driveStage = "accelerating"; speedTrend = "accelerating"; render();
  speak("Acelerando");
  animateSpeed(0, 70, 2600, () => {
    driveStage = "cruising"; speedTrend = "cruising"; speedKmh = 70; render();
    journeyTimer = window.setTimeout(() => {
      driveStage = "await-brake"; render(); speak(`Aperte a tecla ${brakeKey} para parar`);
    }, travelSeconds * 1000);
  });
}

function brakeTrain(): void {
  driveStage = "braking"; speedTrend = "braking"; render();
  speak("Parando o trem");
  animateSpeed(70, 0, 3000, arrive);
}

function arrive(): void {
  window.clearInterval(speedInterval); speedKmh = 0; speedTrend = "braking";
  phase = "arriving"; view = "side"; render();
  journeyTimer = window.setTimeout(() => { phase = "waiting-open"; actionReady = true; render(); speak(`Estação ${currentRoute()[stationIndex]}. Abra as portas.`); }, 1800);
}

function openDoors(): void {
  actionReady = false; doorsOpen = true; phase = "doors-open"; render();
  journeyTimer = window.setTimeout(() => { phase = "waiting-close"; actionReady = true; render(); speak("Feche as portas"); }, 2800);
}

function closeDoors(): void {
  actionReady = false; doorsOpen = false; render(); save();
  journeyTimer = window.setTimeout(() => {
    if (stationIndex >= currentRoute().length - 1) { localStorage.removeItem(SAVE_KEY); screen = "finished"; selection = 0; render(); speak("Chegamos ao terminal"); return; }
    stationIndex += 1; phase = "travelling"; view = "cab"; render(); speak(`Próxima estação, ${currentRoute()[stationIndex]}`);
    beginTravel();
  }, 1400);
}

function resumeJourney(saved: SaveGame): void {
  line = lines.find(item => item.id === saved.lineId) ?? lines[0]; fleet = saved.fleetId; direction = saved.direction;
  stationIndex = Math.min(saved.stationIndex + 1, line.stations.length - 1); startJourney();
}

document.addEventListener("keydown", event => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].includes(event.code) || event.key.toUpperCase() === accelerateKey || event.key.toUpperCase() === brakeKey) event.preventDefault();
  if (screen === "journey") {
    if (settingsOpen) { if (event.code === "Escape") { settingsOpen = false; render(); } return; }
    if (phase === "travelling" && (event.code === "ArrowUp" || event.code === "ArrowDown")) { view = nextView(view, event.code === "ArrowDown" ? 1 : -1); render(); }
    const pressed = event.key.toUpperCase();
    if (phase === "travelling" && driveStage === "await-accelerate" && pressed === accelerateKey) accelerateTrain();
    else if (phase === "travelling" && driveStage === "await-brake" && pressed === brakeKey) brakeTrain();
    if (event.code === "Space" && actionReady && phase === "waiting-open") openDoors();
    else if (event.code === "Space" && actionReady && phase === "waiting-close") closeDoors();
    return;
  }
  if (screen === "finished") {
    if (event.code === "ArrowLeft" || event.code === "ArrowRight") { selection = selection === 0 ? 1 : 0; render(); }
    if (event.code === "Space") { if (selection === 0) startJourney(); else { screen = "line"; selection = 0; render(); speak(lines[0].name); } }
    return;
  }
  const max = screen === "home" || screen === "direction" ? 2 : screen === "line" ? lines.length : line.fleets.length;
  if (event.code === "ArrowLeft") { selection = (selection - 1 + max) % max; render(); announceSelection(); }
  if (event.code === "ArrowRight") { selection = (selection + 1) % max; render(); announceSelection(); }
  if (event.code !== "Space") return;
  if (screen === "home") { const saved = loadSave(); if (selection === 0 && saved) resumeJourney(saved); else { screen = "line"; selection = 0; render(); speak(lines[0].name); } }
  else if (screen === "line") { line = lines[selection]; screen = "direction"; selection = 0; render(); announceSelection(); }
  else if (screen === "direction") { direction = selection === 0 ? 1 : -1; screen = "fleet"; selection = 0; render(); announceSelection(); }
  else if (screen === "fleet") { fleet = line.fleets[selection]; startJourney(); }
});

app.addEventListener("click", event => {
  const target = event.target as HTMLElement;
  const homeAction = target.closest<HTMLButtonElement>("[data-home-action]");
  if (homeAction) { const saved = loadSave(); if (homeAction.dataset.homeAction === "continue" && saved) resumeJourney(saved); else { screen = "line"; selection = 0; render(); speak(lines[0].name); } return; }
  const lineCard = target.closest<HTMLButtonElement>("[data-line-index]");
  if (lineCard) { selection = Number(lineCard.dataset.lineIndex); line = lines[selection]; screen = "direction"; selection = 0; render(); announceSelection(); return; }
  const directionCard = target.closest<HTMLButtonElement>("[data-direction]");
  if (directionCard) { direction = Number(directionCard.dataset.direction) as 1 | -1; screen = "fleet"; selection = 0; render(); announceSelection(); return; }
  const fleetCard = target.closest<HTMLButtonElement>("[data-fleet-index]");
  if (fleetCard) { selection = Number(fleetCard.dataset.fleetIndex); fleet = line.fleets[selection]; startJourney(); return; }
  const finishAction = target.closest<HTMLButtonElement>("[data-finish-action]");
  if (finishAction) { if (finishAction.dataset.finishAction === "repeat") startJourney(); else { screen = "line"; selection = 0; render(); speak(lines[0].name); } return; }
  if (target.closest(".sound-button")) { speechEnabled = !speechEnabled; speechSynthesis.cancel(); render(); return; }
  if (target.closest(".settings-button")) { settingsOpen = true; render(); return; }
  if (target.closest(".close-settings") || target.classList.contains("settings-backdrop")) { settingsOpen = false; render(); return; }
  const timeOption = target.closest<HTMLButtonElement>(".time-option");
  if (timeOption) { travelSeconds = Number(timeOption.dataset.seconds); localStorage.setItem("metro-aventura-travel-seconds", String(travelSeconds)); render(); }
  const controlOption = target.closest<HTMLButtonElement>(".control-option");
  if (controlOption) { randomDriveKeys = controlOption.dataset.random === "true"; localStorage.setItem("metro-aventura-random-keys", String(randomDriveKeys)); render(); }
});

render();
