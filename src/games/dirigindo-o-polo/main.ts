import './style.css';
import { routes, type Route } from './data';
import { advance, direction, initialState, position, steer } from './game-state';
const app=document.querySelector<HTMLDivElement>('#app')!;
let route: Route=routes[0], state=initialState(), angle=0, frame=0, last=0, muted=false, paused=false;
let active=false, dragging=false, previousPointerAngle=0, spoken='';
function speak(text: string): void {
  if(muted || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel(); const utterance=new SpeechSynthesisUtterance(text); utterance.lang='pt-BR'; utterance.rate=.8; speechSynthesis.speak(utterance);
}
function stop(): void { cancelAnimationFrame(frame); active=false; dragging=false; if('speechSynthesis' in window) speechSynthesis.cancel(); }
function selection(): void {
  stop();
  app.innerHTML=`<main class="polo-trip"><a href="/">← Todos os jogos</a><header><p class="eyebrow">VAMOS PASSEAR · VW POLO</p><h1>Dirigindo o Polo</h1><p>Escolha um passeio. Você comanda o volante!</p></header><section class="route-choices" aria-label="Escolha uma rota">${routes.map((r,i)=>`<article><span class="destination-icon" aria-hidden="true">${r.icon}</span><h2>${r.name}</h2><p>${r.points.length-2} curvas · sem pressa</p><button data-route="${i}">▶ Iniciar passeio</button><button class="secondary" data-hear="${i}" aria-label="Ouvir ${r.name}">🔊 Ouvir</button></article>`).join('')}</section><p class="map-note">Mapas ilustrados de passeios fictícios.</p></main>`;
  app.querySelectorAll<HTMLButtonElement>('[data-route]').forEach(b=>b.onclick=()=>start(routes[Number(b.dataset.route)]));
  app.querySelectorAll<HTMLButtonElement>('[data-hear]').forEach(b=>b.onclick=()=>speak(routes[Number(b.dataset.hear)].name));
}
function instruction(): string {
  if(paused) return 'Passeio pausado';
  if(state.phase==='arrived') return `Chegamos! ${route.destination}!`;
  if(state.phase==='center') return 'Agora, deixe o volante no meio';
  if(state.phase==='turn') return direction(route,state.segment)==='right'?'Vire o volante à direita':'Vire o volante à esquerda';
  return 'Siga em frente';
}
function setAngle(value: number): void {
  if(!active || paused || state.phase==='arrived') return;
  angle=Math.max(-120,Math.min(120,value)); state=steer(route,state,angle); update();
}
function update(): void {
  const text=instruction(), turning=state.phase==='turn', right=turning && direction(route,state.segment)==='right';
  app.querySelector('#trip-instruction')!.textContent=text;
  app.querySelector('#trip-arrow')!.textContent=paused?'Ⅱ':state.phase==='arrived'?'★':turning?right?'↱':'↰':state.phase==='center'?'↔':'↑';
  const wheel=app.querySelector<HTMLElement>('#trip-wheel')!; wheel.style.transform=`rotate(${angle}deg)`;
  wheel.setAttribute('aria-valuenow',String(Math.round(angle)));
  wheel.setAttribute('aria-valuetext',angle < -15?'Virado à esquerda':angle>15?'Virado à direita':'Centralizado');
  const [x,y]=position(route,state); const a=route.points[state.segment],b=route.points[state.segment+1];
  app.querySelector('#trip-car')!.setAttribute('transform',`translate(${x} ${y}) rotate(${Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI})`);
  app.querySelector('#trip-speed')!.textContent=state.phase==='driving' && !paused?'30':'0';
  app.querySelector('#trip-progress')!.textContent=`Trecho ${state.segment+1} de ${route.points.length-1}`;
  const arrived=state.phase==='arrived';
  app.querySelector<HTMLElement>('#trip-finish')!.hidden=!arrived;
  if(text!==spoken){ spoken=text; speak(text); }
}
function start(chosen: Route): void {
  stop(); route=chosen; state=initialState(); angle=0; last=0; paused=false; active=true; spoken='';
  const first=route.points[0], end=route.points[route.points.length-1];
  app.innerHTML=`<main class="polo-trip"><nav><button id="trip-back" class="secondary">← Rotas</button><button id="trip-pause" class="secondary">Ⅱ Pausar</button><button id="trip-audio" class="secondary" aria-pressed="${!muted}">🔊 Som ${muted?'desligado':'ligado'}</button></nav><header class="trip-heading"><div><p class="eyebrow">VW POLO · PASSEIO GUIADO</p><h1>${route.name}</h1></div><span id="trip-progress"></span></header><div class="trip-layout"><section class="map-panel" aria-label="Mapa do passeio"><svg viewBox="0 0 520 380" role="img" aria-label="Trajeto ilustrado até ${route.destination}"><defs><pattern id="trip-grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="#c9d9cc" stroke-width="2"/></pattern></defs><rect width="520" height="380" rx="24" fill="#e5ede0"/><rect width="520" height="380" fill="url(#trip-grid)"/><path d="M0 140H520 M350 0V380" stroke="#d0e3f0" stroke-width="22"/><polyline points="${route.points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="white" stroke-width="36" stroke-linejoin="round" stroke-linecap="round"/><polyline points="${route.points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#357b83" stroke-width="23" stroke-linejoin="round" stroke-linecap="round"/><polyline points="${route.points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#e7f6f2" stroke-width="2" stroke-dasharray="7 9"/><text x="${first[0]}" y="${first[1]+36}" text-anchor="middle" class="map-label">Saída</text><text x="${end[0]}" y="${end[1]-27}" text-anchor="middle" font-size="27">${route.icon}</text><g id="trip-car"><rect x="-18" y="-11" width="36" height="22" rx="7" fill="#f1bc53" stroke="#463a27" stroke-width="2"/><path d="M2 -8H10V8H2Z" fill="#284b60"/><circle cx="-10" cy="-12" r="3"/><circle cx="-10" cy="12" r="3"/></g></svg><p class="map-note">Mapa ilustrado · passeio fictício</p></section><section class="trip-cockpit" aria-label="Controles do Polo"><div class="trip-prompt"><span id="trip-arrow" aria-hidden="true"></span><h2 id="trip-instruction" role="status" aria-live="polite"></h2><button id="trip-repeat" class="secondary" aria-label="Ouvir instrução novamente">🔊 Ouvir</button></div><div class="wheel-row"><div class="speed-display"><strong id="trip-speed">30</strong><span>km/h · D</span></div><div class="wheel-space"><div id="trip-wheel" role="slider" tabindex="0" aria-label="Volante do VW Polo. Use as setas para virar e espaço para centralizar" aria-valuemin="-120" aria-valuemax="120" aria-valuenow="0"><span class="wheel-marker"></span><span class="wheel-spoke left"></span><span class="wheel-spoke right"></span><span class="wheel-spoke bottom"></span><b>VW</b></div></div></div><div class="steering-buttons"><button id="trip-left" aria-label="Virar à esquerda">↶<small>Esquerda</small></button><button id="trip-center" aria-label="Centralizar volante">↑<small>Meio</small></button><button id="trip-right" aria-label="Virar à direita">↷<small>Direita</small></button></div><p class="control-help">Arraste o volante ou use ← →. Espaço deixa no meio.</p></section></div><section id="trip-finish" class="trip-finish" hidden><h2>★ Passeio completo!</h2><button id="trip-replay">↻ Passear de novo</button><button id="trip-other" class="secondary">Escolher outra rota</button></section></main>`;
  app.querySelector<HTMLButtonElement>('#trip-back')!.onclick=selection;
  app.querySelector<HTMLButtonElement>('#trip-other')!.onclick=selection;
  app.querySelector<HTMLButtonElement>('#trip-replay')!.onclick=()=>start(route);
  app.querySelector<HTMLButtonElement>('#trip-repeat')!.onclick=()=>speak(instruction());
  app.querySelector<HTMLButtonElement>('#trip-audio')!.onclick=e=>{ muted=!muted; const b=e.currentTarget as HTMLButtonElement; b.textContent=`🔊 Som ${muted?'desligado':'ligado'}`; b.setAttribute('aria-pressed',String(!muted)); if(muted && 'speechSynthesis' in window) speechSynthesis.cancel(); else speak(instruction()); };
  app.querySelector<HTMLButtonElement>('#trip-pause')!.onclick=e=>{paused=!paused; last=0; dragging=false; (e.currentTarget as HTMLButtonElement).textContent=paused?'▶ Continuar':'Ⅱ Pausar'; update();};
  app.querySelector<HTMLButtonElement>('#trip-left')!.onclick=()=>setAngle(-75);
  app.querySelector<HTMLButtonElement>('#trip-right')!.onclick=()=>setAngle(75);
  app.querySelector<HTMLButtonElement>('#trip-center')!.onclick=()=>setAngle(0);
  const wheel=app.querySelector<HTMLElement>('#trip-wheel')!;
  const pointerAngle=(e: PointerEvent)=>{const r=wheel.getBoundingClientRect(); return Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2)*180/Math.PI;};
  wheel.onpointerdown=e=>{if(e.button!==0 || paused) return; dragging=true; previousPointerAngle=pointerAngle(e); wheel.setPointerCapture(e.pointerId); wheel.focus();};
  wheel.onpointermove=e=>{if(!dragging)return; const current=pointerAngle(e); const delta=(current-previousPointerAngle+540)%360-180; previousPointerAngle=current; setAngle(angle+delta);};
  wheel.onpointerup=wheel.onpointercancel=wheel.onlostpointercapture=()=>{dragging=false;};
  update();
  function tick(time: number): void {if(!active)return; const dt=last?(time-last)/1000:0; last=time; if(!paused){state=advance(route,state,dt);update();} frame=requestAnimationFrame(tick);}
  frame=requestAnimationFrame(tick);
  app.querySelector<HTMLButtonElement>('#trip-pause')!.focus();
}
window.addEventListener('keydown',e=>{if(!active || paused)return; if(e.key===' ' && (e.target as HTMLElement).tagName==='BUTTON')return; if(['ArrowLeft','ArrowRight','ArrowUp','Home',' '].includes(e.key)){e.preventDefault(); setAngle(e.key==='ArrowLeft'?angle-15:e.key==='ArrowRight'?angle+15:0);}});
function autoPause(): void {if(active && !paused){app.querySelector<HTMLButtonElement>('#trip-pause')!.click();} dragging=false; last=0;}
window.addEventListener('blur',autoPause);
document.addEventListener('visibilitychange',()=>{if(document.hidden) autoPause();});
selection();
