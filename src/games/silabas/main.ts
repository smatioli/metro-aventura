import "./style.css";
import { syllableSets, syllablesForFamily, targetSyllable, type Family, type SyllableSet } from "./data";

type Screen = "welcome" | "playing" | "maintenance" | "finished";
type Round = { family: Family; word: string; answer: string; options: string[] };

const app = document.querySelector<HTMLDivElement>("#app")!;
let screen: Screen = "welcome";
let selectedSet = 0;
let familyIndex = 0;
let wordIndex = 0;
let maintenanceIndex = 0;
let selectedOption = 0;
let feedback: "idle" | "wrong" | "correct" = "idle";
let speechEnabled = true;
let advanceTimer = 0;

function set(): SyllableSet { return syllableSets[selectedSet]; }

function sampleWords(family: Family): string[] {
  return [family.words[0], family.words[2], family.words[4]];
}

function distractors(answer: string, families = set().families): string[] {
  const vowel = answer[1];
  const sameVowel = families.map(family => `${family.consonant}${vowel}`);
  const other = families.flatMap(syllablesForFamily);
  return [...new Set([...sameVowel, ...other])].filter(item => item !== answer).slice(0, 2);
}

function currentRound(): Round {
  const currentFamily = set().families[familyIndex];
  const word = sampleWords(currentFamily)[wordIndex];
  const answer = targetSyllable(word, currentFamily.consonant).syllable;
  const choices = [answer, ...distractors(answer)];
  const shift = (familyIndex + wordIndex) % choices.length;
  return { family: currentFamily, word, answer, options: [...choices.slice(shift), ...choices.slice(0, shift)] };
}

function maintenanceRound(): Round {
  const currentFamily = set().families[maintenanceIndex % set().families.length];
  const samples = sampleWords(currentFamily);
  const word = samples[(maintenanceIndex + 1) % samples.length];
  const answer = targetSyllable(word, currentFamily.consonant).syllable;
  const choices = [answer, ...distractors(answer)];
  const shift = maintenanceIndex % choices.length;
  return { family: currentFamily, word, answer, options: [...choices.slice(shift), ...choices.slice(0, shift)] };
}

function round(): Round { return screen === "maintenance" ? maintenanceRound() : currentRound(); }

function speak(text: string): void {
  if (!speechEnabled || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.toLocaleLowerCase("pt-BR"));
  utterance.lang = "pt-BR";
  utterance.rate = 0.72;
  speechSynthesis.speak(utterance);
}

function wordParts(item: Round): string {
  const end = item.family.consonant.length + 1;
  const { start } = targetSyllable(item.word, item.family.consonant);
  return `<span>${item.word.slice(0, start)}</span><strong class="${feedback === "correct" ? "revealed" : ""}">${feedback === "correct" ? item.word.slice(start, start + end) : "?"}</strong><span>${item.word.slice(start + end)}</span>`;
}

function topNav(): string {
  return `<nav>
    <button class="back-button" data-action="back" aria-label="Voltar">${screen === "welcome" ? "‹ JOGOS" : "‹ CONJUNTOS"}</button>
    <div class="brand"><i>✦</i> SÍLABAS</div>
    <button class="sound-button" data-action="sound" aria-label="Ligar ou desligar voz">${speechEnabled ? "🔊" : "🔇"}</button>
  </nav>`;
}

function renderWelcome(): void {
  app.innerHTML = `<main class="syllables-shell welcome">
    ${topNav()}
    <header>
      <p class="eyebrow">OFICINA DE PALAVRAS</p>
      <h1>Vamos montar<br><em>palavras?</em></h1>
      <p>Escolha um conjunto e encontre a sílaba que está faltando.</p>
    </header>
    <section class="set-grid" aria-label="Conjuntos de sílabas">
      ${syllableSets.map((item, index) => `<button class="set-card" data-set="${index}" style="--set:${item.color};--soft:${item.softColor}" aria-label="Jogar conjunto ${item.id}">
        <span class="set-number">CONJUNTO <b>${item.id}</b></span>
        <div class="family-letters">${item.families.map(family => `<strong>${family.consonant}</strong>`).join("")}</div>
        <small>${item.families.map(family => family.label.split(" • ")[0]).join(" · ")}</small>
        <span class="play-label">JOGAR <b>→</b></span>
      </button>`).join("")}
    </section>
    <p class="welcome-note">Comece pelo conjunto 1 e avance na ordem para evitar sons parecidos.</p>
  </main>`;
}

