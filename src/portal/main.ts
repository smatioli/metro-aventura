import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <main class="games-hub">
    <header class="hub-header">
      <span class="hub-mark" aria-hidden="true">JOGOS</span>
      <p class="eyebrow">ESTAÇÃO DE JOGOS</p>
      <h1>Qual aventura<br><em>vamos jogar?</em></h1>
      <p class="intro">Escolha um jogo para começar.</p>
    </header>

    <section class="games-grid" aria-label="Jogos disponíveis">
      <a class="game-card metro-card" href="/metro-aventura/">
        <span class="status available">DISPONÍVEL</span>
        <div class="metro-illustration" aria-hidden="true">
          <span class="rail rail-one"></span><span class="rail rail-two"></span>
          <div class="train"><i></i><i></i><b>1</b></div>
        </div>
        <div class="card-copy">
          <span class="game-number">JOGO 01</span>
          <h2>Metrô<br>Aventura</h2>
          <p>Escolha a linha, conduza o trem e complete sua viagem.</p>
          <strong>JOGAR AGORA <span>→</span></strong>
        </div>
      </a>

      <a class="game-card news-card" href="/quem-e-quem/">
        <span class="status available">DISPONÍVEL</span>
        <div class="news-illustration" aria-hidden="true">
          <div class="press-card"><span>ADIVINHE</span><b>?</b></div>
          <div class="microphone"></div>
          <div class="signal">)))</div>
        </div>
        <div class="card-copy">
          <span class="game-number">JOGO 02</span>
          <h2>Quem é Quem</h2>
          <p>Escute a pergunta e descubra: jornalistas ou jogadores e times.</p>
          <strong>JOGAR AGORA <span>→</span></strong>
        </div>
      </a>

      <a class="game-card syllables-card" href="/silabas/">
        <span class="status available">DISPONÍVEL</span>
        <div class="syllables-illustration" aria-hidden="true">
          <span class="syllable-block">SI</span>
          <span class="plus">+</span>
          <span class="syllable-block second">LA</span>
          <span class="word-result">SÍLABA!</span>
        </div>
        <div class="card-copy">
          <span class="game-number">JOGO 03</span>
          <h2>Sílabas</h2>
          <p>Escolha os sons certos, complete palavras e avance pelos conjuntos.</p>
          <strong>JOGAR AGORA <span>→</span></strong>
        </div>
      </a>

      <a class="game-card explorador-card" href="/metro-explorador/">
        <span class="status available">DISPONÍVEL</span>
        <div class="explorador-illustration" aria-hidden="true">
          <div class="platform-strip-mini"></div>
          <div class="turnstile-mini"><span></span><span></span></div>
          <div class="walker-mini"><i></i><b></b></div>
        </div>
        <div class="card-copy">
          <span class="game-number">JOGO 04</span>
          <h2>Metrô<br>Explorador</h2>
          <p>Ande pela estação, valide o bilhete e embarque no trem até o destino.</p>
          <strong>JOGAR AGORA <span>→</span></strong>
        </div>
      </a>

      <a class="game-card memory-card-tile" href="/jogo-da-memoria/">
        <span class="status available">DISPONÍVEL</span>
        <div class="memory-illustration" aria-hidden="true">
          <div class="mini-card flipped"><span>🚈</span></div>
          <div class="mini-card"><span>?</span></div>
          <div class="mini-card flipped"><span>🚈</span></div>
        </div>
        <div class="card-copy">
          <span class="game-number">JOGO 05</span>
          <h2>Jogo da<br>Memória</h2>
          <p>Vire as cartas e encontre os pares de trens e companhias.</p>
          <strong>JOGAR AGORA <span>→</span></strong>
        </div>
      </a>
    </section>

    <footer>Três mundos, muitas descobertas.</footer>
  </main>
`;
