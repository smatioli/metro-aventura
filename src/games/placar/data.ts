export type Position = 'GOL' | 'DEF' | 'MEI' | 'ATA';
export interface Team {
  id: string;
  name: string;
  shortName: string;
  color: string;
  players: { name: string; position: Position }[];
  source: string;
  matchDate: string;
}

// Retratos de partidas pesquisadas em 26/10/2026. Não são atualizados automaticamente.
// As posições são agrupamentos visuais; alas e pontas podem variar de função.
function team(id: string, name: string, shortName: string, color: string, matchDate: string, source: string, rows: [string, string, string, string]): Team {
  const positions: Position[] = ['GOL', 'DEF', 'MEI', 'ATA'];
  return { id, name, shortName, color, matchDate, source, players: rows.flatMap((row, index) => row.split('|').map(name => ({ name, position: positions[index] }))) };
}
const spfc = 'https://www.saopaulofc.net/fora-de-casa-sao-paulo-empata-com-mirassol-pelo-campeonato-brasileiro/';
const bragantino = 'https://www.redbullbragantino.com/br-pt/noticias/red-bull-bragantino-sofre-reves-na-32-rodada-do-brasileirao-2026';
const fluminense = 'https://www.fluminense.com.br/noticia/fluminense-perde-para-a-chapecoense-fora-de-casa-pelo-campeonato-brasileiro';
const atletico = 'https://atletico.com.br/atletico-vence-coritiba-e-chega-aos-50-pontos-no-brasileiro/';
const santos = 'https://www.santosfc.com.br/heroico-santos-fc-busca-empate-em-1-a-1-com-bahia-sob-diluvio-e-com-um-a-menos-na-vila/';
const vitoria = 'https://simnoticias.com.br/cnn-brasil/vitoria-x-athletico-pr-escalacoes-e-onde-assistir-ao-jogo-do-brasileirao/';
const vasco = 'https://www.uol.com.br/esporte/futebol/ultimas-noticias/2026/10/24/vasco-vira-em-2-min-frustra-seedorf-e-afunda-corinthians-em-jogo-dramatico.amp.htm';
const inter = 'https://www.lance.com.br/botafogo/botafogo-tem-uma-mudanca-para-enfrentar-o-internacional-veja-escalacao.html';

