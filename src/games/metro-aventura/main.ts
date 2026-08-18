import "./style.css";
import { allFirstSyllables, companies, connectingLines, firstSyllableFor, fleetImages, fleetThemes, lines, platformSideFor, prototypeViewMedia, type CompanyId, type FleetId } from "./data";
import { SAVE_KEY, distinctKeys, driveChoices, nextView, routeFor, type JourneyPhase, type SaveGame, type Screen, type View } from "./game-state";
import { trainAudio } from "./train-audio";

const app = document.querySelector<HTMLDivElement>("#app")!;

let screen: Screen = loadSave() ? "home" : "company";
let selection = 0;
let company: CompanyId = "metro";
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
let headerMenuOpen = false;
let speedKmh = 0;
let speedTrend: "idle" | "accelerating" | "cruising" | "braking" = "idle";
let speedInterval = 0;
type DriveStage = "await-accelerate" | "accelerating" | "cruising" | "await-brake" | "braking";
let driveStage: DriveStage = "await-accelerate";
let randomDriveKeys = localStorage.getItem("metro-aventura-random-keys") === "true";
let accelerateKey = "A";
let brakeKey = "P";
const driveKeyPool = ["A", "S", "D", "F", "J", "K", "L", "P"];
let accelerateChoices: string[] = [];
let brakeChoices: string[] = [];
type ChallengeKind = "station" | "syllable" | "platform-side";
let challengeKind: ChallengeKind | null = null;
let challengeOptions: string[] = [];
let challengeAnswer = "";
let challengeStationName = "";
let challengeStationEnabled = localStorage.getItem("metro-aventura-challenge-station") === "true";
let challengeSyllableEnabled = localStorage.getItem("metro-aventura-challenge-syllable") === "true";
let challengePlatformEnabled = localStorage.getItem("metro-aventura-challenge-platform") === "true";

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

