# ADR 0006: Três perspectivas da viagem

- Status: aceito
- Data: 2026-07-21

## Contexto

O jogador gosta de observar o trem externamente, o interior do vagão e a cabine do condutor. A perspectiva lateral foi escolhida como a vista principal, mas não deve ser a única.

## Decisão

O jogo terá três perspectivas:

- lateral externa, priorizada nas chegadas, plataformas e operação das portas;
- interior do vagão, mostrando portas, janelas e passageiros;
- cabine do condutor, mostrando trilhos, túneis e aproximação da próxima estação.

As três vistas representarão a mesma viagem e o mesmo estado do trem. Mudar a câmera não reiniciará nem avançará a rota.

## Consequências

- O estado de portas, movimento e estação precisa permanecer sincronizado entre as vistas.
- Cada perspectiva deve ter movimento lento e evitar cortes visuais bruscos.
- A lateral externa será a referência visual durante a sequência de parada.
- Ainda é necessário decidir se as perspectivas mudam automaticamente ou por comando do jogador.

