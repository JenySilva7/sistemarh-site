# Sistema de RH com Dashboard

Aplicação web de gestão de RH com dashboard, construída com React, TypeScript, Vite, Tailwind CSS, Radix UI e Material UI. O design original está disponível no Figma: https://www.figma.com/design/D6DdaFhYgZbRYwbwLZUNJK/Sistema-de-RH-com-Dashboard.

## Pré-requisitos

- **Node.js** 18 ou superior (recomendado 20+)
- **npm** 9+ (ou `pnpm` / `yarn`, se preferir)

Verifique as versões instaladas:

```bash
node -v
npm -v
```

## Instalação

1. Abra o terminal na pasta raiz do projeto:

   ```bash
   cd "Sistema de RH com Dashboard"
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

   > Se preferir usar `pnpm` (o projeto inclui `pnpm-workspace.yaml`):
   >
   > ```bash
   > pnpm install
   > ```

## Rodando em modo de desenvolvimento

Inicie o servidor de desenvolvimento do Vite:

```bash
npm run dev
```

Por padrão, a aplicação ficará disponível em **http://localhost:5173**. O Vite recarrega automaticamente a página ao detectar alterações nos arquivos.

## Build de produção

Para gerar a versão otimizada do projeto:

```bash
npm run build
```

Os arquivos finais serão gerados na pasta `dist/`.

Para visualizar localmente o build de produção:

```bash
npx vite preview
```

## Estrutura do projeto

```
.
├── index.html                # Ponto de entrada HTML
├── package.json              # Dependências e scripts
├── vite.config.ts            # Configuração do Vite
├── postcss.config.mjs        # Configuração do PostCSS
├── default_shadcn_theme.css  # Tema base shadcn/ui
├── guidelines/               # Diretrizes de design/projeto
└── src/
    ├── main.tsx              # Bootstrap do React
    ├── app/
    │   ├── App.tsx           # Componente raiz
    │   └── components/       # Componentes da aplicação
    └── styles/
        ├── fonts.css
        ├── index.css
        ├── tailwind.css
        └── theme.css
```

## Scripts disponíveis

| Comando         | Descrição                                            |
| --------------- | ---------------------------------------------------- |
| `npm run dev`   | Inicia o servidor de desenvolvimento (Vite + HMR).   |
| `npm run build` | Gera o build de produção em `dist/`.                 |

## Tecnologias principais

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 6](https://vitejs.dev/) (bundler / dev server)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/) e [shadcn/ui](https://ui.shadcn.com/)
- [Material UI 7](https://mui.com/)
- [Recharts](https://recharts.org/) para gráficos do dashboard
- [React Router 7](https://reactrouter.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Lucide](https://lucide.dev/) (ícones)

## Solução de problemas

- **Porta 5173 ocupada:** rode `npm run dev -- --port 3000` para usar outra porta.
- **Erros após atualizar dependências:** apague `node_modules` e `package-lock.json` e rode `npm install` novamente.
- **Cache do Vite:** se algo parecer "preso", apague a pasta `node_modules/.vite` e reinicie o `npm run dev`.
