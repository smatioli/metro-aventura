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

      <a class="game-card news-card" href="/jornalistas/">
        <span class="status available">DISPONÍVEL</span>
        <div class="news-illustration" aria-hidden="true">
          <div class="press-card"><span>IMPRENSA</span><b>J</b></div>
          <div class="microphone"></div>
          <div class="signal">)))</div>
        </div>
        <div class="card-copy">
          <span class="game-number">JOGO 02</span>
          <h2>Jornalistas</h2>
          <p>Escute a pergunta e encontre quem apresenta cada jornal.</p>
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
    </section>

    <footer>Três mundos, muitas descobertas.</footer>
  </main>
`;
