# ADR 0017: Linha 4-Amarela, Linha 5-Lilás e a companhia ViaMobilidade

- Status: aceito
- Data: 2026-07-30

## Contexto

As linhas 4-Amarela e 5-Lilás do Metropolitano de São Paulo são operadas por concessionárias privadas distintas na vida real (ViaQuatro para a Linha 4 e ViaMobilidade/Motiva Trilhos para a Linha 5), diferente das linhas 1, 2 e 3, operadas diretamente pelo Metrô. O jogo já simplifica outras nuances operacionais reais em favor de uma experiência simples para o jogador (ADR 0015 uniu as linhas 8 e 9 sob a opção CPTM).

Existem referências fotográficas frontais para os trens das duas linhas, fornecidas para o projeto: `img/frota_400.jpeg` (Linha 4) e `img/frota_500.jpeg` (Linha 5), além do logotipo `img/via_mobilidade_logo.jpeg`.

## Decisão

O jogo adota "ViaMobilidade" como uma terceira companhia selecionável, ao lado de Metrô de São Paulo e CPTM, agrupando as linhas 4-Amarela e 5-Lilás. Essa simplificação segue o mesmo princípio da ADR 0015: uma única regra de agrupamento, definida para o jogo, ainda que divirja da separação real entre ViaQuatro e ViaMobilidade.

Cada linha usa uma única frota, nomeada conforme fornecido para o projeto:

- Linha 4-Amarela: frota 400.
- Linha 5-Lilás: frota 500.

As estações seguem a ordem real de operação, da fonte institucional consultada em 2026-07-30 (Linha 4: Luz–Vila Sônia, 11 estações; Linha 5: Capão Redondo–Chácara Klabin, 17 estações).

Como nas demais linhas novas, todas as estações foram configuradas inicialmente com desembarque à direita em `platformSides`; os casos à esquerda devem ser corrigidos manualmente quando confirmados.

## Consequências

- A tela de escolha da companhia passa a ter três opções; o layout da grade foi ajustado para acomodar três cartões sem sobreposição.
- Textos e rótulos que antes distinguiam apenas "Metrô" e "CPTM" (como o nome da companhia mostrado na cena da viagem) precisam ser genéricos para qualquer companhia cadastrada.
- Estações repetidas em mais de uma linha (por exemplo, "Luz", "Pinheiros", "Santa Cruz", "Chácara Klabin") são intencionais e refletem integrações reais entre linhas.
