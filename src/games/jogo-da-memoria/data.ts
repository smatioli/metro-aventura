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
      { id: "frota-j", src: "/games/metro-aventura/img/frotaJ_1.jpg", alt: "Trem da frota J", label: "Frota J" },
      { id: "frota-l", src: "/games/metro-aventura/img/frotaL_1.jpg", alt: "Trem da frota L", label: "Frota L" },
      { id: "frota-p", src: "/games/metro-aventura/img/frotaP_1.jpg", alt: "Trem da frota P", label: "Frota P" },
      { id: "frota-s", src: "/games/metro-aventura/img/frotaS_1.jpeg", alt: "Trem da frota S", label: "Frota S" }
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
  },
  {
    id: "jogadores",
    label: "Jogadores",
    icon: "🎽",
    color: "#d97706",
    softColor: "#ffe8b3",
    boardSize: 8,
    images: [
      { id: "alan-ruschel", src: "/games/jogadores/fotos/alan-ruschel.jpeg", alt: "Foto do Alan Ruschel", label: "Alan Ruschel" },
      { id: "arthur", src: "/games/jogadores/fotos/arthur.png", alt: "Foto do Arthur", label: "Arthur" },
      { id: "baralhas", src: "/games/jogadores/fotos/baralhas.png", alt: "Foto do Baralhas", label: "Baralhas" },
      { id: "brazao", src: "/games/jogadores/fotos/brazao.png", alt: "Foto do Brazão", label: "Brazão" },
      { id: "breno-lopes", src: "/games/jogadores/fotos/breno-lopes.png", alt: "Foto do Breno Lopes", label: "Breno Lopes" },
      { id: "bruno-henrique", src: "/games/jogadores/fotos/bruno-henrique.png", alt: "Foto do Bruno Henrique", label: "Bruno Henrique" },
      { id: "calleri", src: "/games/jogadores/fotos/calleri.png", alt: "Foto do Calleri", label: "Calleri" },
      { id: "cano", src: "/games/jogadores/fotos/cano.png", alt: "Foto do Cano", label: "Cano" },
      { id: "cassio", src: "/games/jogadores/fotos/cassio.png", alt: "Foto do Cássio", label: "Cássio" },
      { id: "ferreira", src: "/games/jogadores/fotos/ferreira.png", alt: "Foto do Ferreira", label: "Ferreira" },
      { id: "ferreirinha", src: "/games/jogadores/fotos/ferreirinha.png", alt: "Foto do Ferreirinha", label: "Ferreirinha" },
      { id: "ganso", src: "/games/jogadores/fotos/ganso.png", alt: "Foto do Ganso", label: "Ganso" },
      { id: "john-john", src: "/games/jogadores/fotos/john-john.png", alt: "Foto do John John", label: "John John" },
      { id: "keio-jorge", src: "/games/jogadores/fotos/keio-jorge.png", alt: "Foto do Kaio Jorge", label: "Kaio Jorge" },
      { id: "king", src: "/games/jogadores/fotos/king.png", alt: "Foto do King", label: "King" },
      { id: "lucas-ramon", src: "/games/jogadores/fotos/lucas-ramon.jpg", alt: "Foto do Lucas Ramon", label: "Lucas Ramon" },
      { id: "marcos-antonio", src: "/games/jogadores/fotos/marcos-antonio.png", alt: "Foto do Marcos Antônio", label: "Marcos Antônio" },
      { id: "oscar", src: "/games/jogadores/fotos/oscar.png", alt: "Foto do Oscar", label: "Oscar" },
      { id: "rafael", src: "/games/jogadores/fotos/rafael.png", alt: "Foto do Rafael", label: "Rafael" },
      { id: "renato-keizer", src: "/games/jogadores/fotos/renato-keizer.png", alt: "Foto do Renato Keizer", label: "Renato Keizer" },
      { id: "sasha", src: "/games/jogadores/fotos/sasha.png", alt: "Foto do Sasha", label: "Sasha" },
      { id: "vegetti", src: "/games/jogadores/fotos/vegetti.png", alt: "Foto do Vegetti", label: "Vegetti" },
      { id: "vitor-roque", src: "/games/jogadores/fotos/vitor-roque.png", alt: "Foto do Vitor Roque", label: "Vitor Roque" },
      { id: "weverton", src: "/games/jogadores/fotos/weverton.png", alt: "Foto do Weverton", label: "Weverton" },
      { id: "yuri-alberto", src: "/games/jogadores/fotos/yuri-alberto.png", alt: "Foto do Yuri Alberto", label: "Yuri Alberto" }
    ]
  },
  {
    id: "amigos",
    label: "Amigos da Escola",
    icon: `<img src="/games/CAF.png" alt="Logo do Colégio Augusto Figueiredo">`,
    color: "#5b6ee8",
    softColor: "#dde3ff",
    images: [
      { id: "icaro", src: "/games/amigos/Icaro.png", alt: "Foto do Ícaro", label: "Ícaro" },
      { id: "joao", src: "/games/amigos/Joao.png", alt: "Foto do João", label: "João" },
      { id: "lucas", src: "/games/amigos/Lucas.png", alt: "Foto do Lucas", label: "Lucas" },
      { id: "luiza", src: "/games/amigos/Luiza.png", alt: "Foto da Luiza", label: "Luiza" },
      { id: "pietro", src: "/games/amigos/Pietro.png", alt: "Foto do Pietro", label: "Pietro" },
      { id: "rafaela", src: "/games/amigos/Rafaela.png", alt: "Foto da Rafaela", label: "Rafaela" },
      { id: "teo", src: "/games/amigos/Teo.png", alt: "Foto do Teo", label: "Teo" }
    ]
  }
];

export function pairsForGroup(group: MemoryGroup): number {
  return Math.min(group.images.length, group.boardSize ?? maxPairsPerBoard);
}
