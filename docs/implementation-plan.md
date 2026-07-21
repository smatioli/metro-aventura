# Proposta de implementação

## Conceito

Jogo 2D para navegador, sem leitura obrigatória, derrota ou cronômetro. O jogador escolhe linha, sentido e frota; observa uma viagem completa e opera as portas em cada estação.

## Fluxo de telas

1. **Início:** continuar viagem salva ou iniciar outra.
2. **Linha:** três cartões grandes nas cores azul, verde e vermelha.
3. **Sentido:** dois trens apontando para terminais opostos, com destino falado.
4. **Frota:** cartões filtrados pela linha, com imagem frontal e nome falado.
5. **Viagem:** vistas de cabine, interior e lateral, alternadas com `↑` e `↓`.
6. **Parada:** vista lateral fixa; `Espaço` abre e depois fecha as portas.
7. **Terminal:** celebração calma; repetir ou escolher outra linha.

## Controles

| Tecla | Ação |
|---|---|
| `←` / `→` | mover a seleção em menus |
| `↑` / `↓` | trocar a perspectiva durante o deslocamento |
| `Espaço` | confirmar, abrir portas ou fechar portas |

Cada tela mostra desenhos das teclas disponíveis. Uma mão animada demonstra o comando quando o jogador aguarda, sem mover a seleção nem executar a ação por ele.

## Máquina de estados da viagem

```text
APROXIMANDO
  → CHEGANDO
  → PARADO_PORTAS_FECHADAS
  → PORTAS_ABRINDO
  → EMBARQUE
  → PORTAS_ABERTAS
  → PORTAS_FECHANDO
  → PRONTO_PARA_PARTIR
  → VIAJANDO
```

Somente `PARADO_PORTAS_FECHADAS` aceita o comando de abrir. Somente `PORTAS_ABERTAS`, depois da animação de passageiros, aceita o comando de fechar. Entradas fora de contexto são ignoradas sem aviso negativo.

## Arquitetura recomendada

- **TypeScript + Vite:** aplicação web pequena, rápida e instalável localmente.
- **Canvas 2D com Phaser:** animação das três vistas, trem, portas e passageiros.
- **HTML/CSS sobre o canvas:** menus, cartões, painel adulto e indicações de teclas com boa acessibilidade.
- **Web Audio API:** voz, trem e campainha em canais separados.
- **localStorage:** viagem e preferências salvas no próprio computador.
- **JSON:** linhas, estações, frotas, compatibilidades e arquivos de áudio fora da lógica do jogo.

## Modelo de dados inicial

```ts
type LineId = "1" | "2" | "3";
type FleetId = "E" | "G" | "H" | "I" | "J" | "K" | "L";

interface MetroLine {
  id: LineId;
  color: string;
  stations: Station[];
  fleetIds: FleetId[];
}

interface Station {
  id: string;
  displayName: string;
  spokenName: string;
}

interface Fleet {
  id: FleetId;
  frontImage: string;
  sideSprites?: string[];
  interiorSprites?: string[];
  cabSprites?: string[];
}
```

## Desenvolvimento em etapas

### Protótipo 1 — validar a interação (implementado)

- linhas 1, 2 e 3 com todas as estações;
- ilustração lateral configurada por frota;
- vista lateral;
- abertura e fechamento das portas;
- instruções visuais e ritmo ajustável.

O protótipo também inclui mapa completo da rota, progresso por estação, cabine fotográfica e escolha adulta de 6, 8, 12 ou 16 segundos entre estações.

### Protótipo 2 — validar a viagem

- estações completas de uma linha;
- três perspectivas;
- anúncio da estação atual e da próxima;
- escolha de sentido e salvamento automático.

### Versão de conteúdo

- linhas 1, 2 e 3 completas;
- todas as frotas da matriz aprovada;
- artes externas, internas e de cabine;
- áudio em camadas e painel adulto.

## Materiais ainda necessários

- fotos da frota H;
- fotos da frota J;
- referências laterais e das portas de cada frota;
- referências do interior e cabine de cada frota;
- definição ou gravação das vozes dos anúncios;
- teste de uso com o jogador para calibrar velocidade, pausas e volume.
