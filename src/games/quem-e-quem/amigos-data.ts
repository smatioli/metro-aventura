import type { Person } from "./types";

const amigosFotos = "/games/amigos";

export const amigos: Person[] = [
  { id: "icaro", name: "Ícaro", shortName: "ICARO", article: "o", group: "Ícaro", photo: `${amigosFotos}/Icaro.png`, groupLogo: `${amigosFotos}/Icaro.png`, color: "#2f6fed", soft: "#d7e4ff" },
  { id: "joao", name: "João", shortName: "JOAO", article: "o", group: "João", photo: `${amigosFotos}/Joao.png`, groupLogo: `${amigosFotos}/Joao.png`, color: "#e0632f", soft: "#ffdfcb" },
  { id: "lucas", name: "Lucas", shortName: "LUCAS", article: "o", group: "Lucas", photo: `${amigosFotos}/Lucas.png`, groupLogo: `${amigosFotos}/Lucas.png`, color: "#2ea043", soft: "#c9e8d1" },
  { id: "luiza", name: "Luiza", shortName: "LUIZA", article: "a", group: "Luiza", photo: `${amigosFotos}/Luiza.png`, groupLogo: `${amigosFotos}/Luiza.png`, color: "#d1487a", soft: "#ffd6e6" },
  { id: "pietro", name: "Pietro", shortName: "PIETRO", article: "o", group: "Pietro", photo: `${amigosFotos}/Pietro.png`, groupLogo: `${amigosFotos}/Pietro.png`, color: "#8a4fff", soft: "#e3d6ff" },
  { id: "rafaela", name: "Rafaela", shortName: "RAFAELA", article: "a", group: "Rafaela", photo: `${amigosFotos}/Rafaela.png`, groupLogo: `${amigosFotos}/Rafaela.png`, color: "#f2b705", soft: "#fff3c4" },
  { id: "teo", name: "Teo", shortName: "TEO", article: "o", group: "Teo", photo: `${amigosFotos}/Teo.png`, groupLogo: `${amigosFotos}/Teo.png`, color: "#00a3a3", soft: "#c8f2f2" }
];