export const teams: Team[] = [
  team('athletico-pr', 'Athletico-PR', 'CAP', '#b91c32', '2026-10-24', vitoria, ['Mycael', 'Bruno Baldini|Aguirre|Esquivel', 'Gilberto Moraes|Luiz Gustavo|Jadson|João Cruz|Mendoza', 'Leozinho|Viveros']),
  team('atletico-mg', 'Atlético-MG', 'CAM', '#30343d', '2026-10-17', atletico, ['Gabriel Delfim', 'Natanael|Léo Duarte|Vitor Hugo|Kauãn Pascini', 'Tomás Pérez|Alexsander|Cissé|Igor Gomes', 'Alan Minda|Thiago Borbas']),
  team('bahia', 'Bahia', 'BAH', '#1464bc', '2026-10-24', santos, ['Ronaldo', 'Marcos Victor|David Duarte|Kanu|Luciano Juba', 'Acevedo|Erick|Rodrigo Nestor', 'Kike Olivera|Erick Pulga|Alejo Véliz']),
  team('botafogo', 'Botafogo', 'BOT', '#30343d', '2026-10-24', inter, ['Gabriel Batista', 'Vitinho|Ferraresi|Marçal|Alex Telles', 'Allan|Danilo|Cristian Medina|Montoro', 'Matheus Martins|Tiquinho Soares']),
  team('chapecoense', 'Chapecoense', 'CHA', '#147d45', '2026-10-24', fluminense, ['Anderson', 'Bruno Tubarão|Eduardo Doma|João Paulo|Bruno Pacheco', 'Camilo|Yago Felipe|Giovanni Augusto', 'Marcinho|Garcez|Bolasie']),
  team('corinthians', 'Corinthians', 'COR', '#343942', '2026-10-24', vasco, ['Hugo Souza', 'Matheuzinho|André Ramalho|Gustavo Henrique|Angileri', 'André|Breno Bidon|Rodrigo Garro', 'Matheus Bidu|Dieguinho|Yuri Alberto']),
  team('coritiba', 'Coritiba', 'CFC', '#167546', '2026-10-17', atletico, ['Pedro Morisco', 'Fabricio Bustos|Tiago Cóser|Jacy|Bruno Melo', 'Thiago Santos|Sebastián Gómez|Josué', 'Lavega|Pedro Rocha|Paulo Roberto']),
  team('cruzeiro', 'Cruzeiro', 'CRU', '#2459b9', '2026-10-23', 'https://www.diarioceleste.com.br/noticias-do-cruzeiro/cruzeiro-escalacao-oficial-remo-mineirao-brasileirao-2026/', ['Otávio', 'William|Fabrício Bruno|Jonathan Jesus|Lucas Villalba', 'Lucas Romero|Zé Lucas|Gerson|Matheus Pereira', 'Keny Arroyo|Kaio Jorge']),
  team('flamengo', 'Flamengo', 'FLA', '#ba263c', '2026-10-18', 'https://www.esporteclubebahia.com.br/fichas-tecnicas/', ['Rossi', 'Varela|Léo Ortiz|Léo Pereira|Emerson Royal', 'Pulgar|Jorginho|Carrascal', 'Plata|Samuel Lino|Pedro']),
  team('fluminense', 'Fluminense', 'FLU', '#8b2444', '2026-10-24', fluminense, ['Fábio', 'Guga|Ignácio|Igor Rabello|Guilherme Arana', 'Hércules|Nonato|Paulo Henrique Ganso', 'Wesley Natã|Kevin Serna|Hulk']),
  team('gremio', 'Grêmio', 'GRE', '#167bb8', '2026-10-18', 'https://www.cbf.com.br/futebol-brasileiro/jogos/campeonato-brasileiro/serie-c/2026/gremio-x-cruzeiro/832197?view=escalacao', ['Weverton', 'Diego Caito|Gustavo Martins|Kannemann|Marlon', 'Danilo Barbosa|Villasanti|Krovinović', 'Pavón|Amuzu|Carlos Vinícius']),
  team('internacional', 'Internacional', 'INT', '#bd253b', '2026-10-24', inter, ['Kauan Jesus', 'Bruno Gomes|Maripán|Juninho', 'Aguirre|Ronaldo|Thiago Maia|Matheus Bahia|Alan Patrick|Bernabei', 'Alerrandro']),
  team('mirassol', 'Mirassol', 'MIR', '#6a7d16', '2026-10-24', spfc, ['Walter', 'Igor Formiga|João Victor|Willian Machado|Reinaldo', 'Neto Moura|Denilson|Eduardo', 'Alesson|Bruno Santos|Edson Carioca']),
  team('palmeiras', 'Palmeiras', 'PAL', '#16784b', '2026-10-24', bragantino, ['Carlos Miguel', 'Bruno Fuchs|Gustavo Gómez|Barboza', 'Giay|Marlon Freitas|Lucas Evangelista|Arthur|Maurício', 'Jhon Arias|Ramón Sosa']),
  team('bragantino', 'Red Bull Bragantino', 'RBB', '#b22d42', '2026-10-24', bragantino, ['Tiago Volpi', 'Ryan|Alix Vinícius|Guzmán Rodríguez|Juninho Capixaba', 'Fabinho|Matheus Fernandes|Lucas Barbosa', 'Fernando|Isidro Pitta|Herrera']),
  team('remo', 'Remo', 'REM', '#243b76', '2026-10-23', 'https://www.remo100porcento.com/futebol-profissional/2026/cruzeiro-mg-x-remo-confira-as-escalacoes-oficiais-para-o-jogo-no-mineirao', ['Marcelo Rangel', 'Marcelinho|Marllon|Zé Ivaldo|Marlon', 'Zé Welison|Patrick|Zé Ricardo', 'Galeano|Eduardo Melo|Jajá']),
  team('santos', 'Santos', 'SAN', '#465363', '2026-10-24', santos, ['Diógenes', 'Rodinei|João Alencar|Luan Peres|Barreal', 'Gustavo Henrique|Gabriel Bontempo|Neymar Jr.', 'Coutinho|Everton|Gabriel Barbosa']),
  team('sao-paulo', 'São Paulo', 'SAO', '#b82a3e', '2026-10-24', spfc, ['Rafael', 'Newton|Arboleda|Osorio', 'Pedro Lima|Bobadilla|Djhordney|Marcos Antônio|Iago', 'Lucas Moura|Luciano']),
  team('vasco', 'Vasco', 'VAS', '#343942', '2026-10-24', vasco, ['Léo Jardim', 'Puma Rodríguez|Saldivia|Robert Renan|Cuiabano', 'Santiago Sosa|Thiago Mendes|Lescano', 'Colidio|Andrés Gómez|Bruno Duarte']),
  team('vitoria', 'Vitória', 'VIT', '#b7283f', '2026-10-24', vitoria, ['Lucas Arcanjo', 'Mateus Silva|Brítez|Luan Cândido|Jamerson', 'Caíque Gonçalves|Emmanuel Martínez|Matheuzinho', 'Erick|Diego Tarzia|Renato Kayzer']),
];
