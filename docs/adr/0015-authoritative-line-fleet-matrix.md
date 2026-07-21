# ADR 0015: Matriz linha–frota adotada pelo jogo

- Status: aceito
- Data: 2026-07-21

## Contexto

A relação de frotas fornecida para o projeto diverge em alguns pontos da página institucional consultada. Foi necessário escolher uma única regra para evitar opções inconsistentes no jogo.

## Decisão

O jogo adotará como autoridade a relação fornecida pelo responsável pelo projeto:

- Linha 1-Azul: frotas E, I, J, K e L;
- Linha 2-Verde: frotas I e J;
- Linha 3-Vermelha: frotas G, H e K.

A indicação de que a frota E atua como reserva será ignorada. Ela aparecerá como uma opção normal da Linha 1-Azul.

Frotas A, M e S não serão selecionáveis na primeira versão.

## Consequências

- A tela de seleção filtrará os cartões exclusivamente por essa matriz.
- O catálogo não tentará corrigir a relação com base em fontes externas sem nova decisão.
- As frotas H e J precisarão de referências visuais adicionais.

