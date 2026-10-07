import { jogadores } from "../quem-e-quem/jogadores-data";
import { amigos } from "../quem-e-quem/amigos-data";
import type { Person } from "../quem-e-quem/types";

export type CategoryId = "jogadores" | "amigos" | "artistas" | "times";

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;
  color: string;
}

export interface WritingItem {
  id: string;
  category: CategoryId;
  name: string;
  // Palavra a escrever: só letras A-Z maiúsculas e espaços (espaços são pulados).
  word: string;
  // Como a voz deve falar a palavra (com acentos). Padrão: o próprio `name`.
  spoken: string;
  image: string;
  color: string;
}

export const categories: Category[] = [
  { id: "jogadores", label: "Jogadores", icon: "⚽", color: "#2ea043" },
  { id: "amigos", label: "Amigos da Escola", icon: "🎒", color: "#5b6ee8" },
  { id: "artistas", label: "Artistas", icon: "🎤", color: "#d1487a" },
  { id: "times", label: "Times", icon: "🛡️", color: "#ee8c32" }
];

function fromPerson(category: CategoryId, person: Person): WritingItem {
  return {
    id: `${category}-${person.id}`,
    category,
    name: person.name,
    word: person.shortName,
    spoken: person.shortName,
    image: person.photo,
    color: person.color
  };
}

const artistas: WritingItem[] = [
  { id: "artistas-telo", category: "artistas", name: "Michel Teló", word: "TELO", spoken: "Teló", image: "/games/artistas/telo.png", color: "#d1487a" },
  { id: "artistas-fabio", category: "artistas", name: "Fábio", word: "FABIO", spoken: "Fábio", image: "/games/artistas/Fabio.png", color: "#d1487a" },
  { id: "artistas-joel", category: "artistas", name: "Joel", word: "JOEL", spoken: "Joel", image: "/games/artistas/Joel.png", color: "#d1487a" }
];

const times = "/games/jogo-da-memoria/img/times";

function time(id: string, name: string, word: string, color: string): WritingItem {
  return { id: `times-${id}`, category: "times", name, word, spoken: name, image: `${times}/${id}.png`, color };
}

const timesItems: WritingItem[] = [
  time("sao-paulo", "São Paulo", "SAO PAULO", "#b6122a"),
  time("palmeiras", "Palmeiras", "PALMEIRAS", "#006437"),
  time("corinthians", "Corinthians", "CORINTHIANS", "#0d0d0d"),
  time("santos", "Santos", "SANTOS", "#1a1a1a"),
  time("flamengo", "Flamengo", "FLAMENGO", "#c8102e"),
  time("fluminense", "Fluminense", "FLUMINENSE", "#7a1c3d"),
  time("vasco", "Vasco", "VASCO", "#111111"),
  time("botafogo", "Botafogo", "BOTAFOGO", "#1a1a1a"),
  time("cruzeiro", "Cruzeiro", "CRUZEIRO", "#003399"),
  time("atletico-mg", "Atlético Mineiro", "ATLETICO", "#1a1a1a"),
  time("internacional", "Inter", "INTER", "#c8102e"),
  time("gremio", "Grêmio", "GREMIO", "#0d80bf"),
  time("bahia", "Bahia", "BAHIA", "#0b5cad"),
  time("vitoria", "Vitória", "VITORIA", "#a3162a"),
  time("fortaleza", "Fortaleza", "FORTALEZA", "#1c398e"),
  time("ceara", "Ceará", "CEARA", "#1a1a1a"),
  time("athletico-pr", "Athletico Paranaense", "ATHLETICO", "#c8102e"),
  time("coritiba", "Coritiba", "CORITIBA", "#00543d"),
  time("chapecoense", "Chapecoense", "CHAPECOENSE", "#0f7a3d"),
  time("bragantino", "Bragantino", "BRAGANTINO", "#d61c2e"),
  time("mirassol", "Mirassol", "MIRASSOL", "#2ea043"),
  time("remo", "Remo", "REMO", "#1c2f6e")
];

export const items: WritingItem[] = [
  ...jogadores.map(person => fromPerson("jogadores", person)),
  ...amigos.map(person => fromPerson("amigos", person)),
  ...artistas,
  ...timesItems
];
