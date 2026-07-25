const path = window.location.pathname.replace(/\/+$/, "") || "/";

if (path === "/metro-aventura") {
  document.title = "Metrô Aventura | Estação de Jogos";
  void import("./games/metro-aventura/main");
} else if (path === "/jornalistas") {
  document.title = "Jornalistas | Estação de Jogos";
  void import("./games/jornalistas/main");
} else if (path === "/silabas") {
  document.title = "Sílabas | Estação de Jogos";
  void import("./games/silabas/main");
} else {
  document.title = "Estação de Jogos";
  void import("./portal/main");
}
