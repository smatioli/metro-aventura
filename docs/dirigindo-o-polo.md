# Dirigindo o Polo

Jogo independente em `/dirigindo-o-polo/`, sem alterações no Painel do carro.

## Passeios fixos

O cadastro fica em `src/games/dirigindo-o-polo/data.ts`. Os GeoJSON originais são preservados, inclusive espaços e acentos nos nomes dos arquivos.

| Destino | GeoJSON | Trechos com nome de rua |
| --- | --- | --- |
| Instituto TEA | `public/routes/instituro-tea.geojson` | 209/209 |
| Casa da vó Antônia | `public/routes/casa da vó antonia.geojson` | 518/518 |
| Casa da vó Fátima | `public/routes/casa da vó fatima.geojson` | 478/478 |
| Estádio Morumbi | `public/routes/estadio morumbi.geojson` | 753/753 |

Coordenadas são projetadas em metros locais; pontos repetidos são removidos para evitar trechos de comprimento zero. Cada passeio tem arquivos `<id>-streets.json` (mapa) e `<id>-navigation.json` (nome da via por trecho, fonte, licença, data e índices sem correspondência). Os nomes estão preenchidos em todos os trechos das quatro rotas, por associação automática, sem revisão manual de cada via.

O mapa e os nomes vêm de dados OpenStreetMap, consultados na Overpass API em 2026-11-07. Fonte: https://www.openstreetmap.org ; licença ODbL: https://opendatacommons.org/licenses/odbl/1-0/ . Atribuição visível no jogo. As consultas usam `way[highway][name]` na área do percurso ([referência Overpass QL](https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL)). O preparo mantém apenas um corredor do mapa e exclui vias exclusivamente de pedestres/ciclistas da associação de nomes. O mapa é um recorte simplificado, sem prédios ou trânsito.

Para preparar dados novamente:

```bash
python3 scripts/prepare-polo-queries.py 'public/routes/estadio morumbi.geojson' /tmp/morumbi.query
curl -G --fail --data-urlencode data@/tmp/morumbi.query https://overpass-api.de/api/interpreter -o /tmp/morumbi-osm.json
python3 scripts/prepare-polo-route.py estadio-morumbi 'public/routes/estadio morumbi.geojson' /tmp/morumbi-osm.json
```

O script de preparo associa nomes por distância (até 30 m) e alinhamento, favorecendo a via paralela ao trecho. Isso é uma aproximação, não map matching de um roteador; vias paralelas e cruzamentos podem causar associação incorreta. Não inventa nome quando não encontra correspondência: deixa vazio e registra o índice em `unmatchedSegments`.

A câmera acompanha o carro, com sentido de deslocamento para cima e inclinação visual. Conversões são estimadas comparando direções em uma janela de 25 m antes/depois, com mudança mínima de 42 graus. Detecções do mesmo lado a menos de 35 m são agrupadas na curva mais forte; isso permite reconhecer esquinas desenhadas com vários pontos suaves. Para instruções definitivas, conferir as manobras ou usar as retornadas por um motor de rotas. Não usar como navegador para trânsito real.

## Controles e narração

O carro avança automaticamente e espera nas conversões detectadas, sem limite de tempo ou penalidade. Basta escolher o lado correto: virar pelo menos 45 graus libera imediatamente o próximo trecho. O volante volta visualmente ao meio automaticamente; nenhuma ação de centralização é exigida. Um lado incorreto mantém a espera.

Mouse/toque: arraste o volante ou use os dois botões Esquerda/Direita. Teclado: esquerda/direita; espaço, cima e Home ajustam o volante ao meio opcionalmente. Espaço sobre um botão preserva sua ativação nativa.

Narração sempre ativa via `speechSynthesis`, idioma pt-BR e velocidade reduzida, iniciada após clicar em Iniciar passeio. A saída depende do suporte e vozes do navegador/sistema. Ouvir repete a instrução. Há aviso antecipado a menos de 90 metros da próxima conversão, incluindo o nome da rua. Texto e setas continuam presentes. A viagem pausa ao perder foco e exige Continuar.

## Celular e carregamento

A seleção carrega apenas trajetos e nomes preparados. O mapa é solicitado ao escolher um passeio, e somente o último mapa fica em memória. Os nomes não são calculados no celular. A viagem não chama APIs externas ou baixa imagens de mapas.

Layout compacto em retrato, com mapa, instrução e volante juntos; botões de direção com altura mínima de 58 px, suporte a áreas seguras e arraste sem rolar a página. Em paisagem baixa, mapa e controles ficam lado a lado. O mapa atualiza a até 30 quadros/s; referências DOM são reutilizadas e os nomes só giram quando o rumo muda. A animação não redesenha enquanto espera a manobra ou está pausada.

## Verificação

`npm test` e `npm run build`. Testes cobrem arquivos reais dos quatro passeios, nomes para todos os trechos, chegada sem centralizar, lado incorreto, pontos duplicados e esquinas suaves.

Chrome confirmou o carregamento e início dos três novos passeios, com destino, mapa e nome de rua na tela inicial de cada rota. Na rota Morumbi, escolher Direita na conversão da Rua Atopé para a Avenida Jacinto Menezes Palhares avançou do trecho 24 para o 25 e retomou o movimento imediatamente, sem centralizar.

Verificação anterior em viewport Chrome 390×844, 360×640 e 844×390: sem transbordamento horizontal; botões visíveis e giro confirmados por estado acessível. Isso não substitui teste de toque e locução em Android/iOS físicos, nem revisão das associações de ruas.
