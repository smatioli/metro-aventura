import "./style.css";
import { memoryGroups, pairsForGroup, type MemoryGroup } from "./data";
import { buildBoard, columnsForCount, isBoardComplete, isMatch, type MemoryCard } from "./logic";

type Screen = "welcome" | "playing" | "finished";

const app = document.querySelector<HTMLDivElement>("#app")!;
let screen: Screen = "welcome";
let group: MemoryGroup = memoryGroups[0];
let board: MemoryCard[] = [];
let firstPick: number | null = null;
let busy = false;
let focusIndex = 0;
let matches = 0;
let speechEnabled = true;
let resolveTimer = 0;
let advanceTimer = 0;

function speak(text: string): void {
  if (!speechEnabled || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pt-BR";
  utterance.rate = 0.8;
  speechSynthesis.speak(utterance);
}

function topNav(title: string): string {
  return `<nav>
    <div class="nav-left">
      ${screen !== "welcome" ? `<a class="home-button" href="/" aria-label="Voltar para a home">🏠</a>` : ""}
      <button class="back-button" data-action="back" aria-label="Voltar">${screen === "welcome" ? "‹ JOGOS" : "‹ GRUPOS"}</button>
    </div>
    <div class="brand"><i>✦</i> ${title}</div>
    <button class="sound-button" data-action="sound" aria-label="Ligar ou desligar voz">${speechEnabled ? "🔊" : "🔇"}</button>
  </nav>`;
}

function renderWelcome(): void {
  app.innerHTML = `<main class="memory-shell welcome">
    ${topNav("JOGO DA MEMÓRIA")}
    <header>
      <p class="eyebrow">JOGO DA MEMÓRIA</p>
      <h1>Escolha um grupo<br><em>de imagens</em></h1>
      <p>Vire as cartas e encontre os pares iguais.</p>
    </header>
    <section class="group-grid" aria-label="Grupos de imagens">
      ${memoryGroups.map(item => `<button class="group-card" data-group="${item.id}" style="--group:${item.color};--soft:${item.softColor}" aria-label="Jogar com o grupo ${item.label}">
        <span class="group-icon" aria-hidden="true">${item.icon}</span>
        <h2>${item.label}</h2>
        <small>${pairsForGroup(item)} PARES</small>
        <span class="play-label">JOGAR <b>→</b></span>
      </button>`).join("")}
    </section>
  </main>`;
}

function cardStateClasses(card: MemoryCard, index: number): string {
  const faceUp = card.revealed || card.matched;
  const focused = !faceUp && !busy && index === focusIndex;
  return `memory-card ${faceUp ? "face-up" : ""} ${card.matched ? "matched" : ""} ${focused ? "focused" : ""}`;
}

function cardFace(card: MemoryCard, index: number): string {
  const faceUp = card.revealed || card.matched;
  return `<button class="${cardStateClasses(card, index)}"
      data-card="${index}" aria-label="${faceUp ? card.alt : "Carta virada para baixo"}" ${card.matched ? "disabled" : ""}>
    <span class="card-back" aria-hidden="true">${group.icon}</span>
    <span class="card-front"><img src="${card.src}" alt="${card.alt}"><b class="card-label">${card.label}</b><i class="check">✓</i></span>
  </button>`;
}

// Atualiza apenas as classes/atributos das cartas já no DOM (em vez de recriar
// o innerHTML inteiro) para que a transição de virar a carta realmente seja
// animada, e não apareça "instantânea".
function updateBoardDom(): void {
  const boardEl = document.querySelector(".memory-board");
  if (!boardEl) return;
  board.forEach((card, index) => {
    const button = boardEl.querySelector<HTMLButtonElement>(`[data-card="${index}"]`);
    if (!button) return;
    button.className = cardStateClasses(card, index);
    button.disabled = card.matched;
    button.setAttribute("aria-label", card.revealed || card.matched ? card.alt : "Carta virada para baixo");
  });
  const total = board.length / 2;
  const progressEl = document.querySelector(".progress");
  if (progressEl) {
    progressEl.setAttribute("aria-label", `Pares encontrados: ${matches} de ${total}`);
    progressEl.querySelectorAll("i").forEach((dot, index) => dot.classList.toggle("done", index < matches));
  }
}

function renderGame(): void {
  const total = board.length / 2;
  app.innerHTML = `<main class="memory-shell game" style="--group:${group.color};--soft:${group.softColor}">
    ${topNav(group.label.toUpperCase())}
    <header class="game-header">
      <p class="eyebrow">${group.label.toUpperCase()}</p>
      <h1>Encontre os pares!</h1>
      <div class="progress" aria-label="Pares encontrados: ${matches} de ${total}">
        ${Array.from({ length: total }, (_, index) => `<i class="${index < matches ? "done" : ""}"></i>`).join("")}
      </div>
    </header>
    <section class="memory-board" style="--cols:${columnsForCount(board.length)}" aria-label="Tabuleiro do jogo da memória">
      ${board.map((card, index) => cardFace(card, index)).join("")}
    </section>
    <footer role="status"><small><kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> + <kbd>ESPAÇO</kbd></small></footer>
  </main>`;
}

function renderFinished(): void {
  app.innerHTML = `<main class="memory-shell finished" style="--group:${group.color};--soft:${group.softColor}">
    ${topNav(group.label.toUpperCase())}
    <section class="finish-card">
      <div class="celebration">★ ✦ ★</div>
      <p class="eyebrow">${group.label.toUpperCase()} COMPLETO</p>
      <h1>Todos os pares<br><em>encontrados!</em></h1>
      <div class="finish-images">${board.filter(card => card.matched).filter((card, index, arr) => arr.findIndex(other => other.imageId === card.imageId) === index).map(card => `<span><img src="${card.src}" alt="${card.alt}"><small>${card.label}</small></span>`).join("")}</div>
      <div class="finish-actions">
        <button data-action="replay">↻ JOGAR DE NOVO</button>
        <button class="next-set" data-action="change-group">TROCAR GRUPO →</button>
      </div>
    </section>
  </main>`;
}

function render(): void {
  if (screen === "welcome") renderWelcome();
  else if (screen === "finished") renderFinished();
  else renderGame();
}

function startGroup(id: string): void {
  window.clearTimeout(resolveTimer);
  window.clearTimeout(advanceTimer);
  group = memoryGroups.find(item => item.id === id) ?? memoryGroups[0];
  board = buildBoard(group);
  firstPick = null;
  busy = false;
  focusIndex = 0;
  matches = 0;
  screen = "playing";
  render();
  speak(`${group.label}. Vire as cartas e encontre os pares.`);
}

function flip(index: number): void {
  if (screen !== "playing" || busy) return;
  const card = board[index];
  if (!card || card.revealed || card.matched) return;
  focusIndex = index;
  card.revealed = true;

  if (firstPick === null) {
    firstPick = index;
    updateBoardDom();
    return;
  }

  const previous = board[firstPick];
  if (isMatch(previous, card)) {
    previous.matched = true;
    card.matched = true;
    matches += 1;
    firstPick = null;
    updateBoardDom();
    speak("Isso! Você encontrou um par!");
    if (isBoardComplete(board)) {
      advanceTimer = window.setTimeout(() => {
        screen = "finished";
        render();
        speak(`Muito bem! Você encontrou todos os pares de ${group.label.toLowerCase()}!`);
      }, 900);
    }
    return;
  }

  busy = true;
  updateBoardDom();
  speak("Quase! Tente lembrar onde estão as cartas.");
  resolveTimer = window.setTimeout(() => {
    previous.revealed = false;
    card.revealed = false;
    firstPick = null;
    busy = false;
    updateBoardDom();
  }, 1000);
}

document.addEventListener("keydown", event => {
  if (screen !== "playing" || busy) return;
  const cols = columnsForCount(board.length);
  if (event.code === "ArrowLeft") { focusIndex = (focusIndex - 1 + board.length) % board.length; updateBoardDom(); }
  if (event.code === "ArrowRight") { focusIndex = (focusIndex + 1) % board.length; updateBoardDom(); }
  if (event.code === "ArrowUp") { focusIndex = (focusIndex - cols + board.length) % board.length; updateBoardDom(); }
  if (event.code === "ArrowDown") { focusIndex = (focusIndex + cols) % board.length; updateBoardDom(); }
  if (event.code === "Space" || event.code === "Enter") { event.preventDefault(); flip(focusIndex); }
});

app.addEventListener("click", event => {
  const target = event.target as HTMLElement;
  const groupButton = target.closest<HTMLButtonElement>("[data-group]");
  if (groupButton) { startGroup(groupButton.dataset.group!); return; }
  const cardButton = target.closest<HTMLButtonElement>("[data-card]");
  if (cardButton) { flip(Number(cardButton.dataset.card)); return; }
  const action = target.closest<HTMLButtonElement>("[data-action]")?.dataset.action;
  if (action === "back") {
    if (screen === "welcome") window.location.href = "/";
    else { speechSynthesis?.cancel(); screen = "welcome"; render(); }
  }
  if (action === "sound") { speechEnabled = !speechEnabled; speechSynthesis?.cancel(); render(); }
  if (action === "replay") startGroup(group.id);
  if (action === "change-group") { screen = "welcome"; render(); }
});

render();
