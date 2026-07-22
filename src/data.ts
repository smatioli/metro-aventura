export type CompanyId = "metro" | "cptm";
export type LineId = "1" | "2" | "3" | "7" | "8" | "9" | "10" | "11" | "12" | "13";
export type FleetId = "E" | "G" | "H" | "I" | "J" | "K" | "L" | "2070" | "2500" | "7000" | "7500" | "8000" | "8500" | "8900" | "9000" | "9500";
export type PlatformSide = "right" | "left";

export interface MetroLine {
  id: LineId;
  companyId: CompanyId;
  name: string;
  color: string;
  colorSoft: string;
  stations: string[];
  fleets: FleetId[];
}

export interface Company {
  id: CompanyId;
  name: string;
  logo: string;
}

export const companies: Company[] = [
  { id: "metro", name: "Metrô de São Paulo", logo: "/img/metro-sp-logo.png" },
  { id: "cptm", name: "CPTM", logo: "/img/cptm-logo.webp" }
];

export const cptmFleetMatrix = {
  "7": ["9500"],
  "8": ["8900", "7000"],
  "9": ["8900", "7000"],
  "10": ["8500", "7500", "2070"],
  "11": ["8000", "8500"],
  "12": ["7000", "8500", "9000"],
  "13": ["2500"]
} as const satisfies Record<string, readonly FleetId[]>;

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
    id: "1", companyId: "metro", name: "Linha 1 Azul", color: "#1477c9", colorSoft: "#d9efff",
    stations: ["Jabaquara", "Conceição", "São Judas", "Saúde", "Praça da Árvore", "Santa Cruz", "Vila Mariana", "Ana Rosa", "Paraíso", "Vergueiro", "São Joaquim", "Japão-Liberdade", "Sé", "São Bento", "Luz", "Tiradentes", "Armênia", "Portuguesa-Tietê", "Carandiru", "Santana", "Jardim São Paulo", "Parada Inglesa", "Tucuruvi"],
    fleets: ["E", "I", "J", "K", "L"]
  },
  {
    id: "2", companyId: "metro", name: "Linha 2 Verde", color: "#148958", colorSoft: "#dff8e9",
    stations: ["Vila Prudente", "Tamanduateí", "Sacomã", "Alto do Ipiranga", "Santos-Imigrantes", "Chácara Klabin", "Ana Rosa", "Paraíso", "Brigadeiro", "Trianon-Masp", "Consolação", "Clínicas", "Sumaré", "Vila Madalena"],
    fleets: ["I", "J"]
  },
  {
    id: "3", companyId: "metro", name: "Linha 3 Vermelha", color: "#d53a40", colorSoft: "#ffe3e3",
    stations: ["Corinthians-Itaquera", "Artur Alvim", "Patriarca-Vila Ré", "Guilhermina-Esperança", "Vila Matilde", "Penha", "Carrão", "Tatuapé", "Belém", "Bresser-Mooca", "Brás", "Pedro II", "Sé", "Anhangabaú", "República", "Santa Cecília", "Marechal Deodoro", "Palmeiras-Barra Funda"],
    fleets: ["G", "H", "K"]
  },
  {
    id: "7", companyId: "cptm", name: "Linha 7 Rubi", color: "#9b2743", colorSoft: "#f5dde4",
    stations: ["Palmeiras-Barra Funda", "Água Branca", "Lapa", "Piqueri", "Pirituba", "Vila Clarice", "Jaraguá", "Vila Aurora", "Perus", "Caieiras", "Franco da Rocha", "Baltazar Fidélis", "Francisco Morato", "Botujuru", "Campo Limpo Paulista", "Várzea Paulista", "Jundiaí"],
    fleets: [...cptmFleetMatrix["7"]]
  },
  {
    id: "8", companyId: "cptm", name: "Linha 8 Diamante", color: "#8c6b4f", colorSoft: "#eee5df",
    stations: ["Júlio Prestes", "Palmeiras-Barra Funda", "Lapa", "Domingos de Moraes", "Imperatriz Leopoldina", "Presidente Altino", "Osasco", "Comandante Sampaio", "Quitaúna", "General Miguel Costa", "Carapicuíba", "Santa Terezinha", "Antônio João", "Barueri", "Jardim Belval", "Jardim Silveira", "Jandira", "Sagrado Coração", "Engenheiro Cardoso", "Itapevi", "Santa Rita", "Amador Bueno"],
    fleets: [...cptmFleetMatrix["8"]]
  },
  {
    id: "9", companyId: "cptm", name: "Linha 9 Esmeralda", color: "#00a88e", colorSoft: "#d8f4ed",
    stations: ["Osasco", "Presidente Altino", "Ceasa", "Villa-Lobos-Jaguaré", "Cidade Universitária", "Pinheiros", "Hebraica-Rebouças", "Cidade Jardim", "Vila Olímpia", "Berrini", "Morumbi-Claro", "Granja Julieta", "João Dias", "Santo Amaro", "Socorro", "Jurubatuba", "Autódromo", "Primavera-Interlagos", "Grajaú", "Bruno Covas-Mendes-Vila Natal", "Varginha"],
    fleets: [...cptmFleetMatrix["9"]]
  },
  {
    id: "10", companyId: "cptm", name: "Linha 10 Turquesa", color: "#00a6a6", colorSoft: "#d9f7f5",
    stations: ["Palmeiras-Barra Funda", "Luz", "Brás", "Juventus-Mooca", "Ipiranga", "Tamanduateí", "São Caetano do Sul", "Utinga", "Prefeito Saladino", "Prefeito Celso Daniel-Santo André", "Capuava", "Mauá", "Guapituba", "Ribeirão Pires", "Rio Grande da Serra"],
    fleets: [...cptmFleetMatrix["10"]]
  },
  {
    id: "11", companyId: "cptm", name: "Linha 11 Coral", color: "#f04e23", colorSoft: "#ffe3d9",
    stations: ["Palmeiras-Barra Funda", "Luz", "Brás", "Tatuapé", "Corinthians-Itaquera", "Dom Bosco", "José Bonifácio", "Guaianases", "Antônio Gianetti Neto", "Ferraz de Vasconcelos", "Poá", "Calmon Viana", "Suzano", "Jundiapeba", "Braz Cubas", "Mogi das Cruzes", "Estudantes"],
    fleets: [...cptmFleetMatrix["11"]]
  },
  {
    id: "12", companyId: "cptm", name: "Linha 12 Safira", color: "#1c3f94", colorSoft: "#dce5fa",
    stations: ["Brás", "Tatuapé", "Engenheiro Goulart", "USP Leste", "Comendador Ermelino", "São Miguel Paulista", "Jardim Helena-Vila Mara", "Itaim Paulista", "Jardim Romano", "Engenheiro Manoel Feio", "Itaquaquecetuba", "Aracaré", "Calmon Viana"],
    fleets: [...cptmFleetMatrix["12"]]
  },
  {
    id: "13", companyId: "cptm", name: "Linha 13 Jade", color: "#00a88f", colorSoft: "#d8f4ed",
    stations: ["Engenheiro Goulart", "Guarulhos-CECAP", "Aeroporto-Guarulhos"],
    fleets: [...cptmFleetMatrix["13"]]
  }
];

