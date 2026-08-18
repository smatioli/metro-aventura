import "./style.css";
import { presenters, type Presenter } from "./presenters";

type Mode = "presenter-to-show" | "show-to-presenter";
type Screen = "welcome" | "playing" | "writing" | "finished";

const app = document.querySelector<HTMLDivElement>("#app")!;
const totalRounds = presenters.length;
let screen: Screen = "welcome";
let round = 0;
let selected = 0;
let feedback: "idle" | "try-again" | "correct" = "idle";
let speechEnabled = true;
let nextRoundTimer = 0;
let speechTimer = 0;
let writingPresenter: Presenter | null = null;
let letterIndex = 0;
let writingChoices: string[] = [];
let writingWrongLetter: string | null = null;
let writingWrongTimer = 0;

function mode(): Mode {
  return round % 2 === 0 ? "presenter-to-show" : "show-to-presenter";
}

function answer(): Presenter {
  return presenters[round % presenters.length];
}

function options(): Presenter[] {
  const correct = answer();
  let offset = 1;
  let other = presenters[(round + offset) % presenters.length];
  while (other.show === correct.show && offset < presenters.length) {
    offset += 1;
    other = presenters[(round + offset) % presenters.length];
  }
  return round % 4 < 2 ? [correct, other] : [other, correct];
}

function questionText(): string {
  const current = answer();
  return mode() === "presenter-to-show"
    ? `Qual jornal ${current.article} ${current.name} apresenta?`
    : `Quem apresenta o jornal ${current.show}?`;
}

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

function letterChoicesFor(expected: string): string[] {
  const pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").filter(letter => letter !== expected);
  const decoys = [...pool].sort(() => Math.random() - 0.5).slice(0, 2);
  return [expected, ...decoys].sort(() => Math.random() - 0.5);
}

function presenterArt(presenter: Presenter): string {
  return `<div class="person-art photo" style="--shirt:${presenter.color}">
    <img src="${presenter.photo}" alt="Foto de ${presenter.name}">
    <span aria-hidden="true">🎤</span>
  </div>`;
}

function showArt(presenter: Presenter): string {
  return `<div class="show-art" style="--show:${presenter.color};--show-soft:${presenter.soft}">
    <img src="${presenter.logo}" alt="Logo do ${presenter.show}">
  </div>`;
}

function subjectCard(): string {
  const current = answer();
  return `<section class="question-subject" aria-label="${mode() === "presenter-to-show" ? current.name : current.show}">
    ${mode() === "presenter-to-show" ? presenterArt(current) : showArt(current)}
    <h2>${mode() === "presenter-to-show" ? current.name : current.show}</h2>
  </section>`;
}

function choiceCard(item: Presenter, index: number): string {
  const label = mode() === "presenter-to-show" ? item.show : item.name;
  return `<button class="answer-card ${selected === index ? "selected" : ""}" data-answer="${index}" aria-label="${label}">
    <span class="choice-key">${index === 0 ? "1 / A" : "2 / B"}</span>
    ${mode() === "presenter-to-show" ? showArt(item) : presenterArt(item)}
    <strong>${label}</strong>
    <span class="choose-mark" aria-hidden="true">✓</span>
  </button>`;
}

function progress(): string {
  return `<div class="round-progress" aria-label="Rodada ${round + 1} de ${totalRounds}">
    ${Array.from({ length: totalRounds }, (_, index) => `<i class="${index < round ? "done" : index === round ? "current" : ""}"></i>`).join("")}
  </div>`;
}

function renderWelcome(): void {
  app.innerHTML = `<main class="journalists-shell welcome">
    <nav><a href="/" aria-label="Voltar para todos os jogos">‹ <span>JOGOS</span></a><button class="sound-toggle" aria-label="Ligar ou desligar voz">🔊</button></nav>
    <section class="welcome-card">
      <div class="welcome-studio" aria-hidden="true"><span>🎤</span><b>?</b><span>📺</span></div>
      <p class="eyebrow">JOGO DE ADIVINHAÇÃO</p>
      <h1>Jornalistas</h1>
      <p>Olhe, escute e escolha.</p>
      <div class="how-to" aria-label="Como jogar"><span>👀</span><b>→</b><span>👂</span><b>→</b><span>1️⃣ 2️⃣</span></div>
      <button class="start-button"><span>▶</span><strong>JOGAR</strong><kbd>ESPAÇO</kbd></button>
    </section>
  </main>`;
}

