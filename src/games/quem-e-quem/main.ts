import "./style.css";
import type { Person, Topic } from "./types";
import { topics } from "./topics";

type Mode = "person-to-group" | "group-to-person";
type Screen = "select" | "welcome" | "playing" | "writing" | "finished";

interface RoundPlan {
  person: Person;
  mode: Mode;
  options: Person[];
}

const app = document.querySelector<HTMLDivElement>("#app")!;

let screen: Screen = "select";
let currentTopic: Topic | null = null;
let selectedTopicIndex = 0;
let rounds: RoundPlan[] = [];
let round = 0;
let selected = 0;
let feedback: "idle" | "try-again" | "correct" = "idle";
let speechEnabled = true;
let nextRoundTimer = 0;
let speechTimer = 0;
let writingPerson: Person | null = null;
let letterIndex = 0;
let writingChoices: string[] = [];
let writingWrongLetter: string | null = null;
let writingWrongTimer = 0;

function topic(): Topic {
  return currentTopic!;
}

function shuffled<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildRounds(): RoundPlan[] {
  const people = topic().people;
  return shuffled(people).map(person => {
    const mode: Mode = Math.random() < 0.5 ? "person-to-group" : "group-to-person";
    const distractors = people.filter(candidate => candidate.group !== person.group);
    const other = distractors[Math.floor(Math.random() * distractors.length)];
    const options = Math.random() < 0.5 ? [person, other] : [other, person];
    return { person, mode, options };
  });
}

function currentRound(): RoundPlan {
  return rounds[round];
}

function mode(): Mode {
  return currentRound().mode;
}

function answer(): Person {
  return currentRound().person;
}

function options(): Person[] {
  return currentRound().options;
}