export const fleetImages: Record<FleetId, string> = {
  E: "/img/frotaE_1.jpg", G: "/img/frotaG_1.jpg", H: "/img/frotaH_1.jpg",
  I: "/img/frotaI_1.jpg", J: "/img/frotaJ_1.jpg", K: "/img/frotaK_1.jpg",
  L: "/img/frotaL_1.jpg",
  "2070": "/img/2070.jpeg", "2500": "/img/2500.jpeg", "7000": "/img/7000.jpeg",
  "7500": "/img/7500.jpeg", "8000": "/img/8000.jpeg", "8500": "/img/8500.jpeg",
  "8900": "/img/8900.jpeg", "9000": "/img/9000.jpeg", "9500": "/img/9500.jpeg"
};

export const fleetThemes: Record<FleetId, FleetTheme> = {
  E: { body: "#a9b0b1", stripe: "#1d4f91", accent: "#e33c39", front: "flat" },
  G: { body: "#e7eceb", stripe: "#168f96", accent: "#d84144", front: "round" },
  H: { body: "#e8ecec", stripe: "#d43d43", accent: "#152f3c", front: "round" },
  I: { body: "#dce3e3", stripe: "#177ac4", accent: "#45b7df", front: "flat" },
  J: { body: "#cbd0cf", stripe: "#116dbd", accent: "#0b2636", front: "sloped" },
  K: { body: "#c9cfce", stripe: "#1a77c5", accent: "#0c2737", front: "round" },
  L: { body: "#e3e7e6", stripe: "#176fc0", accent: "#101e2a", front: "sloped" },
  "2070": { body: "#d8dedd", stripe: "#d92736", accent: "#26343b", front: "flat" },
  "2500": { body: "#e5e8e7", stripe: "#d92736", accent: "#202f37", front: "sloped" },
  "7000": { body: "#dce1e0", stripe: "#e12636", accent: "#26343b", front: "round" },
  "7500": { body: "#d9dedc", stripe: "#d92736", accent: "#25343c", front: "flat" },
  "8000": { body: "#e4e7e6", stripe: "#e12636", accent: "#1d2c34", front: "sloped" },
  "8500": { body: "#e5e8e7", stripe: "#e12636", accent: "#1d2c34", front: "round" },
  "8900": { body: "#e5e8e7", stripe: "#e12636", accent: "#1d2c34", front: "round" },
  "9000": { body: "#dce1e0", stripe: "#d92736", accent: "#24333b", front: "sloped" },
  "9500": { body: "#e6e8e7", stripe: "#ef2738", accent: "#e41f2f", front: "round" }
};