function connectionAnnouncement(): string {
  const connections = connectingLines(currentRoute()[stationIndex], line.id);
  if (connections.length === 0) return "";
  const names = connections.map(item => `${item.name}, ${companies.find(c => c.id === item.companyId)?.name ?? ""}`);
  const joined = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} e ${names.at(-1)}`;
  return ` Acesso à ${joined}.`;
}

function speakPlatformArrival(): void {
  if (!speechEnabled || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const portuguese = new SpeechSynthesisUtterance(`Estação ${currentRoute()[stationIndex]}. Desembarque pelo ${platformSideLabel()}.${connectionAnnouncement()}`);
  portuguese.lang = "pt-BR";
  portuguese.rate = 0.78;
  const englishSide = currentPlatformSide() === "right" ? "right" : "left";
  const english = new SpeechSynthesisUtterance(`Exit on the ${englishSide} side.`);
  english.lang = "en-US";
  english.rate = 0.76;
  const instruction = new SpeechSynthesisUtterance("Abra as portas.");
  instruction.lang = "pt-BR";
  instruction.rate = 0.78;
  speechSynthesis.speak(portuguese);
  speechSynthesis.speak(english);
  speechSynthesis.speak(instruction);
}

function currentRoute(): string[] { return routeFor(line.stations, direction); }
function companyLines() { return lines.filter(item => item.companyId === company); }
function lineFleets(): FleetId[] { return line.fleets; }
function companyLogo(): string { return companies.find(item => item.id === company)?.logo ?? companies[0].logo; }
function companyName(): string { return companies.find(item => item.id === company)?.name ?? companies[0].name; }

function currentPlatformSide(): "right" | "left" {
  return platformSideFor(line.id, currentRoute()[stationIndex]);
}

function platformSideLabel(): string {
  return currentPlatformSide() === "right" ? "lado direito" : "lado esquerdo";
}

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
  if (screen === "home") renderHome();
  else if (screen === "company") renderCompany();
  else if (screen === "line") renderLineSelect();
  else if (screen === "direction") renderDirection();
  else if (screen === "fleet") renderFleet();
  else if (screen === "journey") renderJourney();
  else renderFinished();
  [...app.querySelectorAll(".selected")].find(el => !el.closest(".settings-panel"))?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
}

function renderHome(): void {
  const saved = loadSave();
  const cards = [
    `<button class="choice-card continue ${selection === 0 ? "selected" : ""}" data-home-action="continue"><div class="choice-icon">🚇</div><h2>Continuar</h2><p>Voltar para a viagem</p></button>`,
    `<button class="choice-card ${selection === 1 ? "selected" : ""}" data-home-action="new"><div class="choice-icon">🔵 🟢 🔴</div><h2>Nova viagem</h2><p>Escolher outra linha</p></button>`
  ];
  shell(`<header><span class="eyebrow">METRÔ AVENTURA</span><h1>Vamos viajar?</h1></header><section class="choice-grid two">${cards.join("")}</section><footer>${keyHint(["←","→"], "escolher")}${keyHint(["ESPAÇO"], "confirmar")}</footer>`);
  if (!saved) { screen = "company"; render(); }
}

function renderCompany(): void {
  shell(`<header><span class="eyebrow">ESCOLHA A COMPANHIA</span><h1>Com qual trem vamos viajar?</h1></header><section class="company-grid">${companies.map((item, i) => `<button class="company-card ${selection === i ? "selected" : ""}" data-company-index="${i}" aria-label="Escolher ${item.name}"><img src="${item.logo}" alt="Logotipo ${item.name}"/><h2>${item.name}</h2></button>`).join("")}</section><footer>${keyHint(["←","→"], "escolher")}${keyHint(["ESPAÇO"], "confirmar")}</footer>`);
}

function renderLineSelect(): void {
  const choices = companyLines();
  const gridClass = choices.length > 2 ? "multi" : "two";
  const gridStyle = choices.length > 2 ? ` style="--cols:${Math.min(choices.length, 4)}"` : "";
  shell(`<header><span class="eyebrow">ESCOLHA A LINHA</span><h1>Onde vamos viajar?</h1></header><section class="choice-grid ${gridClass}"${gridStyle}>${choices.map((item, i) => `<button class="choice-card line-card ${selection === i ? "selected" : ""}" data-line-id="${item.id}" style="--card-color:${item.color};--card-soft:${item.colorSoft}" aria-label="Escolher ${item.name}"><div class="line-number">${item.id}</div><h2>${item.name.replace(`Linha ${item.id} `, "")}</h2><div class="track-line"></div></button>`).join("")}</section><footer>${keyHint(["←","→"], "escolher")}${keyHint(["ESPAÇO"], "confirmar")}</footer>`);
}

function renderDirection(): void {
  const options = [1, -1] as const;
  shell(`<header><span class="eyebrow">ESCOLHA O SENTIDO</span><h1>Para onde vamos?</h1></header><section class="choice-grid two">${options.map((dir, i) => { const route = routeFor(line.stations, dir); return `<button class="choice-card direction-card ${selection === i ? "selected" : ""}" data-direction="${dir}"><div class="train-arrow">${dir === 1 ? "🚇 →" : "← 🚇"}</div><h2>${route.at(-1)}</h2><p>Destino</p></button>`; }).join("")}</section><footer>${keyHint(["←","→"], "escolher")}${keyHint(["ESPAÇO"], "confirmar")}</footer>`);
}

function renderFleet(): void {
  const fleets = lineFleets();
  shell(`<header><span class="eyebrow">ESCOLHA O TREM</span><h1>Qual frota você quer?</h1></header><section class="fleet-grid company-${company}">${fleets.map((id, i) => `<button class="fleet-card ${selection === i ? "selected" : ""}" data-fleet-id="${id}" aria-label="Escolher frota ${id}"><img src="${fleetImages[id]}" alt="Trem da frota ${id}"/><div><span>${company === "cptm" ? "SÉRIE" : "FROTA"}</span><strong>${id}</strong></div></button>`).join("")}</section><footer>${keyHint(["←","→"], "escolher")}${keyHint(["ESPAÇO"], "confirmar")}</footer>`);
}

function trainArt(): string {
  const next = currentRoute()[stationIndex + 1] ?? "Terminal";
  const fleetLabel = company === "cptm" ? `SÉRIE ${fleet}` : `FROTA ${fleet}`;
  if (view === "cab") return `<div class="photo-scene cab-photo" style="--photo:url('${prototypeViewMedia.cab}')"><div class="motion-lines" style="--speed:${speedKmh}"></div><div class="photo-vignette"></div><div class="cab-status"><span>PRÓXIMA ESTAÇÃO</span><strong>${currentRoute()[stationIndex]}</strong></div><div class="speed-panel ${speedTrend}" style="--speed-angle:${-120 + speedKmh * 3.42}deg"><div class="speed-dial"><i></i><div><strong data-speed>${speedKmh}</strong><span>km/h</span></div></div><div class="speed-trend"><b class="trend-arrow">${speedTrendIcon()}</b><span data-trend>${speedTrendText()}</span></div><div class="power-bars">${Array.from({length: 7}, (_, i) => `<i class="${i < Math.ceil(speedKmh / 10) ? "active" : ""}"></i>`).join("")}</div></div><div class="fleet-chip">${fleetLabel}</div></div>`;
  if (view === "interior") return `<div class="photo-scene interior-photo" style="--photo:url('${prototypeViewMedia.interior}')"><div class="photo-vignette"></div><div class="interior-route"><span>AGORA</span><strong>${currentRoute()[stationIndex]}</strong><b>→</b><span>DEPOIS</span><strong>${next}</strong></div><div class="fleet-chip">${fleetLabel}</div></div>`;
  const theme = fleetThemes[fleet];
  return `<div class="platform illustrated-platform"><div class="station-sign">${currentRoute()[stationIndex]}</div><div class="platform-side ${currentPlatformSide()}"><span>${currentPlatformSide() === "right" ? "→" : "←"}</span><b>DESEMBARQUE</b><small>${platformSideLabel()}</small></div><div class="train-side fleet-${fleet.toLowerCase()} front-${theme.front} ${phase === "travelling" || phase === "arriving" ? "moving" : ""}" style="--fleet-body:${theme.body};--fleet-stripe:${theme.stripe};--fleet-accent:${theme.accent}"><div class="train-nose"><div class="driver-window"></div><div class="headlight"></div></div><div class="window"></div><div class="train-doors ${doorsOpen ? "open" : ""}"><span></span><span></span></div><div class="window"></div><div class="train-doors second ${doorsOpen ? "open" : ""}"><span></span><span></span></div><div class="fleet-mark company-${company}"><img src="${companyLogo()}" alt="Logotipo ${companyName()}"/><b>${fleet}</b></div></div>${doorsOpen && phase === "doors-open" ? `<div class="passenger-flow" aria-hidden="true"><div class="person exit person-one"><i></i><b></b></div><div class="person exit person-two"><i></i><b></b></div><div class="person enter person-three"><i></i><b></b></div><div class="person enter person-four"><i></i><b></b></div></div><div class="passenger-message"><span>↙</span> SAINDO <i></i> ENTRANDO <span>↗</span></div>` : ""}<div class="platform-edge"></div><div class="door-caption ${doorsOpen ? "open" : ""}">${doorsOpen ? "PORTAS ABERTAS" : "PORTAS FECHADAS"}</div></div>`;
}

function renderMap(): string {
  return `<section class="metro-map" aria-label="Mapa da viagem"><div class="map-track" style="--stations:${currentRoute().length}">${currentRoute().map((station, i) => `<div class="map-station ${i < stationIndex ? "done" : i === stationIndex ? "current" : "upcoming"}"><i></i><span>${station}</span></div>`).join("")}</div></section>`;
}

function renderSettings(): string {
  if (!settingsOpen) return "";
  return `<div class="settings-backdrop"><section class="settings-panel" role="dialog" aria-modal="true" aria-label="Configurações"><button class="close-settings" aria-label="Fechar configurações">×</button><span class="eyebrow">PAINEL ADULTO</span><h2>Tempo em velocidade</h2><div class="time-options">${[6,8,12,16].map(seconds => `<button class="time-option ${travelSeconds === seconds ? "selected" : ""}" data-seconds="${seconds}"><b>${seconds}</b><span>segundos</span></button>`).join("")}</div><h2 class="control-title">Teclas de condução</h2><div class="control-options"><button class="control-option ${!randomDriveKeys ? "selected" : ""}" data-random="false"><kbd>A</kbd><kbd>P</kbd><span>Sempre iguais</span></button><button class="control-option ${randomDriveKeys ? "selected" : ""}" data-random="true"><div class="random-letters">A Z M</div><span>Letras sorteadas</span></button></div><p>A alteração das teclas vale a partir do próximo trecho.</p><h2 class="control-title">Desafios extras</h2><div class="control-options challenge-options"><button class="control-option ${challengeStationEnabled ? "selected" : ""}" data-challenge-toggle="station"><span class="challenge-icon">🚉</span><span>Estação</span></button><button class="control-option ${challengeSyllableEnabled ? "selected" : ""}" data-challenge-toggle="syllable"><span class="challenge-icon">🔤</span><span>Sílaba</span></button><button class="control-option ${challengePlatformEnabled ? "selected" : ""}" data-challenge-toggle="platform"><span class="challenge-icon">↔</span><span>Lado da porta</span></button></div><p>Um desafio sorteado entre os ativos aparece depois de fechar as portas.</p></section></div>`;
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

function renderTouchActions(): string {
  if (phase === "travelling" && driveStage === "await-accelerate") {
    return `<div class="touch-actions drive" role="group" aria-label="Toque na tecla para acelerar">${accelerateChoices.map(key => `<button class="touch-key" data-drive-guess="${key}">${key}</button>`).join("")}</div>`;
  }
  if (phase === "travelling" && driveStage === "await-brake") {
    return `<div class="touch-actions drive" role="group" aria-label="Toque na tecla para parar">${brakeChoices.map(key => `<button class="touch-key" data-drive-guess="${key}">${key}</button>`).join("")}</div>`;
  }
  if (phase === "waiting-open" && actionReady) {
    return `<div class="touch-actions doors"><button class="touch-door-button" data-door-action="open">↔ Abrir portas</button></div>`;
  }
  if (phase === "waiting-close" && actionReady) {
    return `<div class="touch-actions doors"><button class="touch-door-button" data-door-action="close">→← Fechar portas</button></div>`;
  }
  return "";
}

function challengeSpokenLabel(value: string): string {
  if (challengeKind === "platform-side") return value === "right" ? "Direita" : "Esquerda";
  return value;
}

function renderChallengeControls(): string {
  return `<div class="challenge-controls"><button class="challenge-select-btn" data-challenge-confirm="true" aria-label="Selecionar esta opção"><span class="challenge-btn-icon">✓</span><span>Selecionar</span></button></div>`;
}

function renderChallenge(): string {
  if (challengeKind === "station") {
    const options = challengeOptions.map((option, index) => `<button class="station-option ${index === selection ? "selected" : ""}" data-challenge-highlight="${index}">${option}</button>`).join("");
    return `<div class="challenge-panel"><div class="station-options" role="group" aria-label="Escolha a próxima estação">${options}</div>${renderChallengeControls()}</div>`;
  }
  if (challengeKind === "syllable") {
    const options = challengeOptions.map((option, index) => `<button class="touch-key ${index === selection ? "selected" : ""}" data-challenge-highlight="${index}">${option}</button>`).join("");
    return `<div class="challenge-panel"><div class="challenge-word">${challengeStationName}</div><div class="syllable-options" role="group" aria-label="Escolha a sílaba">${options}</div>${renderChallengeControls()}</div>`;
  }
  if (challengeKind === "platform-side") {
    const options = challengeOptions.map((option, index) => `<button class="side-option ${index === selection ? "selected" : ""}" data-challenge-highlight="${index}"><span class="side-arrow">${option === "right" ? "→" : "←"}</span><span class="side-label">${option === "right" ? "Direita" : "Esquerda"}</span></button>`).join("");
    return `<div class="challenge-panel"><div class="side-options" role="group" aria-label="Escolha o lado da porta">${options}</div>${renderChallengeControls()}</div>`;
  }
  return "";
}

function phaseMessage(): { title: string; subtitle: string } {
  const route = currentRoute();
  if (phase === "challenge" && challengeKind === "station") return { title: "Qual é a próxima estação?", subtitle: "Toque na estação certa" };
  if (phase === "challenge" && challengeKind === "syllable") return { title: "Qual sílaba começa o nome?", subtitle: "Toque na sílaba certa" };
  if (phase === "challenge" && challengeKind === "platform-side") return { title: "De que lado abrem as portas?", subtitle: "Toque no lado certo" };
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
  const stageBody = phase === "challenge" ? renderChallenge() : `${trainArt()}<div class="view-pill">${view === "side" ? "LATERAL" : view === "interior" ? "INTERIOR" : "CABINE"}</div>${renderActionPrompt()}`;
  shell(`<header class="journey-header"><div class="line-pill"><b>${line.id}</b>${line.name}</div><div class="station-copy"><span>${message.subtitle}</span><h1>${message.title}</h1></div><div class="header-menu"><button class="menu-toggle" aria-label="${headerMenuOpen ? "Fechar menu" : "Abrir menu"}" aria-expanded="${headerMenuOpen}">${headerMenuOpen ? "✕" : "☰"}</button><div class="header-actions ${headerMenuOpen ? "open" : ""}"><button class="home-button" aria-label="Voltar à tela inicial" title="Tela inicial">🏠</button><button class="settings-button" aria-label="Abrir configurações">⚙️</button><button class="sound-button" aria-label="Ligar ou desligar voz">${speechEnabled ? "🔊" : "🔇"}</button></div></div></header><section class="game-stage view-${view} ${phase === "challenge" ? "challenge-active" : ""}">${stageBody}</section>${renderMap()}<footer>${!cameraLocked ? keyHint(["↑","↓"], "mudar vista") : `<div class="camera-locked">👁️ Vista lateral na estação</div>`}${phase === "challenge" ? keyHint(["←","→"], "escolher") + keyHint(["ESPAÇO"], "confirmar") : phase === "travelling" ? drivePrompt : (phase === "waiting-open" || phase === "waiting-close") && actionReady ? keyHint(["ESPAÇO"], phase === "waiting-open" ? "abrir portas" : "fechar portas") : `<div class="calm-wait">●　●　●</div>`}</footer>${renderTouchActions()}${renderSettings()}`, "journey-shell");
}

function goToStart(): void {
  window.clearTimeout(journeyTimer);
  window.clearInterval(speedInterval);
  trainAudio.stop();
  speechSynthesis.cancel();
  settingsOpen = false;
  doorsOpen = false;
  actionReady = false;
  screen = "company";
  selection = 0;
  render();
  announceSelection();
}

function renderFinished(): void {
  shell(`<div class="finish"><div class="finish-train">🚇</div><span class="eyebrow">CHEGAMOS!</span><h1>${currentRoute().at(-1)}</h1><p>Viagem completa na ${line.name}</p><div class="finish-actions"><button class="finish-option ${selection === 0 ? "selected" : ""}" data-finish-action="repeat"><span>↻</span><b>Repetir viagem</b></button><button class="finish-option ${selection === 1 ? "selected" : ""}" data-finish-action="new"><span>🚇</span><b>Escolher companhia</b></button></div></div><footer>${keyHint(["←","→"], "escolher")}${keyHint(["ESPAÇO"], "confirmar")}</footer>`);
}

function announceSelection(): void {
  if (screen === "company") speak(companies[selection].name);
  if (screen === "fleet") speak(`${company === "cptm" ? "Série" : "Frota"} ${lineFleets()[selection]}`);
  if (screen === "line") speak(companyLines()[selection].name);
  if (screen === "direction") speak(`Destino ${routeFor(line.stations, selection === 0 ? 1 : -1).at(-1)}`);
}

function startJourney(startAt = 0): void {
  stationIndex = startAt; view = "cab"; doorsOpen = false; phase = "travelling"; screen = "journey";
  beginTravel();
}

function updateSpeedPanel(): void {
  trainAudio.setMotion(speedKmh, speedTrend);
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
  accelerateChoices = driveChoices(driveKeyPool, accelerateKey, Math.floor(Math.random() * driveKeyPool.length));
  brakeChoices = driveChoices(driveKeyPool, brakeKey, Math.floor(Math.random() * driveKeyPool.length));
  speedKmh = 0;
  speedTrend = "idle";
  trainAudio.stop();
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
  driveStage = "accelerating"; speedTrend = "accelerating"; trainAudio.setMotion(0, "accelerating"); render();
  speak(`Acelerando. Próxima estação: ${currentRoute()[stationIndex]}`);
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
  trainAudio.stop();
  phase = "arriving"; view = "side"; render();
  journeyTimer = window.setTimeout(() => { phase = "waiting-open"; actionReady = true; render(); speakPlatformArrival(); }, 1800);
}

function openDoors(): void {
  actionReady = false; doorsOpen = true; phase = "doors-open"; render();
  journeyTimer = window.setTimeout(() => { phase = "waiting-close"; actionReady = true; render(); speak("Feche as portas"); }, 2800);
}

function enabledChallengeKinds(): ChallengeKind[] {
  const kinds: ChallengeKind[] = [];
  if (challengeStationEnabled) kinds.push("station");
  if (challengeSyllableEnabled) kinds.push("syllable");
  if (challengePlatformEnabled) kinds.push("platform-side");
  return kinds;
}

function departNextStation(): void {
  phase = "travelling"; view = "cab"; render(); speak(`Próxima estação, ${currentRoute()[stationIndex]}`);
  beginTravel();
}

function beginChallenge(kind: ChallengeKind): void {
  challengeKind = kind; phase = "challenge"; selection = 0; view = "side";
  const correctStation = currentRoute()[stationIndex];
  challengeStationName = correctStation;
  if (kind === "station") {
    challengeAnswer = correctStation;
    challengeOptions = driveChoices(currentRoute(), correctStation, Math.floor(Math.random() * currentRoute().length));
    render();
    speak(`Próxima estação: ${correctStation}`);
  } else if (kind === "syllable") {
    challengeAnswer = firstSyllableFor(correctStation);
    challengeOptions = driveChoices(allFirstSyllables, challengeAnswer, Math.floor(Math.random() * allFirstSyllables.length));
    render();
    speak(`Próxima estação: ${correctStation}`);
  } else {
    challengeAnswer = platformSideFor(line.id, correctStation);
    challengeOptions = ["left", "right"];
    render();
    speak(`Em ${correctStation}, as portas abrem do lado ${challengeAnswer === "right" ? "direito" : "esquerdo"}.`);
  }
}

function confirmChallenge(picked: string, buttonEl?: HTMLElement): void {
  if (picked !== challengeAnswer) {
    buttonEl?.classList.add("wrong");
    window.setTimeout(() => buttonEl?.classList.remove("wrong"), 400);
    speak("Não é essa. Tente de novo.");
    return;
  }
  challengeKind = null;
  departNextStation();
}

function closeDoors(): void {
  actionReady = false; doorsOpen = false; render(); save();
  journeyTimer = window.setTimeout(() => {
    if (stationIndex >= currentRoute().length - 1) { localStorage.removeItem(SAVE_KEY); screen = "finished"; selection = 0; render(); speak("Chegamos ao terminal"); return; }
    stationIndex += 1;
    const kinds = enabledChallengeKinds();
    if (kinds.length === 0) { departNextStation(); return; }
    beginChallenge(kinds[Math.floor(Math.random() * kinds.length)]);
  }, 1400);
}

function resumeJourney(saved: SaveGame): void {
  line = lines.find(item => item.id === saved.lineId) ?? lines[0]; fleet = line.fleets.includes(saved.fleetId) ? saved.fleetId : line.fleets[0]; direction = saved.direction;
  company = line.companyId;
  startJourney(Math.min(saved.stationIndex + 1, line.stations.length - 1));
}

document.addEventListener("keydown", event => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].includes(event.code) || event.key.toUpperCase() === accelerateKey || event.key.toUpperCase() === brakeKey) event.preventDefault();
  if (screen === "journey") {
    if (settingsOpen) { if (event.code === "Escape") { settingsOpen = false; render(); } return; }
    if (phase === "challenge") {
      if (event.code === "ArrowLeft") { selection = (selection - 1 + challengeOptions.length) % challengeOptions.length; render(); speak(challengeSpokenLabel(challengeOptions[selection])); }
      else if (event.code === "ArrowRight") { selection = (selection + 1) % challengeOptions.length; render(); speak(challengeSpokenLabel(challengeOptions[selection])); }
      else if (event.code === "Space") confirmChallenge(challengeOptions[selection]);
      return;
    }
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
    if (event.code === "Space") { if (selection === 0) startJourney(); else { screen = "company"; selection = 0; render(); announceSelection(); } }
    return;
  }
  const max = screen === "home" || screen === "direction" ? 2 : screen === "company" ? companies.length : screen === "fleet" ? lineFleets().length : companyLines().length;
  if (event.code === "ArrowLeft") { selection = (selection - 1 + max) % max; render(); announceSelection(); }
  if (event.code === "ArrowRight") { selection = (selection + 1) % max; render(); announceSelection(); }
  if (event.code !== "Space") return;
  if (screen === "home") { const saved = loadSave(); if (selection === 0 && saved) resumeJourney(saved); else { screen = "company"; selection = 0; render(); announceSelection(); } }
  else if (screen === "company") { company = companies[selection].id; screen = "line"; selection = 0; render(); announceSelection(); }
  else if (screen === "line") { line = companyLines()[selection]; screen = "fleet"; selection = 0; render(); announceSelection(); }
  else if (screen === "fleet") { fleet = lineFleets()[selection]; screen = "direction"; selection = 0; render(); announceSelection(); }
  else if (screen === "direction") { direction = selection === 0 ? 1 : -1; startJourney(); }
});

app.addEventListener("click", event => {
  const target = event.target as HTMLElement;
  const homeAction = target.closest<HTMLButtonElement>("[data-home-action]");
  if (homeAction) { const saved = loadSave(); if (homeAction.dataset.homeAction === "continue" && saved) resumeJourney(saved); else { screen = "company"; selection = 0; render(); announceSelection(); } return; }
  const companyCard = target.closest<HTMLButtonElement>("[data-company-index]");
  if (companyCard) { company = companies[Number(companyCard.dataset.companyIndex)].id; screen = "line"; selection = 0; render(); announceSelection(); return; }
  const lineCard = target.closest<HTMLButtonElement>("[data-line-id]");
  if (lineCard) { line = lines.find(item => item.id === lineCard.dataset.lineId) ?? lines[0]; screen = "fleet"; selection = 0; render(); announceSelection(); return; }
  const directionCard = target.closest<HTMLButtonElement>("[data-direction]");
  if (directionCard) { direction = Number(directionCard.dataset.direction) as 1 | -1; startJourney(); return; }
  const fleetCard = target.closest<HTMLButtonElement>("[data-fleet-id]");
  if (fleetCard) { fleet = fleetCard.dataset.fleetId as FleetId; screen = "direction"; selection = 0; render(); announceSelection(); return; }
  const challengeHighlight = target.closest<HTMLButtonElement>("[data-challenge-highlight]");
  if (challengeHighlight) { selection = Number(challengeHighlight.dataset.challengeHighlight); render(); speak(challengeSpokenLabel(challengeOptions[selection])); return; }
  if (target.closest("[data-challenge-confirm]")) {
    const highlighted = app.querySelector<HTMLButtonElement>(`[data-challenge-highlight="${selection}"]`);
    confirmChallenge(challengeOptions[selection], highlighted ?? undefined);
    return;
  }
  const driveGuess = target.closest<HTMLButtonElement>("[data-drive-guess]");
  if (driveGuess) {
    const guess = driveGuess.dataset.driveGuess;
    if (phase === "travelling" && driveStage === "await-accelerate" && guess === accelerateKey) accelerateTrain();
    else if (phase === "travelling" && driveStage === "await-brake" && guess === brakeKey) brakeTrain();
    else { driveGuess.classList.add("wrong"); window.setTimeout(() => driveGuess.classList.remove("wrong"), 400); }
    return;
  }
  const doorAction = target.closest<HTMLButtonElement>("[data-door-action]");
  if (doorAction) {
    if (doorAction.dataset.doorAction === "open" && actionReady && phase === "waiting-open") openDoors();
    else if (doorAction.dataset.doorAction === "close" && actionReady && phase === "waiting-close") closeDoors();
    return;
  }
  const finishAction = target.closest<HTMLButtonElement>("[data-finish-action]");
  if (finishAction) { if (finishAction.dataset.finishAction === "repeat") startJourney(); else { screen = "company"; selection = 0; render(); announceSelection(); } return; }
  if (target.closest(".menu-toggle")) { headerMenuOpen = !headerMenuOpen; render(); return; }
  if (target.closest(".home-button")) { headerMenuOpen = false; goToStart(); return; }
  if (target.closest(".sound-button")) { headerMenuOpen = false; speechEnabled = !speechEnabled; trainAudio.setEnabled(speechEnabled); speechSynthesis.cancel(); render(); return; }
  if (target.closest(".settings-button")) { headerMenuOpen = false; settingsOpen = true; render(); return; }
  if (target.closest(".close-settings") || target.classList.contains("settings-backdrop")) { settingsOpen = false; render(); return; }
  const timeOption = target.closest<HTMLButtonElement>(".time-option");
  if (timeOption) { travelSeconds = Number(timeOption.dataset.seconds); localStorage.setItem("metro-aventura-travel-seconds", String(travelSeconds)); render(); }
  const challengeToggle = target.closest<HTMLButtonElement>("[data-challenge-toggle]");
  if (challengeToggle) {
    const kind = challengeToggle.dataset.challengeToggle;
    if (kind === "station") { challengeStationEnabled = !challengeStationEnabled; localStorage.setItem("metro-aventura-challenge-station", String(challengeStationEnabled)); }
    else if (kind === "syllable") { challengeSyllableEnabled = !challengeSyllableEnabled; localStorage.setItem("metro-aventura-challenge-syllable", String(challengeSyllableEnabled)); }
    else { challengePlatformEnabled = !challengePlatformEnabled; localStorage.setItem("metro-aventura-challenge-platform", String(challengePlatformEnabled)); }
    render();
    return;
  }
  const controlOption = target.closest<HTMLButtonElement>(".control-option");
  if (controlOption) { randomDriveKeys = controlOption.dataset.random === "true"; localStorage.setItem("metro-aventura-random-keys", String(randomDriveKeys)); render(); }
});

render();