function renderGame(): void {
  const message = feedback === "correct" ? "ISSO! MUITO BEM!" : feedback === "try-again" ? "VAMOS TENTAR DE NOVO" : "ESCOLHA UMA RESPOSTA";
  app.innerHTML = `<main class="journalists-shell game">
    <nav><a href="/" aria-label="Voltar para todos os jogos">‹ <span>JOGOS</span></a><button class="sound-toggle" aria-label="Ligar ou desligar voz">${speechEnabled ? "🔊" : "🔇"}</button></nav>
    <header>
      ${progress()}
      <button class="listen-button" aria-label="Ouvir pergunta novamente"><span>🔊</span><b>OUVIR</b></button>
      <p>${questionText()}</p>
    </header>
    <section class="play-area ${feedback}">
      ${subjectCard()}
      <div class="question-arrow" aria-hidden="true"><span>?</span><i>→</i></div>
      <div class="answers">${options().map(choiceCard).join("")}</div>
    </section>
    <footer class="${feedback}" role="status">
      <span class="feedback-icon">${feedback === "correct" ? "★" : feedback === "try-again" ? "↻" : "← →"}</span>
      <strong>${message}</strong>
      <div class="key-help"><kbd>←</kbd><kbd>→</kbd><span>+</span><kbd>ESPAÇO</kbd></div>
    </footer>
  </main>`;
}

function renderFinished(): void {
  app.innerHTML = `<main class="journalists-shell finished">
    <nav><a href="/" aria-label="Voltar para todos os jogos">‹ <span>JOGOS</span></a><button class="sound-toggle" aria-label="Ligar ou desligar voz">${speechEnabled ? "🔊" : "🔇"}</button></nav>
    <section class="finish-card">
      <div class="stars" aria-hidden="true">★ ★ ★</div>
      <p class="eyebrow">MUITO BEM!</p>
      <h1>Você conhece<br>os jornais!</h1>
      <div class="finish-friends" aria-hidden="true">${presenters.map(presenterArt).join("")}</div>
      <button class="start-button replay-button"><span>↻</span><strong>JOGAR DE NOVO</strong><kbd>ESPAÇO</kbd></button>
    </section>
  </main>`;
}

