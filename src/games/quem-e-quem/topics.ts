import type { Person, Topic } from "./types";
import { jornalistas } from "./jornalistas-data";
import { jogadores } from "./jogadores-data";
import { amigos } from "./amigos-data";

export const topics: Topic[] = [
  {
    id: "jornalistas",
    gameTitle: "Jornalistas",
    accent: "#ee8c32",
    welcomeIcons: ["🎤", "📺"],
    personIcon: "🎤",
    selectDescription: "Escute e encontre quem apresenta cada jornal.",
    playDescription: "Olhe, escute e escolha.",
    people: jornalistas,
    questionPersonToGroup: (person: Person) => `Qual jornal ${person.article} ${person.name} apresenta?`,
    questionGroupToPerson: (person: Person) => `Quem apresenta o jornal ${person.group}?`,
    finishedHeading: "Você conhece<br>os jornais!",
    finishedSpeech: "Muito bem! Você conhece os jornais!"
  },
  {
    id: "jogadores",
    gameTitle: "Jogadores e Times",
    accent: "#2ea043",
    welcomeIcons: ["⚽", "🛡️"],
    personIcon: "⚽",
    selectDescription: "Escute e encontre em qual time cada jogador joga.",
    playDescription: "Olhe, escute e escolha.",
    people: jogadores,
    questionPersonToGroup: (person: Person) => `Em qual time ${person.article} ${person.name} joga?`,
    questionGroupToPerson: (person: Person) => `Quem joga no time ${person.group}?`,
    finishedHeading: "Você conhece<br>os jogadores!",
    finishedSpeech: "Muito bem! Você conhece os jogadores!"
  },
  {
    id: "amigos",
    gameTitle: "Amigos da Escola",
    accent: "#5b6ee8",
    welcomeIcons: ["🎒", "🏫"],
    personIcon: "🎒",
    selectDescription: "Escute e encontre os amigos do Colégio Augusto Figueiredo.",
    playDescription: "Olhe, escute e escolha.",
    people: amigos,
    questionPersonToGroup: (person: Person) => `Encontre ${person.article === "a" ? "a" : "o"} ${person.name} de novo!`,
    questionGroupToPerson: (person: Person) => `Quem é ${person.article === "a" ? "a" : "o"} ${person.name}?`,
    finishedHeading: "Você conhece<br>seus amigos!",
    finishedSpeech: "Muito bem! Você conhece seus amigos da escola!"
  }
];
