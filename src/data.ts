export type LineId = "1" | "2" | "3";
export type FleetId = "E" | "G" | "H" | "I" | "J" | "K" | "L";

export interface MetroLine {
  id: LineId;
  name: string;
  color: string;
  colorSoft: string;
  stations: string[];
  fleets: FleetId[];
}

export interface ViewMedia {
  side: string;
  interior: string;
  cab: string;
}

export interface FleetTheme {
  body: string;
  stripe: string;
  accent: string;
  front: "flat" | "round" | "sloped";
}

export const lines: MetroLine[] = [
  {
    id: "1", name: "Linha 1 Azul", color: "#1477c9", colorSoft: "#d9efff",
    stations: ["Jabaquara", "Conceição", "São Judas", "Saúde", "Praça da Árvore", "Santa Cruz", "Vila Mariana", "Ana Rosa", "Paraíso", "Vergueiro", "São Joaquim", "Japão-Liberdade", "Sé", "São Bento", "Luz", "Tiradentes", "Armênia", "Portuguesa-Tietê", "Carandiru", "Santana", "Jardim São Paulo", "Parada Inglesa", "Tucuruvi"],
    fleets: ["E", "I", "J", "K", "L"]
  },
  {
    id: "2", name: "Linha 2 Verde", color: "#148958", colorSoft: "#dff8e9",
    stations: ["Vila Prudente", "Tamanduateí", "Sacomã", "Alto do Ipiranga", "Santos-Imigrantes", "Chácara Klabin", "Ana Rosa", "Paraíso", "Brigadeiro", "Trianon-Masp", "Consolação", "Clínicas", "Sumaré", "Vila Madalena"],
    fleets: ["I", "J"]
  },
  {
    id: "3", name: "Linha 3 Vermelha", color: "#d53a40", colorSoft: "#ffe3e3",
    stations: ["Corinthians-Itaquera", "Artur Alvim", "Patriarca-Vila Ré", "Guilhermina-Esperança", "Vila Matilde", "Penha", "Carrão", "Tatuapé", "Belém", "Bresser-Mooca", "Brás", "Pedro II", "Sé", "Anhangabaú", "República", "Santa Cecília", "Marechal Deodoro", "Palmeiras-Barra Funda"],
    fleets: ["G", "H", "K"]
  }
];

export const fleetImages: Record<FleetId, string> = {
  E: "/img/frotaE_1.jpg", G: "/img/frotaG_1.jpg", H: "/img/frotaH_1.jpg",
  I: "/img/frotaI_1.jpg", J: "/img/frotaJ_1.jpg", K: "/img/frotaK_1.jpg",
  L: "/img/frotaL_1.jpg"
};

export const fleetThemes: Record<FleetId, FleetTheme> = {
  E: { body: "#a9b0b1", stripe: "#1d4f91", accent: "#e33c39", front: "flat" },
  G: { body: "#e7eceb", stripe: "#168f96", accent: "#d84144", front: "round" },
  H: { body: "#e8ecec", stripe: "#d43d43", accent: "#152f3c", front: "round" },
  I: { body: "#dce3e3", stripe: "#177ac4", accent: "#45b7df", front: "flat" },
  J: { body: "#cbd0cf", stripe: "#116dbd", accent: "#0b2636", front: "sloped" },
  K: { body: "#c9cfce", stripe: "#1a77c5", accent: "#0c2737", front: "round" },
  L: { body: "#e3e7e6", stripe: "#176fc0", accent: "#101e2a", front: "sloped" }
};

export const prototypeViewMedia: ViewMedia = {
  side: "/img/side_view.jpeg",
  interior: "/img/interno.jpeg",
  cab: "/img/cabin.jpg"
};