function questionText(): string {
  const current = answer();
  return mode() === "person-to-group"
    ? topic().questionPersonToGroup(current)
    : topic().questionGroupToPerson(current);
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

function personArt(person: Person): string {
  return `<div class="person-art photo" style="--shirt:${person.color}">
    <img src="${person.photo}" alt="Foto de ${person.name}">
    <span aria-hidden="true">${topic().personIcon}</span>
  </div>`;
}

function groupArt(person: Person): string {
  if (person.groupLogo) {
    return `<div class="show-art" style="--show:${person.color};--show-soft:${person.soft}">
      <img src="${person.groupLogo}" alt="Logo do ${person.group}">
    </div>`;
  }
  return `<div class="show-art" style="--show:${person.color};--show-soft:${person.soft}">
    <div class="studio-lines" aria-hidden="true"></div>
    <strong>${person.group}</strong>
  </div>`;
}

function subjectCard(): string {
  const current = answer();
  return `<section class="question-subject" aria-label="${mode() === "person-to-group" ? current.name : current.group}">
    ${mode() === "person-to-group" ? personArt(current) : groupArt(current)}
    <h2>${mode() === "person-to-group" ? current.name : current.group}</h2>
  </section>`;
}

function choiceCard(item: Person, index: number): string {
  const label = mode() === "person-to-group" ? item.group : item.name;
  return `<button class="answer-card ${selected === index ? "selected" : ""}" data-answer="${index}" aria-label="${label}">
    <span class="choice-key">${index === 0 ? "1 / A" : "2 / B"}</span>
    ${mode() === "person-to-group" ? groupArt(item) : personArt(item)}
    <strong>${label}</strong>
    <span class="choose-mark" aria-hidden="true">✓</span>
  </button>`;
}

function progress(): string {
  const totalRounds = rounds.length;
  return `<div class="round-progress" aria-label="Rodada ${round + 1} de ${totalRounds}">
    ${Array.from({ length: totalRounds }, (_, index) => `<i class="${index < round ? "done" : index === round ? "current" : ""}"></i>`).join("")}
  </div>`;
}

function navHtml(): string {
  const back = screen === "select"
    ? `<a href="/" aria-label="Voltar para todos os jogos">‹ <span>JOGOS</span></a>`
    : `<button class="back-button" aria-label="Voltar para escolher o jogo">‹ <span>JOGOS</span></button>`;
  return `${back}<button class="sound-toggle" aria-label="Ligar ou desligar voz">${speechEnabled ? "🔊" : "🔇"}</button>`;
}

function topicCard(item: Topic, index: number): string {
  return `<button class="topic-card ${selectedTopicIndex === index ? "selected" : ""}" data-topic-index="${index}" style="--accent:${item.accent}" aria-label="${item.gameTitle}">
    <span class="choice-key">${index === 0 ? "1 / A" : "2 / B"}</span>
    <span class="topic-icons" aria-hidden="true">${item.welcomeIcons[0]} ${item.welcomeIcons[1]}</span>
    <h2>${item.gameTitle}</h2>
    <p>${item.selectDescription}</p>
    <strong class="topic-cta">JOGAR <span aria-hidden="true">→</span></strong>
  </button>`;
}

function renderSelect(): void {
  app.innerHTML = `<main class="whoiswho-shell select">
    <nav>${navHtml()}</nav>
    <section class="select-hero">
      <p class="eyebrow">JOGO DE ADIVINHAÇÃO</p>
      <h1>Quem é quem?</h1>
      <p>Escolha o que você quer jogar.</p>
    </section>
    <section class="topic-grid" role="group" aria-label="Escolha um jogo">
      ${topics.map((item, index) => topicCard(item, index)).join("")}
    </section>
  </main>`;
}

function renderWelcome(): void {
  const current = topic();
  app.innerHTML = `<main class="whoiswho-shell welcome">
    <nav>${navHtml()}</nav>
    <section class="welcome-card">
      <div class="welcome-studio" aria-hidden="true"><span>${current.welcomeIcons[0]}</span><b>?</b><span>${current.welcomeIcons[1]}</span></div>
      <p class="eyebrow">JOGO DE ADIVINHAÇÃO</p>
      <h1>${current.gameTitle}</h1>
      <p>${current.playDescription}</p>
      <div class="how-to" aria-label="Como jogar"><span>👀</span><b>→</b><span>👂</span><b>→</b><span>1️⃣ 2️⃣</span></div>
      <button class="start-button"><span>▶</span><strong>JOGAR</strong><kbd>ESPAÇO</kbd></button>
    </section>
  </main>`;
}

function renderGame(): void {
  const message = feedback === "correct" ? "ISSO! MUITO BEM!" : feedback === "try-again" ? "VAMOS TENTAR DE NOVO" : "ESCOLHA UMA RESPOSTA";
  app.innerHTML = `<main class="whoiswho-shell game">
    <nav>${navHtml()}</nav>
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
  const current = topic();
  app.innerHTML = `<main class="whoiswho-shell finished">
    <nav>${navHtml()}</nav>
    <section class="finish-card">
      <div class="stars" aria-hidden="true">★ ★ ★</div>
      <p class="eyebrow">MUITO BEM!</p>
      <h1>${current.finishedHeading}</h1>
      <div class="finish-friends" aria-hidden="true">${current.people.map(personArt).join("")}</div>
      <div class="finish-actions">
        <button class="start-button replay-button"><span>↻</span><strong>JOGAR DE NOVO</strong><kbd>ESPAÇO</kbd></button>
        <button class="switch-button"><span aria-hidden="true">🔀</span><strong>TROCAR DE JOGO</strong></button>
      </div>
    </section>
  </main>`;
}

function renderWriting(): void {
  if (!writingPerson) return;
  const letters = [...writingPerson.shortName];
  const currentLetter = letters[letterIndex];
  const complete = letterIndex >= letters.length;
  app.innerHTML = `<main class="whoiswho-shell writing">
    <nav>${navHtml()}</nav>
    <header>
      <p class="eyebrow">VAMOS ESCREVER</p>
      <button class="listen-button writing-listen" aria-label="Ouvir instrução novamente"><span>🔊</span><b>OUVIR</b></button>
    </header>
    <section class="writing-card" style="--accent:${writingPerson.color}">
      ${personArt(writingPerson)}
      <h1>${writingPerson.shortName}</h1>
      <div class="letter-slots" aria-label="Escrevendo ${writingPerson.shortName}">
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
  if (screen === "select") renderSelect();
  else if (screen === "welcome") renderWelcome();
  else if (screen === "playing") renderGame();
  else if (screen === "writing") renderWriting();
  else renderFinished();
}

function chooseTopic(index: number): void {
  const selectedTopic = topics[index];
  if (!selectedTopic) return;
  selectedTopicIndex = index;
  currentTopic = selectedTopic;
  screen = "welcome";
  render();
}

function backToSelect(): void {
  window.clearTimeout(nextRoundTimer);
  window.clearTimeout(writingWrongTimer);
  stopSpeech();
  screen = "select";
  currentTopic = null;
  rounds = [];
  writingPerson = null;
  render();
}

function startGame(): void {
  window.clearTimeout(nextRoundTimer);
  stopSpeech();
  rounds = buildRounds();
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
  if (chosen.group !== answer().group) {
    feedback = "try-again";
    render();
    speak("Quase. Vamos tentar de novo.");
    return;
  }
  feedback = "correct";
  render();
  speak("Isso! Muito bem!");
  nextRoundTimer = window.setTimeout(() => {
    writingPerson = mode() === "group-to-person" ? chosen : answer();
    letterIndex = 0;
    writingWrongLetter = null;
    writingChoices = letterChoicesFor(writingPerson.shortName[0]);
    screen = "writing";
    render();
    scheduleWritingPrompt(true, 300);
  }, 1900);
}

function advanceRound(): void {
  round += 1;
  writingPerson = null;
  if (round >= rounds.length) {
    screen = "finished";
    render();
    speak(topic().finishedSpeech);
    return;
  }
  screen = "playing";
  selected = 0;
  feedback = "idle";
  render();
  scheduleSpeak(questionText(), 300);
}

function speakWritingPrompt(fullPrompt = false): void {
  if (!writingPerson) return;
  const letter = writingPerson.shortName[letterIndex];
  speak(fullPrompt
    ? `Vamos escrever: ${writingPerson.shortName}. Aperte a letra ${letter}.`
    : `Aperte a letra ${letter}.`);
}

function scheduleWritingPrompt(fullPrompt = false, delay = 0): void {
  if (!writingPerson) return;
  const letter = writingPerson.shortName[letterIndex];
  scheduleSpeak(fullPrompt
    ? `Vamos escrever: ${writingPerson.shortName}. Aperte a letra ${letter}.`
    : `Aperte a letra ${letter}.`, delay);
}

function typeLetter(letter: string): void {
  if (screen !== "writing" || !writingPerson) return;
  const expected = writingPerson.shortName[letterIndex];
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
  if (letterIndex < writingPerson.shortName.length) {
    writingChoices = letterChoicesFor(writingPerson.shortName[letterIndex]);
    render();
    const nextLetter = writingPerson.shortName[letterIndex];
    speak(`${expected}. Agora, aperte a letra ${nextLetter}.`);
    return;
  }
  render();
  speak(`Muito bem! ${writingPerson.shortName}.`);
  nextRoundTimer = window.setTimeout(advanceRound, 1500);
}

document.addEventListener("keydown", event => {
  if (["ArrowLeft", "ArrowRight", "Space"].includes(event.code)) event.preventDefault();
  if (screen === "select") {
    if (event.code === "ArrowLeft") { selectedTopicIndex = 0; render(); return; }
    if (event.code === "ArrowRight") { selectedTopicIndex = 1; render(); return; }
    if (event.code === "Space" || event.code === "Enter") { chooseTopic(selectedTopicIndex); return; }
    if (event.key === "1" || event.key.toLowerCase() === "a") { chooseTopic(0); return; }
    if (event.key === "2" || event.key.toLowerCase() === "b") { chooseTopic(1); return; }
    return;
  }
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
  if (target.closest(".back-button, .switch-button")) { backToSelect(); return; }
  const topicCardEl = target.closest<HTMLButtonElement>("[data-topic-index]");
  if (topicCardEl) { chooseTopic(Number(topicCardEl.dataset.topicIndex)); return; }
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
