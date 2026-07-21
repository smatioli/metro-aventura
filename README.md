# Metrô Aventura

Jogo web simples sobre as linhas 1-Azul, 2-Verde e 3-Vermelha do Metrô de São Paulo. A experiência foi projetada para funcionar com poucos controles, ritmo tranquilo e instruções visuais.

## Requisitos

- Node.js 22
- npm

## Executar localmente

```bash
npm install
npm run dev
```

Abra o endereço exibido pelo Vite, normalmente `http://localhost:5173`.

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

Edite `platformSides` em `src/data.ts`:

```ts
"Sé": "right" // lado direito
"Luz": "left" // lado esquerdo
```

Cada estação precisa usar `right` ou `left`.

## Conteúdo estático

As imagens ficam em `public/img/`. Durante o build, o Vite as copia para `dist/img/`.

Antes de uma publicação pública, confirme as permissões de uso das fotografias e demais materiais de referência.

