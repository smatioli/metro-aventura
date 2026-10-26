import './style.css';
import { teams, type Team, type Position } from './data';
import { addGoal, advanceMatch, matchClock, MATCH_DURATION_MS, score, type Match, type Side } from './game-state';

const app = document.querySelector<HTMLDivElement>('#app')!;
let chosen: [string, string] = ['', ''];
let screen: 'selection' | 'preview' | 'match' | 'final' = 'selection';
let match: Match = { elapsed: 0, goals: [] };
let paused = false;
let pending: Side | null = null;
let lastTick = performance.now();
let sound = false;
const escape = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const team = (side: Side): Team => teams.find(t => t.id === chosen[side])!;
const badge = (t: Team) => `<img class="club-badge" src="/games/jogo-da-memoria/img/times/${t.id}.png" alt="" width="44" height="44">`;
const displayDate = (date: string) => date.split('-').reverse().join('/');
const positionNames: Record<Position, string> = { GOL: 'goleiro', DEF: 'defensor', MEI: 'meio-campista', ATA: 'atacante' };
const playerDescription = (player: Team['players'][number]) => [player.name, positionNames[player.position]].filter(Boolean).join(', ');
const speak = (text: string, requested = false) => {
  if ((!sound && !requested) || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const voice = new SpeechSynthesisUtterance(text);
  voice.lang = 'pt-BR'; voice.rate = 0.85;
  speechSynthesis.speak(voice);
};

function pitch(t: Team): string {
  const positions = ['ATA', 'MEI', 'DEF', 'GOL'];
  return `<section class="lineup"><header>${badge(t)}<div><h2>${escape(t.name)}</h2><span>11 em campo</span></div></header>
    <div class="pitch" aria-label="Escalação de ${escape(t.name)}">
      <div class="pitch-lines" aria-hidden="true"><i class="box top"></i><i class="box bottom"></i><i class="circle"></i><i class="halfway"></i></div>
      ${positions.flatMap(position => {
        const players = t.players.filter(player => player.position === position);
        const rows = players.length > 4 ? [players.slice(0, Math.ceil(players.length / 2)), players.slice(Math.ceil(players.length / 2))] : [players];
        return rows.filter(row => row.length).map(row => `<div class="pitch-row">${row.map(player => `<button type="button" class="pitch-player" data-pitch-team="${t.id}" data-pitch-player="${t.players.indexOf(player)}" aria-label="Ouvir ${escape(playerDescription(player))}"><span class="shirt" style="--club:${t.color}" aria-hidden="true">${position === 'GOL' ? '🧤' : '●'}</span><span>${escape(player.name)}</span></button>`).join('')}</div>`);
      }).join('')}
    </div><details class="lineup-source"><summary>Sobre esta escalação</summary><p>Partida de ${escape(displayDate(t.matchDate))}. Os titulares podem mudar a cada jogo. Posições agrupadas para apresentação.</p><a href="${escape(t.source)}" target="_blank" rel="noopener noreferrer">Ver fonte da escalação ↗</a></details></section>`;
}

function render() {
  app.innerHTML = `<main class="placar-app"><header class="topbar"><a href="/">← Jogos</a><a class="brand" href="/placar/">⚽ PLACAR</a><button id="sound" aria-pressed="${sound}" aria-label="${sound ? 'Desativar' : 'Ativar'} narração">${sound ? '🔊' : '🔇'} <span>Narração</span></button></header>
    ${screen === 'selection' ? selection() : screen === 'preview' ? preview() : arena()}
    ${pending !== null ? scorerDialog(pending) : ''}</main>`;
  if (pending !== null) {
    document.querySelectorAll<HTMLElement>('.placar-app > :not(.modal-backdrop)').forEach(element => { element.inert = true; });
  }
  bind();
}
function selection(): string {
  return `<section class="welcome"><p class="eyebrow">VOCÊ COMANDA O JOGO</p><h1>Um clássico.<br>Do seu jeito.</h1><p>Escolha dois times, marque os gols e decida quem balança a rede.</p><span class="duration">◷ 4 minutos de partida = 90 minutos em campo</span></section>
    <section class="team-selectors" aria-label="Escolha os times">${([0, 1] as Side[]).map(side => `<div class="team-selector"><h2><span>${side + 1}</span> ${side === 0 ? 'Time da casa' : 'Time visitante'}</h2><div class="club-grid">${teams.map(t => `<button class="club-option ${chosen[side] === t.id ? 'selected' : ''}" data-team="${t.id}" data-side="${side}" aria-pressed="${chosen[side] === t.id}" ${chosen[side === 0 ? 1 : 0] === t.id ? 'disabled' : ''}>${badge(t)}<span>${escape(t.name)}</span>${chosen[side] === t.id ? '<b aria-hidden="true">✓</b>' : ''}</button>`).join('')}</div></div>`).join('')}</section>
    <div class="selection-footer"><p>Brasileirão Série A · Escalações com fontes e datas</p><button class="primary" id="preview" ${!chosen[0] || !chosen[1] ? 'disabled' : ''}>Ver os times <span>→</span></button></div>`;
}
function preview(): string {
  return `<section class="section-heading"><p class="eyebrow">TUDO PRONTO PARA ENTRAR EM CAMPO</p><h1>Os escalados</h1><p>Conheça os jogadores. Quando quiser, dê o apito inicial.</p></section><div class="pitches">${pitch(team(0))}${pitch(team(1))}</div><div class="actions"><button id="change">← Trocar times</button><button class="primary" id="start">▶ Começar partida</button></div>`;
}
function arena(): string {
  const final = screen === 'final';
  return `<section class="arena-heading"><p class="eyebrow">${final ? 'APITO FINAL' : 'O SEU JOGO ESTÁ NO AR'}</p><h1>${final ? 'Fim de jogo!' : 'Vale a sua torcida.'}</h1></section>
    <section class="scoreboard" aria-label="Placar da partida"><div class="broadcast-clock"><span id="period">${final ? 'FIM' : match.elapsed < MATCH_DURATION_MS / 2 ? '1º T' : '2º T'}</span><b id="clock">${matchClock(match.elapsed)}</b></div><div class="score-panels">${([0, 1] as Side[]).map(side => `<div class="score-panel ${side === 1 ? 'away' : ''}" style="--club:${team(side).color}"><span class="score-club">${badge(team(side))}<span>${escape(team(side).shortName)}</span></span><strong id="score-${side}">${score(match, side)}</strong></div>`).join('')}</div><div class="score-names"><span>${escape(team(0).name)}</span><span>${escape(team(1).name)}</span></div></section>
    ${final ? `<p class="final-message" role="status">${score(match, 0) === score(match, 1) ? 'Tudo igual por aqui. Que partida!' : `${escape(team(score(match, 0) > score(match, 1) ? 0 : 1).name)} venceu!`} Obrigado por jogar.</p>` : `<div class="goal-controls">${([0, 1] as Side[]).map(side => `<button class="goal-button" data-goal="${side}" ${paused ? 'disabled' : ''}><span>⚽ GOL!</span><small>${escape(team(side).name)}</small></button>`).join('')}</div><div class="match-controls"><button id="pause" aria-pressed="${paused}">${paused ? '▶ Continuar' : 'Ⅱ Pausar'}</button><span id="remaining">${remaining()}</span><button id="undo" ${!match.goals.length ? 'disabled' : ''}>↶ Desfazer último gol</button><button id="change">← Escolher outros times</button></div><p class="helper">${paused ? 'Partida pausada. Continue quando quiser.' : 'Clique em GOL e escolha quem marcou. O relógio espera você escolher.'}</p>`}
    <section class="goal-history" aria-label="Gols da partida"><h2>Gols da partida</h2>${match.goals.length ? `<ol>${match.goals.map(goal => `<li><b>${goal.minute}′</b><span>⚽ ${escape(goal.player)}</span><small>${escape(team(goal.side).name)}</small></li>`).join('')}</ol>` : '<p>A rede ainda não balançou.</p>'}</section>
    ${final ? '<div class="actions"><button id="change">Escolher outros times</button><button class="primary" id="rematch">↻ Jogar de novo</button></div>' : `<details class="field-details"><summary>Ver jogadores em campo</summary><div class="pitches">${pitch(team(0))}${pitch(team(1))}</div></details>`}`;
}
function remaining(): string {
  const seconds = Math.ceil((MATCH_DURATION_MS - match.elapsed) / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} para o apito`;
}
function scorerDialog(side: Side): string {
  return `<div class="modal-backdrop"><section class="scorer-dialog" role="dialog" aria-modal="true" aria-labelledby="scorer-title" tabindex="-1"><p class="eyebrow">⚽ GOL DO ${escape(team(side).shortName)}!</p><h2 id="scorer-title">Quem fez o gol?</h2><p>Escolha o jogador. O relógio está pausado.</p><div class="scorer-grid">${team(side).players.map((player, index) => `<button data-player="${index}" data-side="${side}"><span aria-hidden="true">⚽</span> ${escape(player.name)}</button>`).join('')}</div><button id="cancel-goal">← Voltar sem marcar gol</button></section></div>`;
}
function syncClock() {
  const now = performance.now();
  if (screen === 'match' && !paused && pending === null) match = advanceMatch(match, now - lastTick);
  lastTick = now;
  if (screen === 'match' && match.elapsed >= MATCH_DURATION_MS) {
    screen = 'final'; render(); speak('Fim de jogo!');
  }
}
function start() {
  match = { elapsed: 0, goals: [] }; paused = false; pending = null;
  screen = 'match'; lastTick = performance.now(); render(); speak('Começa a partida!');
}
function bind() {
  document.querySelectorAll<HTMLButtonElement>('[data-pitch-player]').forEach(button => button.onclick = () => {
    const player = teams.find(t => t.id === button.dataset.pitchTeam)?.players[Number(button.dataset.pitchPlayer)];
    if (player) speak(playerDescription(player), true);
  });
  document.querySelector('#sound')?.addEventListener('click', () => { sound = !sound; render(); if (sound) speak('Narração ativada'); else if ('speechSynthesis' in window) speechSynthesis.cancel(); });
  document.querySelectorAll<HTMLButtonElement>('[data-team]').forEach(button => button.onclick = () => {
    const side = Number(button.dataset.side) as Side;
    chosen[side] = button.dataset.team!; render();
    document.querySelector<HTMLButtonElement>(`[data-side="${side}"][data-team="${chosen[side]}"]`)?.focus();
  });
  document.querySelector('#preview')?.addEventListener('click', () => { screen = 'preview'; render(); window.scrollTo(0, 0); });
  document.querySelector('#change')?.addEventListener('click', () => { screen = 'selection'; render(); });
  document.querySelector('#start')?.addEventListener('click', start);
  document.querySelector('#rematch')?.addEventListener('click', start);
  document.querySelector('#pause')?.addEventListener('click', () => { syncClock(); if (screen !== 'match') return; paused = !paused; render(); document.querySelector<HTMLButtonElement>('#pause')?.focus(); });
  document.querySelector('#undo')?.addEventListener('click', () => { syncClock(); if (screen !== 'match') return; match = { ...match, goals: match.goals.slice(0, -1) }; render(); });
  document.querySelectorAll<HTMLButtonElement>('[data-goal]').forEach(button => button.onclick = () => {
    syncClock(); if (screen !== 'match' || paused) return;
    pending = Number(button.dataset.goal) as Side; render();
    document.querySelector<HTMLButtonElement>('.scorer-grid button')?.focus();
  });
  document.querySelectorAll<HTMLButtonElement>('[data-player]').forEach(button => button.onclick = () => {
    if (pending === null) return;
    const side = pending;
    const player = team(side).players[Number(button.dataset.player)];
    match = addGoal(match, side, player.name); pending = null; lastTick = performance.now(); render();
    document.querySelector<HTMLButtonElement>(`[data-goal="${side}"]`)?.focus();
    speak(`Gol de ${player.name}! Placar: ${team(0).name}, ${score(match, 0)}. ${team(1).name}, ${score(match, 1)}.`);
  });
  document.querySelector('#cancel-goal')?.addEventListener('click', cancelGoal);
}
function cancelGoal() {
  const side = pending; pending = null; lastTick = performance.now(); render();
  document.querySelector<HTMLButtonElement>(`[data-goal="${side}"]`)?.focus();
}
document.addEventListener('keydown', event => {
  if (pending === null) return;
  if (event.key === 'Escape') { event.preventDefault(); cancelGoal(); return; }
  if (event.key === 'Tab') {
    const buttons = [...document.querySelectorAll<HTMLButtonElement>('.scorer-dialog button')];
    const first = buttons[0], last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && screen === 'match') { syncClock(); if (screen === 'match') { paused = true; render(); } }
});
window.setInterval(() => {
  syncClock();
  if (screen !== 'match') return;
  const clock = document.querySelector('#clock'); if (clock) clock.textContent = matchClock(match.elapsed);
  const period = document.querySelector('#period'); if (period) period.textContent = match.elapsed < MATCH_DURATION_MS / 2 ? '1º T' : '2º T';
  const left = document.querySelector('#remaining'); if (left) left.textContent = remaining();
}, 100);
render();
