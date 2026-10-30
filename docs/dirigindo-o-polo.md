# Dirigindo o Polo

Novo jogo independente em `/dirigindo-o-polo/`. Não modifica nem importa o jogo `painel-do-carro`.

## Mapas

As três rotas são ilustrações fictícias autorais, definidas em `src/games/dirigindo-o-polo/data.ts`. Não usam Google Maps, geolocalização, tráfego ou navegação real. Os pontos são coordenadas do SVG (520 × 380), com eixo Y crescente para baixo. Não há serviço externo ou chave de API.

Para configurar outra rota, adicione um identificador, nome, ícone, destino e sequência de pontos. Use trechos de comprimento positivo e curvas claras de 90 graus. O jogo deriva o lado da curva da geometria. A parametrização atual atende apenas esses percursos ilustrados; importar ruas reais exige uma conversão de coordenadas e revisão das manobras.

## Regras e controles

O carro avança automaticamente em velocidade visual constante e espera em cada curva, sem limite de tempo ou penalidade. Virar pelo menos 45 graus para o lado indicado libera a manobra; em seguida é necessário centralizar o volante (tolerância de 15 graus) antes de continuar.

Mouse/toque: arraste o volante ou use os três botões. Teclado: setas esquerda/direita giram em passos de 15 graus; espaço, seta para cima ou Home centralizam. Espaço sobre um botão preserva a ativação nativa desse botão. Todos os botões são acessíveis por Tab e Enter.

As instruções combinam setas, texto e voz opcional em pt-BR. O botão Ouvir repete a instrução. Ao perder foco ou ocultar a aba, a viagem pausa e requer Continuar. Há opções de repetir o passeio e escolher outra rota.

## Verificação

Os testes puros cobrem lados das curvas, espera, lado incorreto, centralização, tempo negativo e conclusão das três rotas. Execute `npm test` e `npm run build`. A verificação visual deve incluir desktop e celular, arraste por mouse/toque, teclado, áudio desligado, pausa e chegada.
