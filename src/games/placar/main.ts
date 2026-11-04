import './style.css';
import { takePenalty, type PenaltyOutcome } from './penalty';
import { teams, type Team, type Position } from './data';
import { addCard, addGoal, advanceMatch, isSentOff, matchClock, MATCH_DURATION_MS, score, type CardColor, type Match, type Side } from './game-state';

const app = document.querySelector<HTMLDivElement>('#app')!;
let chosen: [string, string] = ['', ''];
let screen: 'selection' | 'preview' | 'match' | 'final' = 'selection';
let match: Match = { elapsed: 0, goals: [], cards: [] };
let paused = false;
let pending: Side | null = null;
let pendingAction: 'goal' | 'penalty' | CardColor = 'goal';
let penalty: { player: string; remaining: number | null; outcome: PenaltyOutcome | null } | null = null;
let lastTick = performance.now();
let sound = true;
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
  const side: Side = t.id === chosen[0] ? 0 : 1;
  const sentOff = (name: string) => (screen === 'match' || screen === 'final') && isSentOff(match, side, name);
  return `<section class="lineup"><header>${badge(t)}<div><h2>${escape(t.name)}</h2><span>${t.players.filter(player => !sentOff(player.name)).length} em campo</span></div></header>
    <div class="pitch" aria-label="Escalação de ${escape(t.name)}">
      <div class="pitch-lines" aria-hidden="true"><i class="box top"></i><i class="box bottom"></i><i class="circle"></i><i class="halfway"></i></div>
      ${positions.flatMap(position => {
        const players = t.players.filter(player => player.position === position);
        const rows = players.length > 4 ? [players.slice(0, Math.ceil(players.length / 2)), players.slice(Math.ceil(players.length / 2))] : [players];
        return rows.filter(row => row.length).map(row => `<div class="pitch-row">${row.map(player => `<button type="button" class="pitch-player ${sentOff(player.name) ? 'sent-off' : ''}" ${sentOff(player.name) ? 'disabled' : ''} data-pitch-team="${t.id}" data-pitch-player="${t.players.indexOf(player)}" aria-label="Ouvir ${escape(playerDescription(player))}"><span class="shirt" style="--club:${t.color}" aria-hidden="true">${position === 'GOL' ? '🧤' : '●'}</span><span>${escape(player.name)}${sentOff(player.name) ? ' · Expulso' : ''}</span></button>`).join('')}</div>`);
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
    <section class="team-selector" aria-label="Escolha os times"><h2 id="selection-prompt" role="status">${!chosen[0] ? 'Escolha o Time 1' : !chosen[1] ? 'Escolha o Time 2' : 'Times escolhidos'}</h2><p>Primeiro escolha o Time 1. Depois, o Time 2. Para trocar, clique novamente em um time escolhido.</p><div class="club-grid">${teams.map(t => {
      const side = chosen.indexOf(t.id);
      return `<button class="club-option ${side !== -1 ? 'selected' : ''}" data-team="${t.id}" aria-pressed="${side !== -1}" aria-label="${escape(t.name)}${side !== -1 ? `, Time ${side + 1}, clique para remover` : ''}" ${side === -1 && chosen[0] && chosen[1] ? 'disabled' : ''}>${badge(t)}<span>${escape(t.name)}</span>${side !== -1 ? `<b>Time ${side + 1}</b>` : ''}</button>`;
    }).join('')}</div></section>
    <div class="selection-footer"><p>Brasileirão Série A · Escalações com fontes e datas</p><button class="primary" id="preview" ${!chosen[0] || !chosen[1] ? 'disabled' : ''}>Ver os times <span>→</span></button></div>`;
}
function preview(): string {
  return `<section class="section-heading"><p class="eyebrow">TUDO PRONTO PARA ENTRAR EM CAMPO</p><h1>Os escalados</h1><p>Conheça os jogadores. Quando quiser, dê o apito inicial.</p></section><div class="pitches">${pitch(team(0))}${pitch(team(1))}</div><div class="actions"><button id="change">← Trocar times</button><button class="primary" id="start">▶ Começar partida</button></div>`;
}
function arena(): string {
  const final = screen === 'final';
  return `<section class="arena-heading"><p class="eyebrow">${final ? 'APITO FINAL' : 'O SEU JOGO ESTÁ NO AR'}</p><h1>${final ? 'Fim de jogo!' : 'Vale a sua torcida.'}</h1></section>
    <section class="scoreboard" aria-label="Placar da partida"><div class="broadcast-clock"><span id="period">${final ? 'FIM' : match.elapsed < MATCH_DURATION_MS / 2 ? '1º T' : '2º T'}</span><b id="clock">${matchClock(match.elapsed)}</b></div><div class="score-panels">${([0, 1] as Side[]).map(side => `<div class="score-panel ${side === 1 ? 'away' : ''}" style="--club:${team(side).color}"><span class="score-club">${badge(team(side))}<span>${escape(team(side).shortName)}</span></span><strong id="score-${side}">${score(match, side)}</strong></div>`).join('')}</div><div class="score-names"><span>${escape(team(0).name)}</span><span>${escape(team(1).name)}</span></div></section>
    ${final ? `<p class="final-message" role="status">${score(match, 0) === score(match, 1) ? 'Tudo igual por aqui. Que partida!' : `${escape(team(score(match, 0) > score(match, 1) ? 0 : 1).name)} venceu!`} Obrigado por jogar.</p>` : `<div class="goal-controls">${([0, 1] as Side[]).map(side => `<button class="goal-button" data-goal="${side}" ${paused ? 'disabled' : ''}><span>⚽ GOL!</span><small>${escape(team(side).name)}</small></button>`).join('')}</div>${penaltyControls()}${cardControls()}<div class="match-controls"><button id="pause" aria-pressed="${paused}">${paused ? '▶ Continuar' : 'Ⅱ Pausar'}</button><span id="remaining">${remaining()}</span><button id="undo" ${!match.goals.length ? 'disabled' : ''}>↶ Desfazer último gol</button><button id="change">← Escolher outros times</button></div><p class="helper">${paused ? 'Partida pausada. Continue quando quiser.' : 'Escolha gol, pênalti ou cartão e depois o jogador. O relógio espera você escolher.'}</p>`}
    <section class="goal-history" aria-label="Gols da partida"><h2>Gols da partida</h2>${match.goals.length ? `<ol>${match.goals.map(goal => `<li><b>${goal.minute}′</b><span>⚽ ${escape(goal.player)}</span><small>${escape(team(goal.side).name)}</small></li>`).join('')}</ol>` : '<p>A rede ainda não balançou.</p>'}</section>
    ${cardHistory()}
    ${final ? '<div class="actions"><button id="change">Escolher outros times</button><button class="primary" id="rematch">↻ Jogar de novo</button></div>' : `<details class="field-details"><summary>Ver jogadores em campo</summary><div class="pitches">${pitch(team(0))}${pitch(team(1))}</div></details>`}`;
}
function remaining(): string {
  const seconds = Math.ceil((MATCH_DURATION_MS - match.elapsed) / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} para o apito`;
}
function penaltyControls(): string {
  return `<div class="penalty-controls">${([0, 1] as Side[]).map(side => `<button class="penalty-button" data-penalty="${side}" ${paused ? 'disabled' : ''}><span aria-hidden="true">⚽</span> Pênalti<small>${escape(team(side).name)}</small></button>`).join('')}</div>`;
}
const penaltyMessages: Record<PenaltyOutcome, string> = { saved: 'O goleiro defendeu!', missed: 'O chute foi para fora!', goal: 'Goooool de pênalti!' };
function penaltyStage(side: Side): string {
  if (!penalty || penalty.remaining === null) return '';
  return `<div class="modal-backdrop"><section class="scorer-dialog penalty-dialog" role="dialog" aria-modal="true" aria-labelledby="scorer-title" tabindex="-1"><p class="eyebrow">PÊNALTI · ${escape(team(side).name)}</p><h2 id="scorer-title">${escape(penalty.player)}</h2><div class="penalty-scene" aria-hidden="true"><div class="penalty-net">🧤</div><div class="penalty-ball">⚽</div></div><p id="penalty-status" class="penalty-status" role="status" aria-live="polite">${penalty.outcome ? penaltyMessages[penalty.outcome] : Math.ceil(penalty.remaining / 1000)}</p>${penalty.outcome ? '<button class="primary" id="penalty-continue">Continuar partida</button>' : '<p>A cobrança já vai começar…</p>'}</section></div>`;
}
function updatePenalty(delta: number): void {
  if (pendingAction !== 'penalty' || pending === null || !penalty || penalty.remaining === null || penalty.outcome || document.hidden) return;
  const previous = Math.ceil(penalty.remaining / 1000);
  penalty.remaining = Math.max(0, penalty.remaining - Math.max(0, delta));
  const count = Math.ceil(penalty.remaining / 1000);
  if (count > 0) {
    const status = document.querySelector('#penalty-status');
    if (status) status.textContent = String(count);
    if (count !== previous) speak(String(count));
    return;
  }
  const result = takePenalty(match, pending, penalty.player);
  if (!result) { cancelGoal(); return; }
  match = result.match; penalty.outcome = result.outcome;
  render(); document.querySelector<HTMLButtonElement>('#penalty-continue')?.focus();
  speak(`${penaltyMessages[result.outcome]} ${penalty.player}. Placar: ${team(0).name}, ${score(match, 0)}. ${team(1).name}, ${score(match, 1)}.`);
}
function cardControls(): string {
  return `<div class="card-controls">${([0, 1] as Side[]).map(side => `<section aria-label="Cartões de ${escape(team(side).name)}"><h2>${escape(team(side).name)}</h2>${(['yellow', 'red'] as CardColor[]).map(color => `<button class="card-button ${color}" data-card="${color}" data-side="${side}" ${paused ? 'disabled' : ''}><span aria-hidden="true">${color === 'yellow' ? '🟨' : '🟥'}</span> Cartão ${color === 'yellow' ? 'amarelo' : 'vermelho'}</button>`).join('')}</section>`).join('')}</div>`;
}
function cardHistory(): string {
  return `<section class="goal-history" aria-label="Cartões da partida"><h2>Cartões da partida</h2>${match.cards.length ? `<ol>${match.cards.map(card => `<li><b>${card.minute}′</b><span>${card.color === 'yellow' ? '🟨 Amarelo' : '🟥 Vermelho'} · ${escape(card.player)}</span><small>${escape(team(card.side).name)}</small></li>`).join('')}</ol>${screen === 'match' ? '<button id="undo-card">↶ Desfazer último cartão</button>' : ''}` : '<p>Nenhum cartão por enquanto.</p>'}</section>`;
}
function pendingButton(side: Side): HTMLButtonElement | null {
  return document.querySelector<HTMLButtonElement>(pendingAction === 'penalty' ? `[data-penalty="${side}"]` : pendingAction === 'goal' ? `[data-goal="${side}"]` : `[data-card="${pendingAction}"][data-side="${side}"]`);
}
function playerCardSummary(side: Side, player: string): string {
  const cards = match.cards.filter(card => card.side === side && card.player === player);
  const yellow = cards.filter(card => card.color === 'yellow').length;
  const red = cards.filter(card => card.color === 'red').length;
  if (!yellow && !red) return '';
  return `<small class="player-card-summary">${yellow ? `<span><span aria-hidden="true">🟨</span> ${yellow} ${yellow === 1 ? 'amarelo' : 'amarelos'}</span>` : ''}${red ? `<span><span aria-hidden="true">🟥</span> ${red} ${red === 1 ? 'vermelho' : 'vermelhos'}</span>` : ''}</small>`;
}
function scorerDialog(side: Side): string {
  if (pendingAction === 'penalty' && penalty?.remaining !== null && penalty) return penaltyStage(side);
  const goal = pendingAction === 'goal';
  const isPenalty = pendingAction === 'penalty';
  const label = isPenalty ? '⚽ PÊNALTI' : goal ? '⚽ GOL' : pendingAction === 'yellow' ? '🟨 CARTÃO AMARELO' : '🟥 CARTÃO VERMELHO';
  return `<div class="modal-backdrop"><section class="scorer-dialog" role="dialog" aria-modal="true" aria-labelledby="scorer-title" tabindex="-1"><p class="eyebrow">${label} · ${escape(team(side).shortName)}</p><h2 id="scorer-title">${isPenalty ? 'Quem vai bater o pênalti?' : goal ? 'Quem fez o gol?' : 'Quem recebeu o cartão?'}</h2><p>Escolha o jogador. O relógio está pausado.</p><div class="scorer-grid">${team(side).players.map((player, index) => `<button data-player="${index}" data-side="${side}" aria-pressed="${isPenalty && penalty?.player === player.name}" ${isSentOff(match, side, player.name) ? 'disabled' : ''}><span aria-hidden="true">${goal || isPenalty ? '⚽' : pendingAction === 'yellow' ? '🟨' : '🟥'}</span> ${escape(player.name)}${isSentOff(match, side, player.name) ? ' · Expulso' : ''}${!goal && !isPenalty ? playerCardSummary(side, player.name) : ''}</button>`).join('')}</div>${isPenalty ? `<button class="primary" id="penalty-kick" ${!penalty?.player ? 'disabled' : ''}>⚽ Chutar</button>` : ''}<button id="cancel-goal">← Voltar sem registrar</button></section></div>`;
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
  match = { elapsed: 0, goals: [], cards: [] }; paused = false; pending = null; penalty = null;
  screen = 'match'; lastTick = performance.now(); render(); speak('Começa a partida!');
}
function bind() {
  document.querySelectorAll<HTMLButtonElement>('[data-pitch-player]').forEach(button => button.onclick = () => {
    const player = teams.find(t => t.id === button.dataset.pitchTeam)?.players[Number(button.dataset.pitchPlayer)];
    if (player) speak(playerDescription(player), true);
  });
  document.querySelector('#sound')?.addEventListener('click', () => { sound = !sound; render(); if (sound) speak('Narração ativada'); else if ('speechSynthesis' in window) speechSynthesis.cancel(); });
  document.querySelectorAll<HTMLButtonElement>('[data-team]').forEach(button => button.onclick = () => {
    const id = button.dataset.team!;
    const selected = chosen.indexOf(id);
    if (selected !== -1) {
      const remaining = chosen.filter(value => value && value !== id);
      chosen = [remaining[0] ?? '', ''];
    } else if (!chosen[0]) chosen[0] = id;
    else if (!chosen[1]) chosen[1] = id;
    render();
    document.querySelector<HTMLButtonElement>(`[data-team="${id}"]`)?.focus();
    speak(!chosen[0] ? 'Escolha o Time 1' : !chosen[1] ? 'Escolha o Time 2' : `${team(0).name}, Time 1. ${team(1).name}, Time 2.`);
  });
  document.querySelector('#preview')?.addEventListener('click', () => { screen = 'preview'; render(); window.scrollTo(0, 0); });
  document.querySelector('#change')?.addEventListener('click', () => { screen = 'selection'; render(); });
  document.querySelector('#start')?.addEventListener('click', start);
  document.querySelector('#rematch')?.addEventListener('click', start);
  document.querySelector('#pause')?.addEventListener('click', () => { syncClock(); if (screen !== 'match') return; paused = !paused; render(); document.querySelector<HTMLButtonElement>('#pause')?.focus(); });
  document.querySelector('#undo')?.addEventListener('click', () => { syncClock(); if (screen !== 'match') return; match = { ...match, goals: match.goals.slice(0, -1) }; render(); });
  document.querySelectorAll<HTMLButtonElement>('[data-goal]').forEach(button => button.onclick = () => {
    syncClock(); if (screen !== 'match' || paused) return;
    pendingAction = 'goal'; pending = Number(button.dataset.goal) as Side; render();
    document.querySelector<HTMLButtonElement>('.scorer-grid button:not(:disabled), #cancel-goal')?.focus();
  });
  document.querySelector('#undo-card')?.addEventListener('click', () => {
    syncClock(); if (screen !== 'match') return;
    match = { ...match, cards: match.cards.slice(0, -1) }; render();
    document.querySelector<HTMLButtonElement>('#undo-card')?.focus();
  });
  document.querySelectorAll<HTMLButtonElement>('[data-card]').forEach(button => button.onclick = () => {
    syncClock(); if (screen !== 'match' || paused) return;
    pendingAction = button.dataset.card as CardColor;
    pending = Number(button.dataset.side) as Side; render();
    document.querySelector<HTMLButtonElement>('.scorer-grid button:not(:disabled), #cancel-goal')?.focus();
  });
  document.querySelectorAll<HTMLButtonElement>('[data-penalty]').forEach(button => button.onclick = () => {
    syncClock(); if (screen !== 'match' || paused) return;
    pendingAction = 'penalty'; pending = Number(button.dataset.penalty) as Side;
    penalty = { player: '', remaining: null, outcome: null };
    render(); document.querySelector<HTMLButtonElement>('.scorer-grid button:not(:disabled), #cancel-goal')?.focus();
    speak('Escolha o batedor e depois clique em Chutar.');
  });
  document.querySelector('#penalty-kick')?.addEventListener('click', () => {
    if (pending === null || !penalty?.player || penalty.remaining !== null || isSentOff(match, pending, penalty.player)) return;
    penalty.remaining = 3000; lastTick = performance.now();
    render(); document.querySelector<HTMLElement>('.penalty-dialog')?.focus(); speak('3');
  });
  document.querySelector('#penalty-continue')?.addEventListener('click', cancelGoal);
  document.querySelectorAll<HTMLButtonElement>('[data-player]').forEach(button => button.onclick = () => {
    if (pending === null) return;
    const side = pending;
    const player = team(side).players[Number(button.dataset.player)];
    if (isSentOff(match, side, player.name)) return;
    if (pendingAction === 'penalty') {
      if (!penalty || penalty.remaining !== null) return;
      penalty.player = player.name; render();
      document.querySelector<HTMLButtonElement>('#penalty-kick')?.focus();
      speak(`${player.name}. Clique em Chutar.`); return;
    }
    const goal = pendingAction === 'goal';
    match = goal ? addGoal(match, side, player.name) : addCard(match, side, player.name, pendingAction as CardColor);
    pending = null; lastTick = performance.now(); render();
    pendingButton(side)?.focus();
    speak(goal ? `Gol de ${player.name}! Placar: ${team(0).name}, ${score(match, 0)}. ${team(1).name}, ${score(match, 1)}.` : `Cartão ${pendingAction === 'yellow' ? 'amarelo' : 'vermelho'} para ${player.name}, do ${team(side).name}.${isSentOff(match, side, player.name) ? ' Jogador expulso.' : ''}`);
  });
  document.querySelector('#cancel-goal')?.addEventListener('click', cancelGoal);
}
function cancelGoal() {
  const side = pending; pending = null; penalty = null; lastTick = performance.now(); render();
  if (side !== null) pendingButton(side)?.focus();
}
document.addEventListener('keydown', event => {
  if (pending === null) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    if (pendingAction !== 'penalty' || penalty?.remaining === null || penalty?.outcome) cancelGoal();
    return;
  }
  if (event.key === 'Tab') {
    const buttons = [...document.querySelectorAll<HTMLButtonElement>('.scorer-dialog button:not(:disabled)')];
    if (!buttons.length) { event.preventDefault(); return; }
    const first = buttons[0], last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && screen === 'match') { syncClock(); if (screen === 'match') { paused = true; render(); } }
});
window.setInterval(() => {
  const penaltyDelta = performance.now() - lastTick;
  syncClock();
  updatePenalty(penaltyDelta);
  if (screen !== 'match') return;
  const clock = document.querySelector('#clock'); if (clock) clock.textContent = matchClock(match.elapsed);
  const period = document.querySelector('#period'); if (period) period.textContent = match.elapsed < MATCH_DURATION_MS / 2 ? '1º T' : '2º T';
  const left = document.querySelector('#remaining'); if (left) left.textContent = remaining();
}, 100);
render();
