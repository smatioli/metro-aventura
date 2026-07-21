# ADR 0014: Salvamento automático após cada estação

- Status: aceito
- Data: 2026-07-21

## Contexto

Uma viagem completa, em ritmo lento, pode ser longa. Fechar a página não deve obrigar o jogador a repetir o percurso desde o terminal.

## Decisão

O jogo salvará automaticamente no navegador após a conclusão de cada estação. O registro conterá linha, sentido, frota, estação alcançada, perspectiva preferida e configurações de ritmo e áudio.

Quando existir uma viagem incompleta, a abertura mostrará dois cartões visuais:

- continuar a viagem, ilustrado pelo trem e pela estação salvos;
- iniciar outra viagem, ilustrado pelas três linhas.

O nome de cada opção será falado ao receber destaque. Não haverá conta, cadastro ou sincronização online na primeira versão.

## Consequências

- O progresso permanece no mesmo navegador e computador.
- Limpar os dados do navegador remove o progresso salvo.
- O salvamento ocorre somente em pontos seguros, com o trem parado e as portas fechadas.
- O painel adulto deverá oferecer uma ação explícita para apagar a viagem salva.

