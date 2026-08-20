# Estação de Jogos

Portal de jogos que reúne experiências simples, acessíveis e com poucos controles.

## Jogos

- **Metrô Aventura** — disponível em `/metro-aventura/`.
- **Quem é Quem** — jogo de adivinhação visual e falado em `/quem-e-quem/`, com os temas Jornalistas e Jogadores e Times.
- **Sílabas** — oficina de palavras organizada em seis conjuntos em `/silabas/`.

A raiz `/` apresenta todos os jogos disponíveis.

## Organização

```text
src/
├── main.ts                 # direciona cada URL para seu jogo
├── portal/                 # tela inicial com o catálogo
└── games/
    ├── metro-aventura/     # jogo completo do metrô
    ├── quem-e-quem/        # jogo de adivinhação (jornalistas, jogadores e times)
    └── silabas/            # jogo de leitura oral e conjuntos silábicos

public/games/
└── metro-aventura/img/     # imagens exclusivas do jogo
```

## Requisitos

- Node.js 22
- npm

## Executar localmente

```bash
npm install
npm run dev
```

Abra o endereço exibido pelo Vite, normalmente `http://localhost:5173`. O portal
permite entrar em cada jogo; as URLs dedicadas também funcionam diretamente.

## Testes

```bash
npm test
```

## Build de produção

```bash
npm run build
```

O resultado é gerado em `dist/`. Essa pasta não deve ser versionada.

## Publicar no Netlify

### Integração com Git

- Build command: `npm run build`
- Publish directory: `dist`

O arquivo `netlify.toml` já contém essas configurações.

### Publicação manual

Execute `npm run build` e arraste a pasta `dist/` para o Netlify Drop.

## Configurar lados de desembarque

Edite `platformSides` em `src/games/metro-aventura/data.ts`:

```ts
"Sé": "right" // lado direito
"Luz": "left" // lado esquerdo
```

Cada estação precisa usar `right` ou `left`.

## Conteúdo estático

As imagens do Metrô Aventura ficam em `public/games/metro-aventura/img/`.
Durante o build, o Vite preserva essa estrutura dentro de `dist/`.

Antes de uma publicação pública, confirme as permissões de uso das fotografias e demais materiais de referência.
