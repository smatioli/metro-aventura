# ADR 0018: Linha 17-Ouro e frota N

- Status: aceito
- Data: 2026-08-10

## Contexto

A Linha 17-Ouro é o segundo monotrilho do Metrô de São Paulo. Suas oito estações iniciais (Morumbi–Aeroporto de Congonhas) foram inauguradas em 2026-03-31, ligando a Linha 9-Esmeralda (Morumbi) à Linha 5-Lilás (Campo Belo) e ao Aeroporto de Congonhas. Em 2026-06-30 a linha ganhou uma bifurcação em Y após a estação Brooklin Paulista, com um ramo adicional até a estação Washington Luís (fonte: página institucional do Metrô e Wikipédia, consultadas em 2026-08-10).

O modelo de dados do jogo (`MetroLine.stations: string[]`) representa apenas linhas simples, sem ramificação — nenhuma outra linha do jogo bifurca. Ainda que a linha real acabe em dois terminais possíveis, o jogo simplifica a viagem para o terminal mais notável (o aeroporto).

A linha é concessionada à Motiva Linhas 5 e 17 (antiga ViaMobilidade), a mesma concessionária já agrupada no jogo como companhia "viamobilidade" (ADR 0017, linhas 4 e 5). Usa trens monotrilho BYD SkyRail, tecnologicamente semelhantes aos da Linha 15-Prata e Linha 4, mas de um fabricante e desenho diferentes — um trem novo para o catálogo de frotas do jogo. Uma foto frontal desse trem (`img/frota_N.jpg`) foi fornecida para o projeto.

## Decisão

A Linha 17-Ouro passa a ser jogável, associada à companhia ViaMobilidade, com as sete estações do ramo até o Aeroporto de Congonhas: Morumbi, Chucri Zaidan, Vila Cordeiro, Campo Belo, Vereador José Diniz, Brooklin Paulista e Aeroporto de Congonhas. O ramo até Washington Luís fica de fora até que o jogo suporte linhas com bifurcação.

A frota N é adicionada ao catálogo, usando a foto frontal fornecida como referência de identidade, seguindo a mesma regra das demais frotas (ADR 0013/0016: só é selecionável quando há foto real).

Todas as estações da Linha 17-Ouro foram configuradas inicialmente com desembarque à direita em `platformSides`, seguindo a mesma convenção usada para novas linhas (ADR 0015/0016/0017); os casos à esquerda devem ser corrigidos manualmente quando confirmados.

## Consequências

- A tela de escolha de linha da ViaMobilidade passa a ter três opções (4, 5 e 17); a grade de linhas já se ajusta automaticamente ao número de linhas por companhia, sem mudança de código.
- O ramo até Washington Luís e o suporte a linhas em Y ficam como trabalho futuro, caso o jogo venha a modelar bifurcações.
- `docs/station-catalog.md` e `docs/fleet-catalog.md` foram atualizados com a Linha 17-Ouro e a frota N.
