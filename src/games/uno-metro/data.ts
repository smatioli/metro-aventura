export type LineColor = "azul" | "verde" | "vermelha" | "amarela";

export interface LineInfo {
  id: LineColor;
  label: string;
  color: string;
  colorSoft: string;
}

// Cores emprestadas das linhas 1-4 do Metrô Aventura, pra manter a mesma
// associação visual (linha azul = azul, etc.) entre os jogos.
export const lineColors: LineInfo[] = [
  { id: "azul", label: "Azul", color: "#1477c9", colorSoft: "#d9efff" },
  { id: "verde", label: "Verde", color: "#148958", colorSoft: "#dff8e9" },
  { id: "vermelha", label: "Vermelha", color: "#d53a40", colorSoft: "#ffe3e3" },
  { id: "amarela", label: "Amarela", color: "#f5c518", colorSoft: "#fff6d6" }
];

export const handSize = 7;
export const maxNumber = 9;
export const wildCount = 4;

// Cada número (0-9) tem uma frota fixa associada, igual em todas as cores -
// como no baralho de referência, a imagem identifica o valor da carta.
export const numberFleetPhotos: { src: string; alt: string }[] = [
  { src: "/games/metro-aventura/img/frotaA_1.jpg", alt: "Trem da frota A" },
  { src: "/games/metro-aventura/img/frotaE_1.jpg", alt: "Trem da frota E" },
  { src: "/games/metro-aventura/img/frotaG_1.jpg", alt: "Trem da frota G" },
  { src: "/games/metro-aventura/img/frotaH_1.jpg", alt: "Trem da frota H" },
  { src: "/games/metro-aventura/img/frotaI_1.jpg", alt: "Trem da frota I" },
  { src: "/games/metro-aventura/img/frotaJ_1.jpg", alt: "Trem da frota J" },
  { src: "/games/metro-aventura/img/frotaK_1.jpg", alt: "Trem da frota K" },
  { src: "/games/metro-aventura/img/frotaL_1.jpg", alt: "Trem da frota L" },
  { src: "/games/metro-aventura/img/frotaM_1.jpg", alt: "Trem da frota M" },
  { src: "/games/metro-aventura/img/frotaP_1.jpg", alt: "Trem da frota P" }
];
