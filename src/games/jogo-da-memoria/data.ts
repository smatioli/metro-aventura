export interface MemoryImage {
  id: string;
  src: string;
  alt: string;
  label: string;
}

export interface MemoryGroup {
  id: string;
  label: string;
  icon: string;
  color: string;
  softColor: string;
  images: MemoryImage[];
}

export const maxPairsPerBoard = 6;

// Novos grupos: crie uma pasta public/games/jogo-da-memoria/img/<id>/ com as
// imagens e liste-as aqui. Cada grupo precisa de pelo menos 2 imagens; o
// tabuleiro usa até `maxPairsPerBoard` pares (menos, se o grupo tiver menos
// imagens que isso).
export const memoryGroups: MemoryGroup[] = [
  {
    id: "trens",
    label: "Trens",
    icon: "🚈",
    color: "#2f6fed",
    softColor: "#d7e4ff",
    images: [
      { id: "frota-a", src: "/games/metro-aventura/img/frotaA_1.jpg", alt: "Trem da frota A", label: "Frota A" },
      { id: "frota-e", src: "/games/metro-aventura/img/frotaE_1.jpg", alt: "Trem da frota E", label: "Frota E" },
      { id: "frota-g", src: "/games/metro-aventura/img/frotaG_1.jpg", alt: "Trem da frota G", label: "Frota G" },
      { id: "frota-h", src: "/games/metro-aventura/img/frotaH_1.jpg", alt: "Trem da frota H", label: "Frota H" },
      { id: "frota-i", src: "/games/metro-aventura/img/frotaI_1.jpg", alt: "Trem da frota I", label: "Frota I" },
      { id: "frota-j", src: "/games/metro-aventura/img/frotaJ_1.jpg", alt: "Trem da frota J", label: "Frota J" }
    ]
  },
  {
    id: "companhias",
    label: "Companhias",
    icon: "🏢",
    color: "#e0632f",
    softColor: "#ffdfcb",
    images: [
      { id: "metro-sp", src: "/games/metro-aventura/img/metro-sp-logo.png", alt: "Logo do Metrô de São Paulo", label: "Metrô SP" },
      { id: "cptm", src: "/games/metro-aventura/img/cptm-logo.webp", alt: "Logo da CPTM", label: "CPTM" },
      { id: "via-mobilidade", src: "/games/metro-aventura/img/via_mobilidade_logo.jpeg", alt: "Logo da Via Mobilidade", label: "Via Mobilidade" }
    ]
  }
];

export function pairsForGroup(group: MemoryGroup): number {
  return Math.min(group.images.length, maxPairsPerBoard);
}
