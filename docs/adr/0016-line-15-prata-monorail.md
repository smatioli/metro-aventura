# ADR 0016: Linha 15-Prata e frota M

- Status: aceito
- Data: 2026-07-30

## Contexto

A ADR 0013 deixou as frotas A, M e S fora de seleção na primeira versão porque pertenciam apenas à Linha 15-Prata, ainda não incluída no jogo. A Linha 15-Prata é um monotrilho do Metrô de São Paulo, com trens unidirecionais (composições, não trens tradicionais de dois sentidos como as demais linhas).

Existe referência fotográfica frontal para a frota M (`img/frotaM_1.jpg`), registrada em `docs/fleet-catalog.md`. Não há referência para a frota S.

## Decisão

A Linha 15-Prata passa a ser jogável, associada à companhia Metrô de São Paulo, com as 11 estações atualmente em operação: Vila Prudente, Oratório, São Lucas, Camilo Haddad, Vila Tolstói, Vila União, Jardim Planalto, Sapopemba, Fazenda da Juta, São Mateus e Jardim Colonial (fonte: página oficial do Metrô, consultada em 2026-07-30).

A frota M passa a ser selecionável, revertendo parcialmente a ADR 0013, pois agora há uma linha compatível e uma imagem de referência disponível. A frota S permanece fora de seleção até que exista referência visual.

Todas as estações da Linha 15-Prata foram configuradas inicialmente com desembarque à direita em `platformSides`, seguindo a mesma convenção usada para novas estações da CPTM (ADR 0015); os casos à esquerda devem ser corrigidos manualmente quando confirmados.

## Consequências

- A Linha 15-Prata segue o mesmo fluxo empresa → linha → frota → sentido → viagem das demais linhas, sem necessidade de lógica nova no jogo.
- A extensão da linha (novas estações em direção a Cidade Tiradentes e Ipiranga) deverá ser incorporada aos dados quando entrar em operação.
- A frota S poderá ser adicionada futuramente quando houver imagem de referência.
