import './style.css';
import { routeDefinitions, type Route } from './data';
import { fromGeoJSON, project, type Street } from './navigation';
let routes: Route[]=[];
let streets: Street[]=[];
let loadedMapId='', loadToken=0;
const escape=(text:string)=>text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
import { advance, direction, initialState, position, steer } from './game-state';
const app=document.querySelector<HTMLDivElement>('#app')!;
let route: Route, state=initialState(), angle=0, frame=0, last=0, paused=false;
let active=false, dragging=false, previousPointerAngle=0, spoken='';
let renderedHeading=NaN;
let labels: SVGTextElement[]=[];
const ui=new Map<string, Element>();
function element(id:string): Element { return ui.get(id)!; }
function textContent(id:string,value:string): void { const target=element(id); if(target.textContent!==value) target.textContent=value; }
function speak(text: string): void {
  if(!('speechSynthesis' in window)) return;
  speechSynthesis.cancel(); const utterance=new SpeechSynthesisUtterance(text); utterance.lang='pt-BR'; utterance.rate=.8; speechSynthesis.speak(utterance);
}
function stop(): void { loadToken++; cancelAnimationFrame(frame); active=false; dragging=false; if('speechSynthesis' in window) speechSynthesis.cancel(); }
function selection(): void {
  stop();
  app.innerHTML=`<main class="polo-trip"><a href="/">← Todos os jogos</a><header><p class="eyebrow">VAMOS PASSEAR · VW POLO</p><h1>Dirigindo o Polo</h1><p>Escolha um passeio. Você comanda o volante!</p></header><section class="route-choices" aria-label="Escolha uma rota">${routes.map((r,i)=>`<article><span class="destination-icon" aria-hidden="true">${r.icon}</span><h2>${r.name}</h2><p>${Object.keys(r.turns ?? {}).length} ${Object.keys(r.turns ?? {}).length===1?'conversão':'conversões'} · sem pressa</p><button data-route="${i}">▶ Iniciar passeio</button><button class="secondary" data-hear="${i}" aria-label="Ouvir ${r.name}">🔊 Ouvir</button></article>`).join('')}</section><p class="map-note">Trajetos reais · narração sempre ativa</p></main>`;
  app.querySelectorAll<HTMLButtonElement>('[data-route]').forEach(b=>b.onclick=()=>void chooseRoute(routes[Number(b.dataset.route)]));
  app.querySelectorAll<HTMLButtonElement>('[data-hear]').forEach(b=>b.onclick=()=>speak(routes[Number(b.dataset.hear)].name));
}
function instruction(): string {
  if(paused) return 'Passeio pausado';
  if(state.phase==='arrived') return `Chegamos! ${route.destination}!`;
  if(state.phase==='turn') return `Vire à ${direction(route,state.segment)==='right'?'direita':'esquerda'}${route.streets?.[state.segment+1] ? ` na ${route.streets[state.segment+1]}` : ''}`;
  const next=Object.keys(route.turns ?? {}).map(Number).find(i=>i>=state.segment);
  let remaining=-state.distance;
  if(next!==undefined) {
    for(let i=state.segment;i<=next;i++) remaining+=Math.hypot(route.points[i+1][0]-route.points[i][0],route.points[i+1][1]-route.points[i][1]);
    if(remaining<90) return `Na próxima conversão, vire à ${direction(route,next)==='right'?'direita':'esquerda'}${route.streets?.[next+1] ? ` na ${route.streets[next+1]}` : ''}`;
  }
  return route.streets?.[state.segment] ? `Siga pela ${route.streets[state.segment]}` : 'Siga em frente';
}
function setAngle(value: number): void {
  if(!active || paused || state.phase==='arrived') return;
  angle=Math.max(-120,Math.min(120,value));
  const previousSegment=state.segment;
  state=steer(route,state,angle);
  if(state.segment!==previousSegment) angle=0;
  update();
}
function update(): void {
  const text=instruction(), turning=state.phase==='turn', right=turning && direction(route,state.segment)==='right';
  textContent('trip-instruction',text);
  textContent('trip-arrow',paused?'Ⅱ':state.phase==='arrived'?'★':turning?right?'↱':'↰':'↑');
  const wheel=element('trip-wheel') as HTMLElement; wheel.style.transform=`rotate(${angle}deg)`;
  wheel.setAttribute('aria-valuenow',String(Math.round(angle)));
  wheel.setAttribute('aria-valuetext',angle < -15?'Virado à esquerda':angle>15?'Virado à direita':'Centralizado');
  const [x,y]=position(route,state); const a=route.points[state.segment],b=route.points[state.segment+1];
  const heading=Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI;
  element('trip-world').setAttribute('transform',`translate(260 320) rotate(${-90-heading}) translate(${-x} ${-y})`);
  element('trip-car').setAttribute('transform',`translate(${x} ${y}) rotate(${heading})`);
  if(heading!==renderedHeading){
    labels.forEach(label=>label.setAttribute('transform',`rotate(${90+heading} ${label.dataset.x} ${label.dataset.y})`));
    renderedHeading=heading;
  }
  textContent('trip-street',route.streets?.[state.segment] || `Rota para ${route.destination}`);
  textContent('trip-speed',state.phase==='driving' && !paused?'30':'0');
  textContent('trip-progress',`Trecho ${state.segment+1} de ${route.points.length-1}`);
  const arrived=state.phase==='arrived';
  (element('trip-finish') as HTMLElement).hidden=!arrived;
  if(text!==spoken){ spoken=text; speak(text); }
}
async function chooseRoute(chosen: Route): Promise<void> {
  if(loadedMapId===chosen.id){start(chosen);return;}
  stop();
  const token=loadToken;
  speak(`Preparando o passeio. ${chosen.name}`);
  app.innerHTML=`<main class="polo-trip"><button id="loading-back" class="secondary">← Rotas</button><h1>${chosen.name}</h1><p role="status">Preparando o mapa…</p></main>`;
  app.querySelector<HTMLButtonElement>('#loading-back')!.onclick=selection;
  try {
    const response=await fetch(`/routes/${chosen.id}-streets.json`);
    if(!response.ok) throw new Error('Mapa indisponível');
    const rawStreets=await response.json() as {name:string;coordinates:number[][]}[];
    if(token!==loadToken)return;
    streets=rawStreets.map(s=>({name:s.name,points:s.coordinates.map(project)}));
    loadedMapId=chosen.id;
    start(chosen);
  } catch {
    if(token!==loadToken)return;
    app.innerHTML='<main class="polo-trip"><h1>Vamos tentar novamente?</h1><p>Não foi possível abrir o mapa.</p><button id="map-retry">Tentar novamente</button><button id="map-back" class="secondary">← Rotas</button></main>';
    app.querySelector<HTMLButtonElement>('#map-retry')!.onclick=()=>void chooseRoute(chosen);
    app.querySelector<HTMLButtonElement>('#map-back')!.onclick=selection;
  }
}
function start(chosen: Route): void {
  stop(); route=chosen; state=initialState(); angle=0; last=0; paused=false; active=true; spoken='';
  const end=route.points[route.points.length-1];
  const seenNames=new Set<string>();
  const mapLabels=streets.filter(street=>{if(seenNames.has(street.name))return false;seenNames.add(street.name);return true;});
  app.innerHTML=`<main class="polo-trip polo-driving"><nav><button id="trip-back" class="secondary">← Rotas</button><button id="trip-pause" class="secondary">Ⅱ Pausar</button><span class="voice-on">🔊 Narração ativa</span></nav><header class="trip-heading"><div><p class="eyebrow">VW POLO · PASSEIO GUIADO</p><h1>${route.name}</h1></div><span id="trip-progress"></span></header><div class="trip-layout"><section class="map-panel" aria-label="Mapa do passeio"><div class="navigation-map"><svg viewBox="0 0 520 460" role="img" aria-label="Mapa da rota para ${route.destination}, orientado no sentido do carro"><rect width="520" height="460" fill="#e7ebdf"/><g id="trip-world"><path d="${streets.map(s=>`M${s.points.map(p=>p.join(',')).join(' L')}`).join(' ')}" fill="none" stroke="#fff" stroke-width="11" stroke-linejoin="round"/><polyline points="${route.points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#fff" stroke-width="22" stroke-linejoin="round"/><polyline points="${route.points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#4387ef" stroke-width="13" stroke-linejoin="round"/>${mapLabels.map(s=>{const p=s.points[Math.floor(s.points.length/2)];return `<text x="${p[0]}" y="${p[1]-9}" text-anchor="middle" data-x="${p[0]}" data-y="${p[1]-9}" class="street-label">${escape(s.name)}</text>`;}).join('')}<circle cx="${end[0]}" cy="${end[1]}" r="15" fill="#265c4c"/><g id="trip-car"><path d="M22 0L-14 -13L-8 0L-14 13Z" fill="#1763d5" stroke="white" stroke-width="4"/></g></g></svg><div class="navigation-street" id="trip-street"></div></div><p class="map-note">© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a> · <a href="https://opendatacommons.org/licenses/odbl/1-0/">ODbL</a> · simulação</p></section><section class="trip-cockpit" aria-label="Controles do Polo"><div class="trip-prompt"><span id="trip-arrow" aria-hidden="true"></span><h2 id="trip-instruction" role="status" aria-live="polite"></h2><button id="trip-repeat" class="secondary" aria-label="Ouvir instrução novamente">🔊 Ouvir</button></div><div class="wheel-row"><div class="speed-display"><strong id="trip-speed">30</strong><span>km/h · D</span></div><div class="wheel-space"><div id="trip-wheel" role="slider" tabindex="0" aria-label="Volante do VW Polo. Use as setas para virar e espaço para centralizar" aria-valuemin="-120" aria-valuemax="120" aria-valuenow="0"><span class="wheel-marker"></span><span class="wheel-spoke left"></span><span class="wheel-spoke right"></span><span class="wheel-spoke bottom"></span><b>VW</b></div></div></div><div class="steering-buttons"><button id="trip-left" aria-label="Virar à esquerda">↶<small>Esquerda</small></button><button id="trip-right" aria-label="Virar à direita">↷<small>Direita</small></button></div><p class="control-help">Arraste o volante ou toque nos botões.</p></section></div><section id="trip-finish" class="trip-finish" hidden><h2>★ Passeio completo!</h2><button id="trip-replay">↻ Passear de novo</button><button id="trip-other" class="secondary">Escolher outra rota</button></section></main>`;
  ui.clear();
  app.querySelectorAll('[id]').forEach(el=>ui.set(el.id,el));
  labels=Array.from(app.querySelectorAll<SVGTextElement>('.street-label'));
  renderedHeading=NaN;
  app.querySelector<HTMLButtonElement>('#trip-back')!.onclick=selection;
  app.querySelector<HTMLButtonElement>('#trip-other')!.onclick=selection;
  app.querySelector<HTMLButtonElement>('#trip-replay')!.onclick=()=>start(route);
  app.querySelector<HTMLButtonElement>('#trip-repeat')!.onclick=()=>speak(instruction());
  app.querySelector<HTMLButtonElement>('#trip-pause')!.onclick=e=>{paused=!paused; last=0; dragging=false; (e.currentTarget as HTMLButtonElement).textContent=paused?'▶ Continuar':'Ⅱ Pausar'; update();};
  app.querySelector<HTMLButtonElement>('#trip-left')!.onclick=()=>setAngle(-75);
  app.querySelector<HTMLButtonElement>('#trip-right')!.onclick=()=>setAngle(75);
  const wheel=app.querySelector<HTMLElement>('#trip-wheel')!;
  const pointerAngle=(e: PointerEvent)=>{const r=wheel.getBoundingClientRect(); return Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2)*180/Math.PI;};
  wheel.onpointerdown=e=>{if(e.button!==0 || paused) return; dragging=true; previousPointerAngle=pointerAngle(e); wheel.setPointerCapture(e.pointerId); wheel.focus({preventScroll:true});};
  wheel.onpointermove=e=>{if(!dragging)return; const current=pointerAngle(e); const delta=(current-previousPointerAngle+540)%360-180; previousPointerAngle=current; setAngle(angle+delta);};
  wheel.onpointerup=wheel.onpointercancel=wheel.onlostpointercapture=()=>{dragging=false;};
  update();
  function tick(time: number): void {
    if(!active)return;
    if(!last) last=time;
    const elapsed=time-last;
    if(elapsed>=1000/30){
      last=time;
      if(!paused && state.phase==='driving'){state=advance(route,state,elapsed/1000);update();}
    }
    frame=requestAnimationFrame(tick);
  }
  frame=requestAnimationFrame(tick);
  app.querySelector<HTMLButtonElement>('#trip-pause')!.focus({preventScroll:true});
}
window.addEventListener('keydown',e=>{if(!active || paused)return; if(e.key===' ' && (e.target as HTMLElement).tagName==='BUTTON')return; if(['ArrowLeft','ArrowRight','ArrowUp','Home',' '].includes(e.key)){e.preventDefault(); setAngle(e.key==='ArrowLeft'?angle-15:e.key==='ArrowRight'?angle+15:0);}});
function autoPause(): void {if(active && !paused){app.querySelector<HTMLButtonElement>('#trip-pause')!.click();} dragging=false; last=0;}
window.addEventListener('blur',autoPause);
document.addEventListener('visibilitychange',()=>{if(document.hidden) autoPause();});
async function load(): Promise<void> {
  app.innerHTML='<main class="polo-trip"><h1>Dirigindo o Polo</h1><p role="status">Preparando os passeios…</p></main>';
  try {
    routes=await Promise.all(routeDefinitions.map(async definition=>{
      const [geoResponse,navigationResponse]=await Promise.all([
        fetch(`/routes/${encodeURIComponent(definition.file)}`),
        fetch(`/routes/${definition.id}-navigation.json`),
      ]);
      if(!geoResponse.ok || !navigationResponse.ok)throw new Error('Passeio indisponível');
      const [geo,navigation]=await Promise.all([geoResponse.json(),navigationResponse.json()]);
      const realRoute=fromGeoJSON(geo,definition);
      if(!Array.isArray(navigation.streetNames) || navigation.streetNames.length!==realRoute.points.length-1 || !navigation.streetNames.every((name:unknown)=>typeof name==='string'))throw new Error('Instruções inválidas');
      realRoute.streets=navigation.streetNames;
      return realRoute;
    }));
    selection();
  } catch {
    app.innerHTML='<main class="polo-trip"><a href="/">← Todos os jogos</a><h1>Vamos tentar novamente?</h1><p>Não foi possível abrir o passeio.</p><button id="trip-retry">Carregar passeio</button></main>';
    app.querySelector<HTMLButtonElement>('#trip-retry')!.onclick=()=>void load();
  }
}
void load();
