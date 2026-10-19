import "./style.css";
import { polo } from "./data";
import { gearForSpeed, nextSpeed, rpmForSpeed } from "./game-state";

const app = document.querySelector<HTMLDivElement>("#app")!;
let speed = 0;
let distance = 0;
let elapsed = 0;
let frame = 0;
let lastTime = 0;
const heldKeys = new Set<string>();
let pointerHeld = false;
const accelerating = () => pointerHeld || heldKeys.size > 0;

function dial(kind: "rpm" | "speed"): string {
  const max = kind === "rpm" ? 8 : 260;
  const steps = kind === "rpm" ? 8 : 13;
  const point = (angle: number, radius: number) => {
    const radians = angle * Math.PI / 180;
    return [160 + Math.cos(radians) * radius, 160 + Math.sin(radians) * radius];
  };
  const ticks = Array.from({ length: 65 }, (_, i) => {
    const angle = 140 + i * 260 / 64;
    const a = point(angle, i % 8 === 0 ? 128 : 137);
    const b = point(angle, 144);
    return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${kind === "rpm" && i > 47 ? "#ff4c54" : "#6494ff"}" stroke-width="2"/>`;
  }).join("");
  const numbers = Array.from({ length: steps + 1 }, (_, i) => {
    const p = point(140 + i * 260 / steps, 114);
    return `<text x="${p[0]}" y="${p[1]}" text-anchor="middle" dominant-baseline="central">${Math.round(i * max / steps)}</text>`;
  }).join("");
  return `<div class="car-dial"><svg viewBox="0 0 320 320" aria-hidden="true"><circle cx="160" cy="160" r="148" class="dial-ring"/>${ticks}${numbers}<g id="${kind}-needle"><path d="M 166 164 L 51 68 L 157 154 Z" fill="#ffe5d9"/></g></svg><div class="dial-value"><strong id="${kind}-value">${kind === "rpm" ? "D1" : "0"}</strong><span>${kind === "rpm" ? "rpm × 1000" : "km/h"}</span></div></div>`;
}

function selection(): void {
  cancelAnimationFrame(frame);
  clearControls();
  app.innerHTML = `<main class="car-game"><a class="car-back" href="/">← Todos os jogos</a><header><p class="car-eyebrow">VAMOS DIRIGIR</p><h1>Painel do carro</h1><p>Escolha a marca e o carro para começar.</p></header><button class="car-choice"><span class="vw-emblem" aria-hidden="true">VW</span><span><small>${polo.brand}</small><strong>${polo.name}</strong><span>Câmbio automático · 6 marchas</span></span><b aria-hidden="true">→</b></button></main>`;
  app.querySelector("button")!.addEventListener("click", drive);
}

function clearControls(): void {
  heldKeys.clear();
  pointerHeld = false;
  app.querySelector(".accelerator")?.classList.remove("pressed");
}

function drive(): void {
  speed = distance = elapsed = 0;
  lastTime = 0;
  app.innerHTML = `<main class="car-game driving"><nav><a class="car-back" href="/">← Todos os jogos</a><button class="change-car">Trocar carro</button></nav><header><p class="car-eyebrow">VOLKSWAGEN · POLO</p><h1>Painel do carro</h1></header><section class="dashboard" aria-label="Painel do VW Polo"><div class="cluster-top"><span>◈ SO</span><span>28,0 °C</span></div><div class="cluster"><div class="side-meter"><span>130</span><i></i><span>50 °C</span></div>${dial("rpm")}<div class="trip"><p>Dados da viagem<br><small>Desde a partida</small></p><div>◷ <span id="trip-time">0:00</span> h</div><div>↔ <span id="trip-distance">0,0</span> km</div><div class="trip-road" aria-hidden="true">│ ┆ │</div><small>VELOCIDADE MÁXIMA</small><b>80 <small>km/h</small></b></div>${dial("speed")}<div class="side-meter fuel"><span>1</span><i></i><span>0 ⛽</span></div></div><div class="cluster-bottom"><span class="green-light">●</span><span id="drive-status" role="status">Pronto para acelerar</span><span>D1 — D6</span></div></section><section class="car-controls" aria-label="Controles"><p>Segure para acelerar<br><span>Solte para desacelerar</span></p><button class="accelerator" aria-label="Acelerar" aria-describedby="accelerator-help"><span class="pedal-icon" aria-hidden="true">▥</span> ACELERAR <span aria-hidden="true">↑</span></button><p id="accelerator-help">Também vale usar<br><span>↑ ou barra de espaço</span></p></section></main>`;
  app.querySelector(".change-car")!.addEventListener("click", selection);
  const pedal = app.querySelector<HTMLButtonElement>(".accelerator")!;
  pedal.addEventListener("pointerdown", event => {
    if (event.button !== 0) return;
    pointerHeld = true;
    pedal.setPointerCapture(event.pointerId);
  });
  const releasePointer = () => { pointerHeld = false; };
  pedal.addEventListener("pointerup", releasePointer);
  pedal.addEventListener("pointercancel", releasePointer);
  pedal.addEventListener("lostpointercapture", releasePointer);
  const speedValue = app.querySelector("#speed-value")!;
  const gearValue = app.querySelector("#rpm-value")!;
  const speedNeedle = app.querySelector("#speed-needle")!;
  const rpmNeedle = app.querySelector("#rpm-needle")!;
  const tripTime = app.querySelector("#trip-time")!;
  const tripDistance = app.querySelector("#trip-distance")!;
  const status = app.querySelector("#drive-status")!;
  function tick(time: number): void {
    const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.1) : 0;
    lastTime = time;
    speed = nextSpeed(speed, accelerating(), delta);
    distance += speed * delta / 3600;
    if (speed > 0) elapsed += delta;
    speedValue.textContent = String(Math.round(speed));
    gearValue.textContent = `D${gearForSpeed(speed)}`;
    speedNeedle.setAttribute("transform", `rotate(${-100 + speed / 260 * 260} 160 160)`);
    rpmNeedle.setAttribute("transform", `rotate(${-100 + rpmForSpeed(speed) / 8000 * 260} 160 160)`);
    tripTime.textContent = `${Math.floor(elapsed / 3600)}:${String(Math.floor(elapsed / 60) % 60).padStart(2, "0")}`;
    tripDistance.textContent = distance.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const message = speed >= polo.maxSpeed ? "Velocidade máxima: 80 km/h" : accelerating() ? "Acelerando" : speed > 0 ? "Desacelerando" : "Pronto para acelerar";
    if (status.textContent !== message) status.textContent = message;
    pedal.classList.toggle("pressed", accelerating());
    frame = requestAnimationFrame(tick);
  }
  frame = requestAnimationFrame(tick);
}

window.addEventListener("keydown", event => {
  if (!app.querySelector(".accelerator")) return;
  if (event.code === "ArrowUp" || event.code === "Space" || (event.code === "Enter" && document.activeElement?.classList.contains("accelerator"))) {
    event.preventDefault();
    heldKeys.add(event.code);
  }
});
window.addEventListener("keyup", event => { heldKeys.delete(event.code); });
window.addEventListener("blur", clearControls);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) { clearControls(); lastTime = 0; }
});
selection();
