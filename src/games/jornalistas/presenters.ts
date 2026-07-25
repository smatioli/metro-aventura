export interface Presenter {
  id: string;
  name: string;
  shortName: string;
  article: "o" | "a";
  show: string;
  photo: string;
  logo: string;
  symbol: string;
  color: string;
  soft: string;
  skin: string;
  hair: string;
}

export const presenters: Presenter[] = [
  { id: "sabina-simonato", name: "Sabina Simonato", shortName: "SABINA", article: "a", show: "Bom Dia São Paulo", photo: "/games/jornalistas/apresentadores/sabina-simonato.webp", logo: "/games/jornalistas/logos/bom-dia-sp.png", symbol: "☀", color: "#ee8c32", soft: "#ffe0a3", skin: "#d59a74", hair: "#493024" },
  { id: "marcelo-pereira", name: "Marcelo Pereira", shortName: "MARCELO", article: "o", show: "Bom Dia São Paulo", photo: "/games/jornalistas/apresentadores/marcelo-pereira.jpg", logo: "/games/jornalistas/logos/bom-dia-sp.png", symbol: "☀", color: "#ee8c32", soft: "#ffe0a3", skin: "#805039", hair: "#211a17" },
  { id: "alan-severiano", name: "Alan Severiano", shortName: "ALAN", article: "o", show: "SP1", photo: "/games/jornalistas/apresentadores/alan-severiano.jpg", logo: "/games/jornalistas/logos/sp1.jpeg", symbol: "1", color: "#d94b3d", soft: "#ffc1b9", skin: "#9c6448", hair: "#201816" },
  { id: "jose-roberto-burnier", name: "José Roberto Burnier", shortName: "BURNIER", article: "o", show: "SP2", photo: "/games/jornalistas/apresentadores/jose-roberto-burnier.jpg", logo: "/games/jornalistas/logos/sp2.jpeg", symbol: "2", color: "#326eb8", soft: "#bad8ff", skin: "#d39b75", hair: "#9b938d" },
  { id: "fred", name: "Fred", shortName: "FRED", article: "o", show: "Globo Esporte", photo: "/games/jornalistas/apresentadores/fred.jpeg", logo: "/games/jornalistas/logos/globo-esporte.jpg", symbol: "⚽", color: "#31a65a", soft: "#baf0c9", skin: "#8d573d", hair: "#241916" },
  { id: "cesar-tralli", name: "Cesar Tralli", shortName: "TRALLI", article: "o", show: "Jornal Nacional", photo: "/games/jornalistas/apresentadores/cesar-tralli.avif", logo: "/games/jornalistas/logos/jornal-nacional.webp", symbol: "◆", color: "#24569b", soft: "#a8caff", skin: "#d4a07c", hair: "#3a302b" },
  { id: "renata-vasconcelos", name: "Renata Vasconcelos", shortName: "RENATA", article: "a", show: "Jornal Nacional", photo: "/games/jornalistas/apresentadores/renata-vasconcelos.webp", logo: "/games/jornalistas/logos/jornal-nacional.webp", symbol: "◆", color: "#24569b", soft: "#a8caff", skin: "#c88e68", hair: "#38251f" }
];
