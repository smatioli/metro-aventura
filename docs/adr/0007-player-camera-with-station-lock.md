# ADR 0007: Câmera escolhida pelo jogador com vista lateral nas paradas

- Status: aceito
- Data: 2026-07-21

## Contexto

O jogo terá vistas lateral externa, interior do vagão e cabine. O jogador deve escolher o que observar, mas a operação das portas precisa permanecer simples e visualmente consistente.

## Decisão

Durante o deslocamento, as setas para cima e para baixo alternarão entre as três perspectivas. A mudança será acompanhada por uma transição suave.

Ao chegar a uma estação, o jogo mudará para a vista lateral externa e manterá essa perspectiva durante a abertura, o embarque, o desembarque e o fechamento das portas. Nesse período, as setas para cima e para baixo não mudarão a câmera.

Depois que as portas forem fechadas e o trem partir, a escolha de perspectiva será liberada novamente.

## Consequências

- A operação das portas sempre ocorre no mesmo contexto visual.
- O jogo deve sinalizar visualmente quando a troca de perspectiva está disponível.
- Teclas temporariamente indisponíveis não produzirão erro, som negativo ou punição.
- A perspectiva usada antes da chegada poderá ser restaurada após a partida.

