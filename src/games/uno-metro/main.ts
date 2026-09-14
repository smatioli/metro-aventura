import "./style.css";
import { lineColors, numberFleetPhotos, type LineColor } from "./data";
import {
  canPlay,
  dealGame,
  drawCard,
  hasPlayableCard,
  isWon,
  playCard,
  topCard,
  type GameState,
  type UnoCard
} from "./logic";

type Screen = "welcome" | "playing" | "finished";

const app = document.querySelector<HTMLDivElement>("#app")!;
let screen: Screen = "welcome";
let state: GameState = dealGame();
let focusIndex = 0;
let choosingColorFor: number | null = null;
let colorFocusIndex = 0;
let speechEnabled = true;
let advanceTimer = 0;

function speak(text: string): void {
  if (!speechEnabled || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pt-BR";
  utterance.rate = 0.85;
  speechSynthesis.speak(utterance);
}

function lineInfo(color: LineColor) {
  return lineColors.find(line => line.id === color)!;
}

function cardLabel(card: UnoCard): string {
  if (card.kind === "conexao") return "Conexão, escolha uma linha";
  if (card.kind === "expresso") return `Expresso da linha ${lineInfo(card.color as LineColor).label}`;
  return `${card.value}, linha ${lineInfo(card.color as LineColor).label}`;
}

function cardStyleVar(card: UnoCard): string {
  if (card.kind === "conexao") return "--card:#2c2f45";
  return `--card:${lineInfo(card.color as LineColor).color}`;
}

function cardFace(card: UnoCard): string {
  if (card.kind === "conexao") {
    return `<span class="card-oval"><span class="card-icon">🔀</span></span><b class="card-name">Conexão</b>`;
  }
  if (card.kind === "expresso") {
    return `<span class="card-oval"><span class="card-icon">🚄</span></span><b class="card-name">Expresso</b>`;
  }
  const photo = numberFleetPhotos[card.value!];
  return `<span class="corner-number">${card.value}</span>
    <span class="card-oval"><img src="${photo.src}" alt="${photo.alt}"></span>
    <span class="corner-number bottom">${card.value}</span>`;
}

function topNav(title: string): string {
  return `<nav>
    <div class="nav-left">
      ${screen !== "welcome" ? `<a class="home-button" href="/" aria-label="Voltar para a home">🏠</a>` : ""}
      <button class="back-button" data-action="back" aria-label="Voltar">‹ JOGOS</button>
    </div>
    <div class="brand"><i>✦</i> ${title}</div>
    <button class="sound-button" data-action="sound" aria-label="Ligar ou desligar voz">${speechEnabled ? "🔊" : "🔇"}</button>
  </nav>`;
}

function renderWelcome(): void {
  app.innerHTML = `<main class="uno-shell welcome">
    ${topNav("UNO DO METRÔ")}
    <header>
      <p class="eyebrow">UNO DO METRÔ</p>
      <h1>Uno do<br><em>Metrô</em></h1>
      <p>Jogue suas cartas no monte combinando a linha (cor) ou o número. Esvazie a mão para completar a viagem!</p>
    </header>
    <div class="rules-cards" aria-hidden="true">
      <div class="rule-card" style="--card:#1477c9">${cardFace({ cardId: "preview-1", color: "azul", kind: "numero", value: 5 })}</div>
      <div class="rule-card" style="--card:#148958">${cardFace({ cardId: "preview-2", color: "verde", kind: "numero", value: 5 })}</div>
      <div class="rule-card wild" style="--card:#2c2f45">${cardFace({ cardId: "preview-3", color: "curinga", kind: "conexao" })}</div>
    </div>
    <button class="start-button" data-action="start">JOGAR ▶</button>
  </main>`;
}

function renderPlaying(): void {
  const top = topCard(state);
  const active = lineInfo(state.activeColor);
  app.innerHTML = `<main class="uno-shell game" style="--active:${active.color};--soft:${active.colorSoft}">
    ${topNav("UNO DO METRÔ")}
    <header class="game-header">
      <p class="eyebrow">LINHA ATIVA: ${active.label.toUpperCase()}</p>
      <p class="stations" aria-live="polite">🚉 Estações percorridas: ${state.cardsPlayed}</p>
      ${state.bonusPlay ? `<p class="bonus-hint">🚄 Expresso ativo: a próxima carta pode ser qualquer uma!</p>` : ""}
    </header>
    <section class="table" aria-label="Mesa de jogo">
      <div class="pile discard-pile" aria-label="Topo do descarte: ${cardLabel(top)}">
        <div class="uno-card" style="${cardStyleVar(top)}">${cardFace(top)}</div>
      </div>
      <button class="pile draw-pile ${focusIndex === state.hand.length ? "focused" : ""}" data-action="draw" aria-label="Comprar carta. Restam ${state.drawPile.length}.">
        <div class="uno-card back">🚈</div>
        <small>COMPRAR</small>
      </button>
    </section>
    <section class="hand" aria-label="Sua mão">
      ${state.hand
        .map((card, index) => {
          const playable = canPlay(card, state);
          const focused = index === focusIndex;
          return `<button class="uno-card hand-card ${playable ? "playable" : ""} ${focused ? "focused" : ""}"
            style="${cardStyleVar(card)}" data-card="${index}" aria-label="${cardLabel(card)}${playable ? "" : ", ainda não combina"}">
            ${cardFace(card)}
          </button>`;
        })
        .join("")}
    </section>
    <footer role="status"><small><kbd>←</kbd><kbd>→</kbd> escolher · <kbd>ESPAÇO</kbd> jogar/comprar</small></footer>
    ${choosingColorFor !== null ? renderColorPicker() : ""}
  </main>`;
}

function renderColorPicker(): string {
  return `<div class="color-picker-overlay" role="dialog" aria-label="Escolha a linha">
    <div class="color-picker">
      <p>Escolha a linha:</p>
      <div class="color-options">
        ${lineColors
          .map(
            (line, index) => `<button class="color-option ${index === colorFocusIndex ? "focused" : ""}"
              style="--card:${line.color}" data-color="${line.id}" aria-label="Linha ${line.label}">
              <span>${index + 1}</span>${line.label}
            </button>`
          )
          .join("")}
      </div>
    </div>
  </div>`;
}

function renderFinished(): void {
  app.innerHTML = `<main class="uno-shell finished">
    ${topNav("UNO DO METRÔ")}
    <section class="finish-card">
      <div class="celebration">★ ✦ ★</div>
      <p class="eyebrow">VIAGEM COMPLETA</p>
      <h1>Você chegou<br><em>ao terminal!</em></h1>
      <p class="final-score">ESTAÇÕES PERCORRIDAS: <b>${state.cardsPlayed}</b></p>
      <div class="finish-actions">
        <button data-action="replay">↻ JOGAR DE NOVO</button>
      </div>
    </section>
  </main>`;
}

function render(): void {
  if (screen === "welcome") renderWelcome();
  else if (screen === "finished") renderFinished();
  else renderPlaying();
}

function startGame(): void {
  window.clearTimeout(advanceTimer);
  state = dealGame();
  focusIndex = 0;
  choosingColorFor = null;
  colorFocusIndex = 0;
  screen = "playing";
  render();
  speak("Jogue uma carta que combine a linha ou o número com o topo do monte.");
}

function afterPlay(): void {
  if (isWon(state)) {
    advanceTimer = window.setTimeout(() => {
      screen = "finished";
      render();
      speak(`Parabéns! Você completou a viagem em ${state.cardsPlayed} estações!`);
    }, 700);
    return;
  }
  focusIndex = Math.min(focusIndex, state.hand.length);
  render();
}

function attemptPlay(index: number): void {
  if (screen !== "playing" || choosingColorFor !== null) return;
  const card = state.hand[index];
  if (!card || !canPlay(card, state)) return;
  focusIndex = index;
  if (card.kind === "conexao") {
    choosingColorFor = index;
    colorFocusIndex = 0;
    render();
    speak("Escolha uma linha para continuar.");
    return;
  }
  state = playCard(state, index);
  speak(cardLabel(card));
  afterPlay();
}

function chooseColor(color: LineColor): void {
  if (choosingColorFor === null) return;
  state = playCard(state, choosingColorFor, color);
  choosingColorFor = null;
  speak(`Linha ${lineInfo(color).label}!`);
  afterPlay();
}

function draw(): void {
  if (screen !== "playing" || choosingColorFor !== null) return;
  state = drawCard(state);
  focusIndex = state.hand.length - 1;
  render();
  if (!hasPlayableCard(state)) speak("Trem chegando. Vamos pegar mais um.");
}

document.addEventListener("keydown", event => {
  if (screen !== "playing") return;

  if (choosingColorFor !== null) {
    if (event.code === "ArrowLeft") { colorFocusIndex = (colorFocusIndex - 1 + lineColors.length) % lineColors.length; render(); }
    if (event.code === "ArrowRight") { colorFocusIndex = (colorFocusIndex + 1) % lineColors.length; render(); }
    const numberKey = Number(event.key);
    if (numberKey >= 1 && numberKey <= lineColors.length) { chooseColor(lineColors[numberKey - 1].id); return; }
    if (event.code === "Space" || event.code === "Enter") { event.preventDefault(); chooseColor(lineColors[colorFocusIndex].id); }
    return;
  }

  const slots = state.hand.length + 1; // +1 = monte de compra
  if (event.code === "ArrowLeft") { focusIndex = (focusIndex - 1 + slots) % slots; render(); }
  if (event.code === "ArrowRight") { focusIndex = (focusIndex + 1) % slots; render(); }
  if (event.code === "Space" || event.code === "Enter") {
    event.preventDefault();
    if (focusIndex === state.hand.length) draw();
    else attemptPlay(focusIndex);
  }
});

app.addEventListener("click", event => {
  const target = event.target as HTMLElement;

  const colorButton = target.closest<HTMLButtonElement>("[data-color]");
  if (colorButton) { chooseColor(colorButton.dataset.color as LineColor); return; }

  const cardButton = target.closest<HTMLButtonElement>("[data-card]");
  if (cardButton) { attemptPlay(Number(cardButton.dataset.card)); return; }

  const drawButton = target.closest<HTMLButtonElement>("[data-action='draw']");
  if (drawButton) { draw(); return; }

  const action = target.closest<HTMLButtonElement>("[data-action]")?.dataset.action;
  if (action === "start") startGame();
  if (action === "back") {
    if (screen === "welcome") window.location.href = "/";
    else { speechSynthesis?.cancel(); screen = "welcome"; render(); }
  }
  if (action === "sound") { speechEnabled = !speechEnabled; speechSynthesis?.cancel(); render(); }
  if (action === "replay") startGame();
});

render();