function renderGame(): void {
  const item = round();
  const total = screen === "maintenance" ? set().families.length : set().families.length * 3;
  const progress = screen === "maintenance" ? maintenanceIndex : familyIndex * 3 + wordIndex;
  const message = feedback === "wrong" ? "QUASE! OUÇA E TENTE OUTRA SÍLABA." : feedback === "correct" ? `ISSO! ${item.word}.` : "QUAL SÍLABA COMPLETA A PALAVRA?";
  app.innerHTML = `<main class="syllables-shell game" style="--set:${set().color};--soft:${set().softColor}">
    ${topNav()}
    <header class="game-header">
      <div><p class="eyebrow">${screen === "maintenance" ? "REVISÃO DO CONJUNTO" : `CONJUNTO ${set().id} · FAMÍLIA DO ${item.family.consonant}`}</p>
      <h1>${screen === "maintenance" ? "Hora de relembrar!" : item.family.label}</h1></div>
      <button class="listen-button" data-action="listen"><span>🔊</span> OUVIR</button>
    </header>
    <div class="progress" aria-label="Progresso: ${progress + 1} de ${total}">
      ${Array.from({ length: total }, (_, index) => `<i class="${index < progress ? "done" : index === progress ? "current" : ""}"></i>`).join("")}
    </div>
    <section class="workbench">
      <div class="word-card">
        <span class="word-label">COMPLETE</span>
        <div class="word" aria-label="Palavra incompleta">${wordParts(item)}</div>
        <button class="word-audio" data-action="listen" aria-label="Ouvir a palavra">🔊</button>
      </div>
      <div class="arrow" aria-hidden="true">↓</div>
      <div class="syllable-options" aria-label="Opções de sílabas">
        ${item.options.map((option, index) => `<button data-option="${index}" class="${selectedOption === index ? "selected" : ""} ${feedback === "correct" && option === item.answer ? "correct" : ""}" aria-label="Sílaba ${option}">
          <kbd>${index + 1}</kbd><strong>${option}</strong><span>✓</span>
        </button>`).join("")}
      </div>
    </section>
    <footer class="${feedback}" role="status"><b>${feedback === "correct" ? "★" : feedback === "wrong" ? "↻" : "?"}</b><span>${message}</span><small><kbd>←</kbd><kbd>→</kbd> + <kbd>ESPAÇO</kbd></small></footer>
  </main>`;
}

function renderFinished(): void {
  app.innerHTML = `<main class="syllables-shell finished" style="--set:${set().color};--soft:${set().softColor}">
    ${topNav()}
    <section class="finish-card">
      <div class="celebration">★ ✦ ★</div>
      <p class="eyebrow">CONJUNTO ${set().id} COMPLETO</p>
      <h1>Palavras<br><em>montadas!</em></h1>
      <div class="finish-families">${set().families.map(family => `<span><b>${family.consonant}</b><small>${family.label}</small></span>`).join("")}</div>
      <div class="finish-actions">
        <button data-action="replay">↻ JOGAR DE NOVO</button>
        ${selectedSet < syllableSets.length - 1 ? `<button class="next-set" data-action="next-set">CONJUNTO ${set().id + 1} →</button>` : ""}
      </div>
    </section>
  </main>`;
}

function render(): void {
  if (screen === "welcome") renderWelcome();
  else if (screen === "finished") renderFinished();
  else renderGame();
}

function startSet(index: number): void {
  window.clearTimeout(advanceTimer);
  selectedSet = index;
  familyIndex = 0;
  wordIndex = 0;
  maintenanceIndex = 0;
  selectedOption = 0;
  feedback = "idle";
  screen = "playing";
  render();
  window.setTimeout(() => speak(`Complete a palavra ${round().word}`), 250);
}

function choose(index: number): void {
  if ((screen !== "playing" && screen !== "maintenance") || feedback === "correct") return;
  selectedOption = index;
  const item = round();
  if (item.options[index] !== item.answer) {
    feedback = "wrong";
    render();
    speak(`Quase. ${item.word}. Qual sílaba está faltando?`);
    return;
  }
  feedback = "correct";
  render();
  speak(item.word);
  advanceTimer = window.setTimeout(advanceRound, 1500);
}

function advanceRound(): void {
  feedback = "idle";
  selectedOption = 0;
  if (screen === "maintenance") {
    maintenanceIndex += 1;
    if (maintenanceIndex >= set().families.length) {
      screen = "finished";
      render();
      speak(`Muito bem! Conjunto ${set().id} completo.`);
      return;
    }
  } else {
    wordIndex += 1;
    if (wordIndex >= 3) {
      wordIndex = 0;
      familyIndex += 1;
    }
    if (familyIndex >= set().families.length) {
      screen = "maintenance";
      maintenanceIndex = 0;
    }
  }
  render();
  speak(`Complete a palavra ${round().word}`);
}

document.addEventListener("keydown", event => {
  if (!["playing", "maintenance"].includes(screen)) return;
  const optionCount = round().options.length;
  if (event.code === "ArrowLeft") { selectedOption = (selectedOption - 1 + optionCount) % optionCount; feedback = "idle"; render(); }
  if (event.code === "ArrowRight") { selectedOption = (selectedOption + 1) % optionCount; feedback = "idle"; render(); }
  if (event.code === "Space" || event.code === "Enter") { event.preventDefault(); choose(selectedOption); }
  if (/^[1-3]$/.test(event.key)) choose(Number(event.key) - 1);
});

app.addEventListener("click", event => {
  const target = event.target as HTMLElement;
  const setButton = target.closest<HTMLButtonElement>("[data-set]");
  if (setButton) { startSet(Number(setButton.dataset.set)); return; }
  const option = target.closest<HTMLButtonElement>("[data-option]");
  if (option) { choose(Number(option.dataset.option)); return; }
  const action = target.closest<HTMLButtonElement>("[data-action]")?.dataset.action;
  if (action === "back") {
    if (screen === "welcome") window.location.href = "/";
    else { speechSynthesis?.cancel(); screen = "welcome"; render(); }
  }
  if (action === "sound") { speechEnabled = !speechEnabled; speechSynthesis?.cancel(); render(); }
  if (action === "listen" && (screen === "playing" || screen === "maintenance")) speak(`Complete a palavra ${round().word}`);
  if (action === "replay") startSet(selectedSet);
  if (action === "next-set") startSet(selectedSet + 1);
});

render();
