# ADR 0012: Apenas modo viagem com combinações reais

- Status: aceito
- Data: 2026-07-21

## Contexto

Foi considerada a possibilidade de oferecer um modo livre com qualquer frota em qualquer linha. A experiência, porém, deve representar viagens coerentes com a operação real e permanecer simples.

## Decisão

O jogo terá somente o modo viagem. Depois da escolha da linha, serão apresentados apenas cartões de frotas compatíveis com essa linha.

Frotas incompatíveis não aparecerão bloqueadas e não gerarão mensagens de erro. A relação entre linhas e frotas ficará em dados configuráveis, separada da lógica do jogo, para permitir correções futuras.

## Consequências

- Toda combinação oferecida ao jogador deverá representar uma operação real definida para o projeto.
- A fonte e a data de referência da compatibilidade precisarão ser registradas.
- Mudanças na operação poderão ser incorporadas sem alterar as telas ou as regras principais.
- Não haverá modo livre na primeira versão.

