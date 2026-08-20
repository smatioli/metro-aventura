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
  // Sobrescreve maxPairsPerBoard para este grupo. Útil quando o grupo tem mais
  // imagens do que cabem no tabuleiro: a cada rodada, buildBoard sorteia esta
  // quantidade dentre todas as imagens do grupo.
  boardSize?: number;
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
  },
  {
    id: "painel",
    label: "Painel do Carro",
    icon: `<img src="/games/logo_volks.jpg" alt="Logo Volkswagen">`,
    color: "#0b4ea2",
    softColor: "#cfe0f7",
    images: [
      { id: "d1", src: "/games/painel/D1.png", alt: "Painel do carro D1", label: "D1" },
      { id: "d2", src: "/games/painel/D2.png", alt: "Painel do carro D2", label: "D2" },
      { id: "d3", src: "/games/painel/D3.png", alt: "Painel do carro D3", label: "D3" },
      { id: "d4", src: "/games/painel/D4.png", alt: "Painel do carro D4", label: "D4" },
      { id: "d5", src: "/games/painel/D5.png", alt: "Painel do carro D5", label: "D5" },
      { id: "d6", src: "/games/painel/D6.png", alt: "Painel do carro D6", label: "D6" }
    ]
  },
  {
    id: "times",
    label: "Times do Brasil",
    icon: "⚽",
    color: "#1f9e52",
    softColor: "#d4f5e2",
    boardSize: 8,
    images: [
      { id: "sao-paulo", src: "/games/jogo-da-memoria/img/times/sao-paulo.png", alt: "Escudo do São Paulo", label: "São Paulo" },
      { id: "internacional", src: "/games/jogo-da-memoria/img/times/internacional.png", alt: "Escudo do Internacional", label: "Internacional" },
      { id: "cruzeiro", src: "/games/jogo-da-memoria/img/times/cruzeiro.png", alt: "Escudo do Cruzeiro", label: "Cruzeiro" },
      { id: "vitoria", src: "/games/jogo-da-memoria/img/times/vitoria.png", alt: "Escudo do Vitória", label: "Vitória" },
      { id: "vasco", src: "/games/jogo-da-memoria/img/times/vasco.png", alt: "Escudo do Vasco da Gama", label: "Vasco da Gama" },
      { id: "ceara", src: "/games/jogo-da-memoria/img/times/ceara.png", alt: "Escudo do Ceará", label: "Ceará" },
      { id: "flamengo", src: "/games/jogo-da-memoria/img/times/flamengo.png", alt: "Escudo do Flamengo", label: "Flamengo" },
      { id: "palmeiras", src: "/games/jogo-da-memoria/img/times/palmeiras.png", alt: "Escudo do Palmeiras", label: "Palmeiras" },
      { id: "corinthians", src: "/games/jogo-da-memoria/img/times/corinthians.png", alt: "Escudo do Corinthians", label: "Corinthians" },
      { id: "santos", src: "/games/jogo-da-memoria/img/times/santos.png", alt: "Escudo do Santos", label: "Santos" },
      { id: "botafogo", src: "/games/jogo-da-memoria/img/times/botafogo.png", alt: "Escudo do Botafogo", label: "Botafogo" },
      { id: "fluminense", src: "/games/jogo-da-memoria/img/times/fluminense.png", alt: "Escudo do Fluminense", label: "Fluminense" },
      { id: "gremio", src: "/games/jogo-da-memoria/img/times/gremio.png", alt: "Escudo do Grêmio", label: "Grêmio" },
      { id: "atletico-mg", src: "/games/jogo-da-memoria/img/times/atletico-mg.png", alt: "Escudo do Atlético Mineiro", label: "Atlético-MG" },
      { id: "bahia", src: "/games/jogo-da-memoria/img/times/bahia.png", alt: "Escudo do Bahia", label: "Bahia" },
      { id: "athletico-pr", src: "/games/jogo-da-memoria/img/times/athletico-pr.png", alt: "Escudo do Athletico Paranaense", label: "Athletico-PR" },
      { id: "coritiba", src: "/games/jogo-da-memoria/img/times/coritiba.png", alt: "Escudo do Coritiba", label: "Coritiba" },
      { id: "chapecoense", src: "/games/jogo-da-memoria/img/times/chapecoense.png", alt: "Escudo da Chapecoense", label: "Chapecoense" },
      { id: "mirassol", src: "/games/jogo-da-memoria/img/times/mirassol.png", alt: "Escudo do Mirassol", label: "Mirassol" },
      { id: "bragantino", src: "/games/jogo-da-memoria/img/times/bragantino.png", alt: "Escudo do Red Bull Bragantino", label: "Bragantino" },
      { id: "remo", src: "/games/jogo-da-memoria/img/times/remo.png", alt: "Escudo do Remo", label: "Remo" }
    ]
  }
];

export function pairsForGroup(group: MemoryGroup): number {
  return Math.min(group.images.length, group.boardSize ?? maxPairsPerBoard);
}