function renderWriting(): void {
  if (!writingPresenter) return;
  const letters = [...writingPresenter.shortName];
  const currentLetter = letters[letterIndex];
  const complete = letterIndex >= letters.length;
  app.innerHTML = `<main class="journalists-shell writing">
    <nav><a href="/" aria-label="Voltar para todos os jogos">‹ <span>JOGOS</span></a><button class="sound-toggle" aria-label="Ligar ou desligar voz">${speechEnabled ? "🔊" : "🔇"}</button></nav>
    <header>
      <p class="eyebrow">VAMOS ESCREVER</p>
      <button class="listen-button writing-listen" aria-label="Ouvir instrução novamente"><span>🔊</span><b>OUVIR</b></button>
    </header>
    <section class="writing-card" style="--accent:${writingPresenter.color}">
      ${presenterArt(writingPresenter)}
      <h1>${writingPresenter.shortName}</h1>
      <div class="letter-slots" aria-label="Escrevendo ${writingPresenter.shortName}">
        ${letters.map((letter, index) => `<span class="${index < letterIndex ? "done" : index === letterIndex ? "current" : ""}">${index < letterIndex ? letter : index === letterIndex ? letter : "•"}</span>`).join("")}
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
  if (screen === "welcome") renderWelcome();
  else if (screen === "playing") renderGame();
  else if (screen === "writing") renderWriting();
  else renderFinished();
}

function startGame(): void {
  window.clearTimeout(nextRoundTimer);
  stopSpeech();
  screen = "playing";
  round = 0;
  selected = 0;
  feedback = "idle";
  render();
  scheduleSpeak(questionText(), 350);
}

function choose(index: number): void {
  if (screen !== "playing" || feedback === "correct") return;
  selected = index;
  const chosen = options()[index];
  if (chosen.show !== answer().show) {
    feedback = "try-again";
    render();
    speak("Quase. Vamos tentar de novo.");
    return;
  }
  feedback = "correct";
  render();
  speak("Isso! Muito bem!");
  nextRoundTimer = window.setTimeout(() => {
    writingPresenter = mode() === "show-to-presenter" ? chosen : answer();
    letterIndex = 0;
    writingWrongLetter = null;
    writingChoices = letterChoicesFor(writingPresenter.shortName[0]);
    screen = "writing";
    render();
    scheduleWritingPrompt(true, 300);
  }, 1900);
}

function advanceRound(): void {
  round += 1;
  writingPresenter = null;
  if (round >= totalRounds) {
    screen = "finished";
    render();
    speak("Muito bem! Você conhece os jornais!");
    return;
  }
  screen = "playing";
  selected = 0;
  feedback = "idle";
  render();
  scheduleSpeak(questionText(), 300);
}

function speakWritingPrompt(fullPrompt = false): void {
  if (!writingPresenter) return;
  const letter = writingPresenter.shortName[letterIndex];
  speak(fullPrompt
    ? `Vamos escrever: ${writingPresenter.shortName}. Aperte a letra ${letter}.`
    : `Aperte a letra ${letter}.`);
}

function scheduleWritingPrompt(fullPrompt = false, delay = 0): void {
  if (!writingPresenter) return;
  const letter = writingPresenter.shortName[letterIndex];
  scheduleSpeak(fullPrompt
    ? `Vamos escrever: ${writingPresenter.shortName}. Aperte a letra ${letter}.`
    : `Aperte a letra ${letter}.`, delay);
}

function typeLetter(letter: string): void {
  if (screen !== "writing" || !writingPresenter) return;
  const expected = writingPresenter.shortName[letterIndex];
  if (letter.toUpperCase() !== expected) {
    writingWrongLetter = letter.toUpperCase();
    render();
    window.clearTimeout(writingWrongTimer);
    writingWrongTimer = window.setTimeout(() => {
      writingWrongLetter = null;
      render();
    }, 700);
    scheduleWritingPrompt();
    return;
  }
  window.clearTimeout(writingWrongTimer);
  writingWrongLetter = null;
  letterIndex += 1;
  if (letterIndex < writingPresenter.shortName.length) {
    writingChoices = letterChoicesFor(writingPresenter.shortName[letterIndex]);
    render();
    const nextLetter = writingPresenter.shortName[letterIndex];
    speak(`${expected}. Agora, aperte a letra ${nextLetter}.`);
    return;
  }
  render();
  speak(`Muito bem! ${writingPresenter.shortName}.`);
  nextRoundTimer = window.setTimeout(advanceRound, 1500);
}

document.addEventListener("keydown", event => {
  if (["ArrowLeft", "ArrowRight", "Space"].includes(event.code)) event.preventDefault();
  if (screen === "welcome" || screen === "finished") {
    if (event.code === "Space" || event.code === "Enter") startGame();
    return;
  }
  if (screen === "writing") {
    if (/^[a-zA-Z]$/.test(event.key)) {
      event.preventDefault();
      typeLetter(event.key);
    }
    return;
  }
  if (feedback === "correct") return;
  if (event.code === "ArrowLeft") { selected = 0; feedback = "idle"; render(); }
  if (event.code === "ArrowRight") { selected = 1; feedback = "idle"; render(); }
  if (event.code === "Space" || event.code === "Enter") choose(selected);
  if (event.key === "1" || event.key.toLowerCase() === "a") choose(0);
  if (event.key === "2" || event.key.toLowerCase() === "b") choose(1);
});

app.addEventListener("click", event => {
  const target = event.target as HTMLElement;
  if (target.closest(".start-button")) { startGame(); return; }
  const answerCard = target.closest<HTMLButtonElement>("[data-answer]");
  if (answerCard) { choose(Number(answerCard.dataset.answer)); return; }
  if (target.closest(".listen-button")) {
    if (screen === "writing") speakWritingPrompt(true);
    else speak(questionText());
    return;
  }
  const letterKey = target.closest<HTMLButtonElement>("[data-letter]");
  if (letterKey) { typeLetter(letterKey.dataset.letter ?? ""); return; }
  if (target.closest(".sound-toggle")) {
    speechEnabled = !speechEnabled;
    stopSpeech();
    render();
    if (speechEnabled && screen === "playing") speak(questionText());
    if (speechEnabled && screen === "writing") speakWritingPrompt(true);
  }
});

render();
