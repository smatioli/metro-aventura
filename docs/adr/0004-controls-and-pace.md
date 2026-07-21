# ADR 0004: Controles consistentes e ritmo lento

- Status: aceito
- Data: 2026-07-21

## Contexto

O jogador consegue usar setas direcionais, barra de espaço, letras e números, mas precisa de tempo para compreender e executar cada ação.

## Decisão

Os controles principais serão:

- seta para a esquerda: mover a seleção para a esquerda;
- seta para a direita: mover a seleção para a direita;
- barra de espaço: confirmar ou realizar a ação destacada.

O jogo aguardará indefinidamente pela resposta. Não haverá falha, perda de pontos ou mudança automática da opção enquanto o jogador estiver decidindo. Cada comando produzirá retorno visual imediato e a próxima etapa só começará após uma pausa clara.

Letras e números ficam disponíveis para expansões, mas não serão introduzidos quando as três teclas principais forem suficientes.

## Consequências

- Os controles mantêm o mesmo significado em menus e atividades.
- O destaque não se move sozinho.
- Animações essenciais devem ser lentas e poder ser repetidas.
- Uma configuração para ajustar a velocidade será disponibilizada a um adulto.
- A interface mostrará uma ação ou decisão de cada vez.

