const path = window.location.pathname.replace(/\/+$/, "") || "/";

if (path === "/metro-aventura") {
  document.title = "Metrô Aventura | Estação de Jogos";
  void import("./games/metro-aventura/main");
} else if (path === "/metro-explorador") {
  document.title = "Metrô Explorador | Estação de Jogos";
  void import("./games/metro-explorador/main");
} else if (path === "/quem-e-quem") {
  document.title = "Quem é Quem | Estação de Jogos";
  void import("./games/quem-e-quem/main");
} else if (path === "/silabas") {
  document.title = "Sílabas | Estação de Jogos";
  void import("./games/silabas/main");
} else if (path === "/jogo-da-memoria") {
  document.title = "Jogo da Memória | Estação de Jogos";
  void import("./games/jogo-da-memoria/main");
} else {
  document.title = "Estação de Jogos";
  void import("./portal/main");
}
