export interface Person {
  id: string;
  name: string;
  shortName: string;
  article: "o" | "a";
  group: string;
  photo: string;
  groupLogo?: string;
  color: string;
  soft: string;
}

export interface Topic {
  id: string;
  gameTitle: string;
  accent: string;
  welcomeIcons: [string, string];
  personIcon: string;
  selectDescription: string;
  playDescription: string;
  people: Person[];
  questionPersonToGroup(person: Person): string;
  questionGroupToPerson(person: Person): string;
  finishedHeading: string;
  finishedSpeech: string;
}
