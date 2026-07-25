# Contexto do projeto — Metrô Aventura

## Visão geral

Metrô Aventura é um jogo web simples de viagem em trens metropolitanos de São Paulo. O público principal é uma criança de 7 anos com autismo que ainda não lê, mas consegue usar mouse, setas, espaço, letras e números.

O jogo deve ser calmo, previsível e visual. Não há derrota, limite de tempo, punição por demora ou necessidade de reflexos rápidos. Textos ajudam os adultos, mas instruções importantes também precisam ser comunicadas por ícones, animações, teclas destacadas e voz.

## Experiência atual

O fluxo de uma nova viagem é:

1. Escolher a empresa.
2. Escolher a linha.
3. Escolher uma frota ou série compatível com a linha.
4. Escolher o sentido.
5. Realizar a viagem completa.

As telas de escolha funcionam com mouse e com as setas esquerda/direita e espaço. Durante a viagem:

- `↑` e `↓` alternam entre as vistas lateral, interior e cabine.
- A tecla destacada inicia a aceleração.
- Depois da velocidade de cruzeiro, outra tecla destacada inicia a frenagem.
- Por padrão, acelerar usa `A` e parar usa `P`.
- No painel adulto, as teclas podem ser sorteadas a cada trecho.
- `Espaço` abre e fecha as portas quando solicitado.
- Na estação, a câmera fica bloqueada na vista lateral.
- Não existe penalidade por apertar uma tecla errada ou demorar.

## Ciclo de viagem

Cada trecho segue uma sequência previsível:

1. O jogo mostra e fala a tecla de aceleração.
2. O trem acelera e anuncia a próxima estação.
3. O painel da cabine mostra velocidade e estado do movimento.
4. O trem mantém a velocidade pelo tempo configurado.
5. O jogo mostra e fala a tecla de frenagem.
6. O trem desacelera e chega à estação.
7. A vista muda para a lateral.
8. O jogo anuncia a estação e o lado do desembarque em português e inglês.
9. O jogador abre as portas.
10. Pessoas entram e saem.
11. O jogador fecha as portas.
12. O próximo trecho começa.

O mapa da rota mostra todas as estações e diferencia as já percorridas, a atual e as próximas.

## Empresas, linhas e frotas

### Metrô de São Paulo

- Linha 1-Azul: frotas E, I, J, K e L.
- Linha 2-Verde: frotas I e J.
- Linha 3-Vermelha: frotas G, H e K.

### Grupo CPTM no jogo

- Linha 7-Rubi: série 9500.
- Linha 8-Diamante: séries 8900 e 7000.
- Linha 9-Esmeralda: séries 8900 e 7000.
- Linha 10-Turquesa: séries 8500, 7500 e 2070.
- Linha 11-Coral: séries 8000 e 8500.
- Linha 12-Safira: séries 7000, 8500 e 9000.
- Linha 13-Jade: série 2500.

A matriz acima foi definida pelo responsável do projeto e é a autoridade para o jogo. As linhas 8 e 9 ficam agrupadas na opção CPTM dentro da experiência, independentemente da operação comercial atual.

As estações, cores, compatibilidades e lados de desembarque ficam em `src/data.ts`. Todas as estações novas da CPTM foram inicialmente configuradas com desembarque à direita; os casos à esquerda devem ser alterados manualmente em `platformSides`.

## Direção visual

- A vista lateral usa uma ilustração animada do trem.
- A ilustração varia cores, faixas e formato frontal conforme a frota.
- O logotipo da empresa aparece no trem.
- A cabine e o interior usam referências fotográficas provisórias.
- Os cartões das séries CPTM usam imagens em `public/img` nomeadas pelo número da série.
- Na estação, as portas abrem visualmente e passageiros entram e saem.
- A tecla esperada deve permanecer grande e destacada.

Antes de publicar imagens, é necessário confirmar as permissões de uso.

## Áudio e acessibilidade

- A voz usa a síntese de fala do navegador em ritmo reduzido.
- O anúncio do lado de desembarque é repetido em inglês.
- O trem possui sons diferentes para aceleração, cruzeiro e desaceleração.
- Voz e sons podem ser desligados.
- Instruções não devem depender somente de texto, cor ou áudio.
- Evitar estímulos súbitos, sons agressivos, excesso de movimento e várias solicitações simultâneas.
- Mudanças de estado devem acontecer devagar e sempre na mesma ordem.

## Configurações e persistência

O painel adulto permite:

- escolher o tempo de viagem entre estações;
- alternar entre teclas fixas e teclas sorteadas.

As preferências e o progresso são armazenados no `localStorage`. Uma viagem salva pode ser retomada pela tela inicial.

## Stack técnica

- TypeScript
- HTML e CSS
- Vite
- Vitest
- Web Speech API para voz
- Web Audio API para os sons do trem
- `localStorage` para preferências e progresso
- Netlify para publicação estática

Não há backend, banco de dados nem framework de interface.

## Arquivos principais

- `src/main.ts`: telas, eventos, fluxo da viagem, fala e renderização.
- `src/data.ts`: empresas, linhas, estações, frotas, imagens, temas e lados das plataformas.
- `src/game-state.ts`: regras puras e tipos do estado do jogo.
- `src/train-audio.ts`: sons de movimento do trem.
- `src/style.css`: layout, animações e aparência.
- `src/game-state.test.ts`: testes das regras, rotas, frotas e plataformas.
- `public/img/`: imagens copiadas diretamente para o build.
- `docs/station-catalog.md`: catálogo legível das estações.
- `docs/fleet-catalog.md`: catálogo e decisões sobre frotas.
- `docs/adr/`: decisões arquiteturais registradas.
- `netlify.toml`: configuração de publicação.

## Comandos

```bash
npm install
npm run dev
npm test
npm run build
```

O build de produção é gerado em `dist/`. Essa pasta não deve ser versionada; o Netlify executa o build e publica seu conteúdo.

## Regras para futuras alterações

- Preservar o fluxo `empresa → linha → frota → sentido → viagem`.
- Filtrar as frotas pela linha selecionada.
- Manter mouse e teclado funcionando nas telas de seleção.
- Manter controles grandes e visualmente demonstrados.
- Não adicionar contagem regressiva, derrota ou punições sem decisão explícita.
- Não exigir leitura para concluir uma ação.
- Manter a vista lateral fixa durante a operação das portas.
- Atualizar `platformSides` ao adicionar ou renomear estações.
- Atualizar os testes e os catálogos ao alterar linhas, estações ou frotas.
- Executar `npm test` e `npm run build` antes de publicar.

## Ideias futuras já consideradas

Possíveis ações adicionais, desde que introduzidas uma por vez e sem aumentar a pressão:

- buzina;
- ligar faróis;
- aviso sonoro antes do fechamento das portas;
- escolher visualmente o lado correto das portas;
- sinais verde, amarelo e vermelho;
- limpador de para-brisa em trechos com chuva;
- luzes internas;
- cartões visuais de viagens concluídas.

