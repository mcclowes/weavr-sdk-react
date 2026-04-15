# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

`weavr-sdk-react` — React wrapper around Weavr's Secure UI client script. Publishes dual CJS/ESM from `src/` via tsup. Consumers get tokenized secure inputs, secure span displays, and KYC/KYB flows without raw sensitive data touching their app.

## Stack

- TypeScript, React 17+ (peer dep)
- Build: tsup → `dist/`
- Tests: Vitest + Testing Library + jsdom
- Lint/format: ESLint + Prettier, enforced via Husky + lint-staged
- Storybook for component dev
- No framework (not Next.js) — this is a library, not an app

## Layout

```
src/
  client.ts            # Loads Weavr secure client script, init/associate/setToken
  context.tsx          # WeavrProvider + useWeavr / useWeavrClient
  themeContext.tsx     # WeavrThemeProvider + theme hooks
  theme.ts             # lightTheme, darkTheme, createTheme, style converters
  types.ts             # All shared types incl. Weavr client surface
  hooks/               # useSecureForm, useAssociate, useSetUserToken, useAssociatedClient
  components/          # SecureInput, SecureSpan, KYB, KYC, ConsumerKYC
  stories/             # Storybook
  __tests__/           # Vitest tests
```

Public API is `src/index.ts` — anything consumers use must be re-exported there.

## Commands

```bash
npm run build          # tsup production build
npm run dev            # tsup watch
npm run test           # vitest watch
npm run test:run       # vitest single run
npm run typecheck      # tsc --noEmit
npm run lint           # eslint src
npm run lint:fix
npm run format         # prettier write
npm run storybook      # storybook on :6006
```

## Conventions

- Tests live alongside implementation in `__tests__/`; prefer TDD for new logic.
- Keep the `src/index.ts` export surface tight — don't export internals.
- Components should support both explicit style props and theme-driven styles via `useOptionalWeavrTheme`. Fall back gracefully when no theme provider is present.
- Secure elements must never expose raw values — only tokens. Don't add APIs that return raw input data.
- The Weavr client script is loaded once per `uiKey`/`environment`/`customScriptUrl` tuple; reuse existing load logic in `client.ts` rather than adding parallel loaders.
- ConsumerKYC takes flat props (`lang`, `customCss`, `customCssStr`), while KYC/KYB take `{ auth, options }`. Don't unify these without intent — they wrap different Weavr endpoints.

## Workflow

- Track work in GitHub issues (repo: `mcclowes/weavr-sdk-react`). Reference `Fixes #N` in PR bodies.
- Before committing: lint-staged runs eslint + prettier automatically via Husky. Don't bypass with `--no-verify`.
- Update `CHANGELOG.md` under `[Unreleased]` for user-visible changes.
- Keep README component/hook docs in sync with actual exports and prop shapes.

## Gotchas

- `useSecureForm().createInput(name, type, options?)` — three args, not an options bag.
- Ref type is `SecureInputRef`, not `SecureInputHandle`.
- `SecureSpan` and KYC/KYB need `associate()` called first (stepped-up auth). `useAssociatedClient` bundles this.
- Peer deps: both `react` AND `react-dom` ≥ 17.