export const prototypeViewMedia: ViewMedia = {
  side: "/img/side_view.jpeg",
  interior: "/img/interno.jpeg",
  cab: "/img/cabin.jpg"
};

// Altere somente "right" para "left" nas estações com desembarque à esquerda.
export const platformSides: Record<LineId, Record<string, PlatformSide>> = {
  "1": {
    "Jabaquara": "right", "Conceição": "right", "São Judas": "right", "Saúde": "right",
    "Praça da Árvore": "right", "Santa Cruz": "right", "Vila Mariana": "right", "Ana Rosa": "left",
    "Paraíso": "left", "Vergueiro": "right", "São Joaquim": "right", "Japão-Liberdade": "right",
    "Sé": "right", "São Bento": "right", "Luz": "right", "Tiradentes": "left", "Armênia": "right",
    "Portuguesa-Tietê": "right", "Carandiru": "right", "Santana": "right", "Jardim São Paulo": "left",
    "Parada Inglesa": "right", "Tucuruvi": "right"
  },
  "2": {
    "Vila Prudente": "right", "Tamanduateí": "right", "Sacomã": "right", "Alto do Ipiranga": "right",
    "Santos-Imigrantes": "left", "Chácara Klabin": "left", "Ana Rosa": "left", "Paraíso": "right",
    "Brigadeiro": "left", "Trianon-Masp": "left", "Consolação": "left", "Clínicas": "right",
    "Sumaré": "right", "Vila Madalena": "right"
  },
  "3": {
    "Corinthians-Itaquera": "right", "Artur Alvim": "right", "Patriarca-Vila Ré": "right",
    "Guilhermina-Esperança": "right", "Vila Matilde": "right", "Penha": "right", "Carrão": "right",
    "Tatuapé": "right", "Belém": "right", "Bresser-Mooca": "right", "Brás": "right",
    "Pedro II": "right", "Sé": "left", "Anhangabaú": "right", "República": "right",
    "Santa Cecília": "right", "Marechal Deodoro": "right", "Palmeiras-Barra Funda": "right"
  },
  "7": {
    "Palmeiras-Barra Funda": "right", "Água Branca": "right", "Lapa": "right", "Piqueri": "right",
    "Pirituba": "right", "Vila Clarice": "right", "Jaraguá": "right", "Vila Aurora": "right",
    "Perus": "right", "Caieiras": "right", "Franco da Rocha": "right", "Baltazar Fidélis": "right",
    "Francisco Morato": "right", "Botujuru": "right", "Campo Limpo Paulista": "right",
    "Várzea Paulista": "right", "Jundiaí": "right"
  },
  "8": {
    "Júlio Prestes": "right", "Palmeiras-Barra Funda": "right", "Lapa": "right", "Domingos de Moraes": "right",
    "Imperatriz Leopoldina": "right", "Presidente Altino": "right", "Osasco": "right", "Comandante Sampaio": "right",
    "Quitaúna": "right", "General Miguel Costa": "right", "Carapicuíba": "right", "Santa Terezinha": "right",
    "Antônio João": "right", "Barueri": "right", "Jardim Belval": "right", "Jardim Silveira": "right",
    "Jandira": "right", "Sagrado Coração": "right", "Engenheiro Cardoso": "right", "Itapevi": "right",
    "Santa Rita": "right", "Amador Bueno": "right"
  },
  "9": {
    "Osasco": "right", "Presidente Altino": "right", "Ceasa": "right", "Villa-Lobos-Jaguaré": "right",
    "Cidade Universitária": "right", "Pinheiros": "right", "Hebraica-Rebouças": "right", "Cidade Jardim": "right",
    "Vila Olímpia": "right", "Berrini": "right", "Morumbi-Claro": "right", "Granja Julieta": "right",
    "João Dias": "right", "Santo Amaro": "right", "Socorro": "right", "Jurubatuba": "right",
    "Autódromo": "right", "Primavera-Interlagos": "right", "Grajaú": "right",
    "Bruno Covas-Mendes-Vila Natal": "right", "Varginha": "right"
  },
  "10": {
    "Palmeiras-Barra Funda": "right", "Luz": "left", "Brás": "left", "Juventus-Mooca": "right",
    "Ipiranga": "right", "Tamanduateí": "right", "São Caetano do Sul": "right", "Utinga": "right",
    "Prefeito Saladino": "right", "Prefeito Celso Daniel-Santo André": "right", "Capuava": "right",
    "Mauá": "left", "Guapituba": "right", "Ribeirão Pires": "right", "Rio Grande da Serra": "right"
  },
  "11": {
    "Palmeiras-Barra Funda": "right", "Luz": "right", "Brás": "right", "Tatuapé": "right",
    "Corinthians-Itaquera": "right", "Dom Bosco": "right", "José Bonifácio": "right", "Guaianases": "right",
    "Antônio Gianetti Neto": "right", "Ferraz de Vasconcelos": "right", "Poá": "right", "Calmon Viana": "right",
    "Suzano": "right", "Jundiapeba": "right", "Braz Cubas": "right", "Mogi das Cruzes": "right",
    "Estudantes": "right"
  },
  "12": {
    "Brás": "right", "Tatuapé": "right", "Engenheiro Goulart": "right", "USP Leste": "right",
    "Comendador Ermelino": "right", "São Miguel Paulista": "right", "Jardim Helena-Vila Mara": "right",
    "Itaim Paulista": "right", "Jardim Romano": "right", "Engenheiro Manoel Feio": "right",
    "Itaquaquecetuba": "right", "Aracaré": "right", "Calmon Viana": "right"
  },
  "13": {
    "Engenheiro Goulart": "right", "Guarulhos-CECAP": "right", "Aeroporto-Guarulhos": "right"
  }
};

export function platformSideFor(lineId: LineId, station: string): PlatformSide {
  return platformSides[lineId][station] ?? "right";
}
