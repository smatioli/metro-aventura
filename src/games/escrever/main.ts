import "./style.css";
import { categories, items, type WritingItem } from "./data";
import { isLetter, letterChoicesFor, nextLetterIndex } from "./logic";

type Screen = "gallery" | "writing";

const app = document.querySelector<HTMLDivElement>("#app")!;

let screen: Screen = "gallery";
let selected = 0;
let speechEnabled = true;
let speechTimer = 0;
let doneTimer = 0;
let writingItem: WritingItem | null = null;
let letterIndex = 0;
let writingChoices: string[] = [];
let writingWrongLetter: string | null = null;
let writingWrongTimer = 0;
const written = new Set<string>();

function stopSpeech(): void {
  window.clearTimeout(speechTimer);
  speechTimer = 0;
  if ("speechSynthesis" in window) speechSynthesis.cancel();
}

function speak(text: string): void {
  stopSpeech();
  if (!speechEnabled || !("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pt-BR";
  utterance.rate = 0.76;
  utterance.pitch = 1.04;
  speechSynthesis.speak(utterance);
}

function scheduleSpeak(text: string, delay = 0): void {
  stopSpeech();
  if (!speechEnabled) return;
  speechTimer = window.setTimeout(() => {
    speechTimer = 0;
    speak(text);
  }, delay);
}

function itemImage(item: WritingItem): string {
  return `<div class="item-art ${item.category === "times" ? "logo" : "photo"}" style="--accent:${item.color}">
    <img src="${item.image}" alt="${item.name}">
  </div>`;
}

function navHtml(): string {
  const back = screen === "gallery"
    ? `<a href="/" aria-label="Voltar para todos os jogos">‹ <span>JOGOS</span></a>`
    : `<button class="back-button" aria-label="Voltar para as fotos">‹ <span>FOTOS</span></button>`;
  return `${back}<button class="sound-toggle" aria-label="Ligar ou desligar voz">${speechEnabled ? "🔊" : "🔇"}</button>`;
}

function itemCard(item: WritingItem, index: number): string {
  return `<button class="item-card ${selected === index ? "selected" : ""} ${written.has(item.id) ? "written" : ""}" data-item="${index}" aria-label="${item.name}">
    ${itemImage(item)}
    <strong>${item.name}</strong>
    <span class="written-mark" aria-hidden="true">★</span>
  </button>`;
}

function renderGallery(): void {
  app.innerHTML = `<main class="writer-shell gallery">
    <nav>${navHtml()}</nav>
    <section class="gallery-hero">
      <p class="eyebrow">JOGO DE ESCREVER</p>
      <h1>Vamos escrever!</h1>
      <div class="how-to" aria-label="Como jogar"><span>👆</span><b>→</b><span>🖼️</span><b>→</b><span>🔤</span></div>
    </section>
    ${categories.map(category => `<section class="category" style="--accent:${category.color}" aria-label="${category.label}">
      <h2><span aria-hidden="true">${category.icon}</span> ${category.label}</h2>
      <div class="item-grid">
        ${items.map((item, index) => item.category === category.id ? itemCard(item, index) : "").join("")}
      </div>
    </section>`).join("")}
    <footer class="key-help"><kbd>←</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd><span>+</span><kbd>ESPAÇO</kbd></footer>
  </main>`;
}

function renderWriting(): void {
  if (!writingItem) return;
  const letters = [...writingItem.word];
  const complete = letterIndex >= letters.length;
  const currentLetter = letters[letterIndex];
  app.innerHTML = `<main class="writer-shell writing">
    <nav>${navHtml()}</nav>
    <header>
      <p class="eyebrow">VAMOS ESCREVER</p>
      <button class="listen-button" aria-label="Ouvir instrução novamente"><span>🔊</span><b>OUVIR</b></button>
    </header>
    <section class="writing-card" style="--accent:${writingItem.color}">
      ${itemImage(writingItem)}
      <h1>${writingItem.word}</h1>
      <div class="letter-slots" aria-label="Escrevendo ${writingItem.word}">
        ${letters.map((letter, index) => isLetter(letter)
          ? `<span class="${index < letterIndex ? "done" : index === letterIndex ? "current" : ""}">${index <= letterIndex ? letter : "•"}</span>`
          : `<i class="gap" aria-hidden="true"></i>`).join("")}
      </div>
      ${complete ? `<div class="word-complete" aria-hidden="true">★</div><p>MUITO BEM!</p>` : `<div class="next-letter">
        <span aria-hidden="true">👇</span>
        <button class="letter-key" data-letter="${currentLetter}" aria-label="Letra ${currentLetter}">${currentLetter}</button>
      </div>
      <div class="letter-choices" role="group" aria-label="Toque na letra ${currentLetter}">
        ${writingChoices.map(letter => `<button class="letter-choice ${letter === writingWrongLetter ? "wrong" : ""}" data-letter="${letter}" aria-label="Letra ${letter}">${letter}</button>`).join("")}
      </div>
      <p>APERTE A LETRA</p>`}
    </section>
  </main>`;
}

function render(): void {
  if (screen === "gallery") renderGallery();
  else renderWriting();
}

function scrollSelectedIntoView(): void {
  app.querySelector(".item-card.selected")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function select(index: number): void {
  selected = Math.max(0, Math.min(items.length - 1, index));
  render();
  scrollSelectedIntoView();
}

// Cima/baixo: vai para o cartão mais próximo (na horizontal) da linha acima ou abaixo,
// atravessando as seções de categoria.
function selectVertical(direction: 1 | -1): void {
  const cards = [...app.querySelectorAll<HTMLElement>("[data-item]")];
  const current = cards.find(card => Number(card.dataset.item) === selected);
  if (!current) return;
  const from = current.getBoundingClientRect();
  const centerX = from.left + from.width / 2;
  const rows = cards
    .map(card => ({ card, rect: card.getBoundingClientRect() }))
    .filter(({ rect }) => direction === 1 ? rect.top > from.top + 4 : rect.top < from.top - 4);
  if (!rows.length) return;
  const targetTop = direction === 1
    ? Math.min(...rows.map(({ rect }) => rect.top))
    : Math.max(...rows.map(({ rect }) => rect.top));
  const row = rows.filter(({ rect }) => Math.abs(rect.top - targetTop) < 4);
  const closest = row.reduce((best, entry) => {
    const distance = Math.abs(entry.rect.left + entry.rect.width / 2 - centerX);
    const bestDistance = Math.abs(best.rect.left + best.rect.width / 2 - centerX);
    return distance < bestDistance ? entry : best;
  });
  select(Number(closest.card.dataset.item));
}

function writingPrompt(fullPrompt: boolean): string {
  if (!writingItem) return "";
  if (letterIndex >= writingItem.word.length) return `Muito bem! ${writingItem.spoken}.`;
  const letter = writingItem.word[letterIndex];
  return fullPrompt
    ? `Vamos escrever: ${writingItem.spoken}. Aperte a letra ${letter}.`
    : `Aperte a letra ${letter}.`;
}

function startWriting(index: number): void {
  const item = items[index];
  if (!item) return;
  selected = index;
  writingItem = item;
  letterIndex = nextLetterIndex(item.word, 0);
  writingWrongLetter = null;
  writingChoices = letterChoicesFor(item.word[letterIndex]);
  screen = "writing";
  render();
  window.scrollTo({ top: 0 });
  scheduleSpeak(writingPrompt(true), 300);
}

function backToGallery(): void {
  window.clearTimeout(doneTimer);
  window.clearTimeout(writingWrongTimer);
  stopSpeech();
  writingItem = null;
  screen = "gallery";
  render();
  app.querySelector(".item-card.selected")?.scrollIntoView({ block: "center" });
}

function typeLetter(letter: string): void {
  if (screen !== "writing" || !writingItem || letterIndex >= writingItem.word.length) return;
  const expected = writingItem.word[letterIndex];
  if (letter.toUpperCase() !== expected) {
    writingWrongLetter = letter.toUpperCase();
    render();
    window.clearTimeout(writingWrongTimer);
    writingWrongTimer = window.setTimeout(() => {
      writingWrongLetter = null;
      render();
    }, 700);
    scheduleSpeak(writingPrompt(false));
    return;
  }
  window.clearTimeout(writingWrongTimer);
  writingWrongLetter = null;
  letterIndex = nextLetterIndex(writingItem.word, letterIndex + 1);
  if (letterIndex < writingItem.word.length) {
    const nextLetter = writingItem.word[letterIndex];
    writingChoices = letterChoicesFor(nextLetter);
    render();
    speak(`${expected}. Agora, aperte a letra ${nextLetter}.`);
    return;
  }
  written.add(writingItem.id);
  render();
  speak(`Muito bem! ${writingItem.spoken}.`);
  doneTimer = window.setTimeout(backToGallery, 2200);
}

document.addEventListener("keydown", event => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].includes(event.code)) event.preventDefault();
  if (screen === "gallery") {
    if (event.code === "ArrowLeft") select(selected - 1);
    else if (event.code === "ArrowRight") select(selected + 1);
    else if (event.code === "ArrowUp") selectVertical(-1);
    else if (event.code === "ArrowDown") selectVertical(1);
    else if (event.code === "Space" || event.code === "Enter") startWriting(selected);
    return;
  }
  if (event.code === "Escape") { backToGallery(); return; }
  if (/^[a-zA-Z]$/.test(event.key)) typeLetter(event.key);
});

app.addEventListener("click", event => {
  const target = event.target as HTMLElement;
  if (target.closest(".back-button")) { backToGallery(); return; }
  const card = target.closest<HTMLButtonElement>("[data-item]");
  if (card) { startWriting(Number(card.dataset.item)); return; }
  if (target.closest(".listen-button")) { speak(writingPrompt(true)); return; }
  const letterKey = target.closest<HTMLButtonElement>("[data-letter]");
  if (letterKey) { typeLetter(letterKey.dataset.letter ?? ""); return; }
  if (target.closest(".sound-toggle")) {
    speechEnabled = !speechEnabled;
    stopSpeech();
    render();
    if (speechEnabled && screen === "writing") speak(writingPrompt(true));
  }
});

render();
