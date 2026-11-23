import './style.css';
import { players, slots, team, type Player } from './data';
import { candidates, choose, nextSlot, type Lineup } from './game-state';

const app = document.querySelector<HTMLDivElement>('#app')!;
let started = false;
let lineup: Lineup = {};
let active: string | undefined;
let sound = true;
function speak(text: string, force = false) {
  if ((!sound && !force) || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const voice = new SpeechSynthesisUtterance(text);
  voice.lang = 'pt-BR'; voice.rate = 0.85;
  window.speechSynthesis.speak(voice);
}
function prompt() {
  return active ? `Quem será o ${slots.find(s => s.id === active)!.name}?` : 'Seu time está escalado! Toque em um jogador para trocar.';
}
function portrait(player: Player) {
  return `<span class="esc-avatar"><span class="esc-portrait"><img src="${player.photo}" alt=""></span><b class="esc-number" aria-hidden="true">${player.number}</b></span>`;
}
function field() {
  return `<div class="esc-field" aria-label="Campinho com formação 4–3–3"><div class="esc-markings" aria-hidden="true"><i class="esc-half"></i><i class="esc-circle"></i><i class="esc-area top"></i><i class="esc-area bottom"></i></div>${slots.map(slot => {
    const player = players.find(p => p.id === lineup[slot.id]);
    return `<button class="esc-position ${active === slot.id ? 'active' : ''} ${player ? 'filled' : ''}" style="--x:${slot.x}%;--y:${slot.y}%" data-slot="${slot.id}" aria-label="${slot.name}${player ? `: ${player.name}, camisa ${player.number}. Trocar jogador` : '. Ainda não escalado'}" ${!player && slot.id !== active ? 'disabled' : ''}>${player ? ` ${portrait(player)}<strong>${player.name}</strong>` : `<span class="esc-empty">${active === slot.id ? '?' : slot.short}</span>`}<small>${slot.short}</small></button>`;
  }).join('')}</div>`;
}
function render(focus = false) {
  const count = Object.keys(lineup).length;
  app.innerHTML = `<main class="esc-game"><header class="esc-header"><a href="/">Estação de Jogos</a><span>ESCALAÇÃO</span><button data-action="sound" aria-pressed="${sound}">${sound ? '🔊 Voz ligada' : '🔇 Voz desligada'}</button></header>${!started ? `
    <section class="esc-welcome"><p class="esc-eyebrow">VOCÊ É O TÉCNICO</p><h1>Vamos escalar<br>o seu time?</h1><p>Escolha o time base. Depois, escolha um jogador para cada posição.</p><button class="esc-team" data-action="start"><img src="${team.crest}" alt="Escudo do São Paulo"><strong>São Paulo</strong><span>Escolher este time</span></button><p class="esc-note">11 jogadores · Formação 4–3–3 · Sem pressa</p></section>` : `
    <div class="esc-title"><div><p class="esc-eyebrow">${team.name.toUpperCase()} · 4–3–3</p><h1>${active ? 'Monte seu time' : 'Time escalado!'}</h1></div><div class="esc-count"><strong>${count}<span> / 11</span></strong><span>jogadores escalados</span></div></div>
    <div class="esc-layout"><section class="esc-picker" aria-labelledby="esc-question"><div class="esc-progress" aria-label="${count} de 11 jogadores"><span style="width:${count / 11 * 100}%"></span></div><p class="esc-eyebrow">${active ? `ESCOLHA · ${slots.findIndex(s => s.id === active) + 1} DE 11` : 'PRONTO PARA ENTRAR EM CAMPO'}</p><h2 id="esc-question" tabindex="-1">${prompt()}</h2><button class="esc-listen" data-action="listen">🔊 Ouvir ${active ? 'a pergunta' : 'a escalação'}</button>${active ? `<p class="esc-help">Toque na foto de quem você quer escalar.</p><div class="esc-options">${candidates(lineup, active).map(p => `<button class="esc-player ${lineup[active!] === p.id ? 'selected' : ''}" data-player="${p.id}" aria-label="Escalar ${p.name}, camisa ${p.number}">${portrait(p)}<strong>${p.name}</strong><small>${p.position}</small></button>`).join('')}</div>` : `<div class="esc-complete"><span aria-hidden="true">⚽</span><p>Seu São Paulo está pronto!</p><p>Para mudar a escalação, toque em uma foto no campinho.</p></div>`}<div class="esc-actions">${active && nextSlot(lineup) === undefined ? '<button data-action="done">Voltar ao time escalado</button>' : ''}${active && count > 0 && nextSlot(lineup) !== undefined ? '<button data-action="back">Voltar uma posição</button>' : ''}<button data-action="reset">Escolher time novamente</button></div></section><section class="esc-pitch-panel" aria-label="Sua escalação"><div class="esc-pitch-heading"><img src="${team.crest}" alt=""><strong>São Paulo</strong><span>4–3–3</span></div>${field()}<p>ATAQUE NO ALTO · GOLEIRO EMBAIXO</p></section></div>`}<footer class="esc-footer">Elenco e fotos: <a href="https://www.saopaulofc.net/esporte/futebol-masculino-profissional/" target="_blank" rel="noopener noreferrer">site oficial do São Paulo FC</a> · Números: <a href="https://www.espn.com.br/futebol/time/elenco/_/id/2026/bra.sao_paulo" target="_blank" rel="noopener noreferrer">ESPN</a> e SPFC · Consulta em 23/11/2026</footer></main>`;
  app.querySelectorAll<HTMLButtonElement>('[data-player]').forEach(button => button.onclick = () => {
    if (!active) return;
    const player = players.find(p => p.id === button.dataset.player)!;
    lineup = choose(lineup, active, player.id);
    active = nextSlot(lineup);
    render(true); speak(`${player.name}, camisa ${player.number}, escalado. ${prompt()}`);
  });
  app.querySelectorAll<HTMLButtonElement>('[data-slot]').forEach(button => button.onclick = () => {
    active = button.dataset.slot;
    const player = players.find(p => p.id === lineup[active!]);
    render(true);
    speak(player ? `${player.name}, camisa ${player.number}.` : prompt(), true);
  });
  app.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button => button.onclick = () => {
    switch (button.dataset.action) {
      case 'start': started = true; active = slots[0].id; render(true); speak(prompt()); break;
      case 'sound': sound = !sound; if (!sound && 'speechSynthesis' in window) window.speechSynthesis.cancel(); render(); if (sound) speak(started ? prompt() : 'Escolha o time base.'); break;
      case 'listen': speak(active ? prompt() : slots.map(s => { const p = players.find(p => p.id === lineup[s.id]); return p ? `${s.name}: ${p.name}, camisa ${p.number}` : ''; }).join('. '), true); break;
      case 'reset': started = false; lineup = {}; active = undefined; if ('speechSynthesis' in window) window.speechSynthesis.cancel(); render(); app.querySelector<HTMLButtonElement>('[data-action="start"]')?.focus(); break;
      case 'done': active = undefined; render(true); speak(prompt()); break;
      case 'back': active = slots[Math.max(0, slots.findIndex(s => s.id === active) - 1)].id; render(true); speak(prompt()); break;
    }
  });
  if (focus) app.querySelector<HTMLElement>('#esc-question')?.focus();
}
window.addEventListener('pagehide', () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); });
render();
