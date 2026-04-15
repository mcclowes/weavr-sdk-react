# Holistic code review: weavr-sdk-react

**Reviewer:** Incoming principal engineer
**Date:** 2026-04-15
**Scope:** Entire repository at HEAD (commit `33630e2`)
**Intended audience:** The team — particularly more junior engineers who want to level up

---

## TL;DR

This is a *fine* first cut of a React wrapper for the Weavr secure-components SDK. It is not yet a production-grade fintech SDK. The TypeScript is clean, the public API is sensibly shaped, and the iframe-isolation security model is inherited correctly. But the moment you scratch the surface, you find **~99% of the code is untested**, **React 18 Strict Mode will tear components apart**, **callbacks sit in `useEffect` dependency arrays causing phantom re-initialisations**, **there is no SSR guard in a package whose consumers are overwhelmingly Next.js shops**, and **a dozen silent `catch {}` blocks are busy hiding resource leaks from you**.

If you ship this to customers who handle card data at scale, you will eventually get a 2am page that is very hard to debug — not because the bug is subtle, but because the SDK is allergic to leaving evidence.

The rest of this document walks through *why* I think that, with file:line citations, and — importantly — what each issue should **teach** a more junior engineer about building libraries.

---

## 1. Architecture and shape of the codebase

**What this package is:** a thin React binding over Weavr's vanilla JS `OpcUxSecureClient`, exposing secure iframe-based inputs (`SecureInput`, `SecureSpan`), a form hook (`useSecureForm`), token association helpers (`useAssociate`, `useSetUserToken`, `useAssociatedClient`), a `WeavrProvider` context, a theme system, and three verification flow components (`KYC`, `KYB`, `ConsumerKYC`).

~3,750 LOC. 5 components, 4 hooks, 2 contexts, 1 theme module, 1 types file.

### What's good
- Clean separation: `components/`, `hooks/`, `client.ts`, `context.tsx`, `theme.ts`, `types.ts`. A new reader can orient quickly.
- Zero runtime dependencies beyond the React peer — appropriate for a wrapper SDK.
- Dual ESM/CJS build via `tsup`, with `.d.ts` emitted. Treeshakeable.
- `tsconfig.json` is strict (`strict: true`, `isolatedModules`, `forceConsistentCasingInFileNames`). Good hygiene.

### What's wrong
- **Two parallel "configure Weavr" entry points.** `client.ts:63` (`initWeavr`) uses module-level singletons (`scriptLoadPromise`, `clientInitialized`) and `context.tsx:34` re-invokes it from a provider. The module-level state means behaviour leaks across React trees, Storybook stories, and tests. Re-mounting `WeavrProvider` does **not** reset the client. That is a surprising and undocumented invariant.
- **`client.ts` hardcodes the loading strategy.** It assumes `document.head`, a single global, and a single environment. There is no hook point to inject a pre-loaded SDK (useful for tests, micro-frontends, or CSP-locked apps).
- **No abstraction boundary between "our SDK" and "Weavr's SDK".** The types file (`types.ts`) mirrors Weavr's API surface, and components call into it directly. The day Weavr ships a breaking change to `OpcUxSecureClient`, every component file needs touching.

> **Lesson for juniors:** When you wrap a third-party SDK, give yourself one place where the vendor's surface enters your code — an adapter. It costs you 50 lines today and saves you a week when the vendor ships a v2.

---

## 2. Type safety — good on paper, thin in practice

`grep -r "any" src/` returns zero hits in application code. Hats off.

But strict typing is not the same as **useful** typing:

- `types.ts:221` uses `payload: unknown` for `KYBMessage`/`KYCMessage`/`ConsumerKYCMessage`. That pushes the validation burden onto every consumer, and since the step-change callback names are string unions (`'step_changed' | 'completed' | 'closed' | 'error'`), you cannot discriminate the payload type via a switch. These should be **discriminated unions**: `type KYCMessage = { type: 'step_changed'; payload: StepPayload } | { type: 'error'; payload: ErrorPayload } | ...`. That is exactly what TS unions exist for.
- `SecureForm.tokenize` returns `Record<string, string>` (`types.ts:129`). A caller has no compile-time guarantee which keys exist. The SDK knows which fields were registered via `createInput(name, ...)` — that name list could be typed.
- `types.ts:203–212` defines `DisplayModule` and `SpanOptions` that are **never imported anywhere**. Dead types rot; delete them.
- No branded types for obviously-distinct strings: `authToken`, `accessToken`, `reference`, `uiKey`. A junior engineer will pass them in the wrong order one day and TypeScript will cheerfully let them.

> **Lesson for juniors:** `strict: true` prevents bugs of the form "I forgot a type". It does not prevent bugs of the form "I typed the wrong thing". Discriminated unions and branded nominal types are how you move from "compiles" to "correct".

---

## 3. React: the bit that will bite you

This is the section I would make required reading for anyone shipping their first React library.

### 3.1 Callbacks in `useEffect` dependency arrays

`components/KYC.tsx:90`:
```ts
}, [client, isAssociated, auth, mergedConfig, onComplete, onClose, onError, onStepChange]);
```

Same pattern at `KYB.tsx:146`. Here is what happens in the wild:

1. Consumer writes `<KYC onComplete={(data) => setResult(data)} />`.
2. Every render of the parent creates a **new function identity** for `onComplete`.
3. The effect fires on every render — *except* the body is guarded by `initializedRef.current`, so nothing happens.
4. Net result: the effect is doing nothing useful, but it is also masking a real bug — **when `auth` actually changes, the `initializedRef` guard prevents re-initialisation**. Customers rotating auth tokens will silently run on stale state.

Fix: hoist callbacks to a ref (the same pattern used correctly in `SecureInput.tsx:81–83`), and make the effect's dependency list the *data* that should trigger re-init.

> **Lesson for juniors:** If an effect depends on a callback, either (a) memoise the callback at the call site (painful), or (b) store the callback in a ref and read `ref.current` inside the effect (pragmatic). Never include a "parent-provided function" in a dependency array without thinking about it.

### 3.2 Strict Mode will double-mount you

`SecureInput.tsx:190–204` and `SecureSpan.tsx:115–124` synchronously `destroy()` on cleanup and re-create on mount. React 18 Strict Mode in development intentionally does mount → cleanup → mount. Weavr iframes are expensive network-bound resources. This will:
- Flash "Loading…" twice.
- Potentially confuse Weavr's server-side session state.
- Leak resources if `destroy()` is async-in-disguise and the second mount races the first teardown.

Worse, the try/catch around `destroy` swallows the error (`SecureInput.tsx:193–195, 199`), so when this does fail in production you will never know.

### 3.3 Memoisation shaped like a pipe bomb

`SecureInput.tsx:125`:
```ts
}, [options, useTheme, themeContext, styleOverrides]);
```

`options` is a consumer-provided object. If the consumer writes `<SecureInput options={{ placeholder: 'PIN' }} />` — a completely normal thing to write — the `options` reference changes on every render, so the memo never hits. Line 128 attempts to paper over this with `JSON.stringify(options)` as `optionsKey`, but that key is only used to key a child, not to stabilise the memo itself.

Either serialise inside `useMemo`, or document "pass a stable object reference" loudly — but don't do both halfway.

### 3.4 Auto-prepending `"Bearer "`

`hooks/useAssociatedClient.ts:28` prepends `"Bearer "` unconditionally. What if the consumer already prepended it? What if they are using a different auth scheme? This is the kind of "helpful" magic that becomes a 30-minute support ticket the first time it's wrong.

### 3.5 `useSecureForm` returns a form handle nobody uses

`hooks/useSecureForm.ts:62` returns `form: getForm()` alongside `tokenize`, `createInput`, etc. Nothing in the codebase consumes `.form`. It is an escape hatch that lets callers bypass the hook and call raw Weavr methods. Either document it as an escape hatch **with the contract** ("do not call `destroy()` on this, the hook owns lifecycle"), or delete it.

---

## 4. Error handling and edge cases

A library's character is revealed by how it behaves when things go wrong. This library goes quiet.

### 4.1 Silent catches
`SecureInput.tsx:193–195`, `SecureInput.tsx:199`, `SecureSpan.tsx:115–124`:
```ts
try { elementRef.current?.destroy(); } catch {}
```

This is the single worst pattern in the codebase. If Weavr's `destroy` throws, that is a **bug** you want to see, not hide. At minimum: `console.error`. Better: surface it via the context's `error` state, or expose an `onError` callback.

> **Lesson for juniors:** `catch {}` is almost never what you want. If you genuinely don't care about the error, write `catch (err) { /* intentionally ignored: reason */ }` with the reason. If you can't articulate the reason, you care.

### 4.2 No timeout on promise-wrapped callbacks
`client.ts:82–94` wraps Weavr's callback API in a `Promise`. Nothing guarantees Weavr's callback ever fires. A network hiccup or a protocol change, and your consumer is `await`ing forever. Every callback-to-promise wrapper needs a timeout.

### 4.3 No retry on script load failure
`client.ts:27`: `script.onerror` rejects with a generic message. A transient DNS blip on `secure.weavr.io` means the entire SDK is dead until the user reloads. For a fintech component embedded in checkout flows, that is a conversion disaster.

### 4.4 Setting state on unmounted components
`hooks/useAssociatedClient.ts:22–40`: `client.associate` is callback-based. If the component unmounts between invocation and callback, you call `setState` on a dead component. React 18 warns in dev; in prod it leaks the closure. Add a mounted-ref or an AbortController pattern.

### 4.5 Init success flag that never accounts for failure
`client.ts:74`: `clientInitialized` is a boolean. If `client.init()` throws, the flag is never flipped — but the `scriptLoadPromise` *is* resolved, so the *next* mount will skip re-loading the script but also fail at `getWeavrClient()`. You need a proper state machine: `'idle' | 'loading' | 'ready' | 'failed'`, and a way to transition `'failed' → 'loading'`.

### 4.6 No SSR guard
This is the one that will bite *hardest*. `client.ts:24` touches `document.head`. `client.ts:47` touches `window`. The package has no `"use client"` directive in any file, no `typeof window` guards, and no `"browser"` field in `package.json`. The overwhelming majority of React consumers are on Next.js App Router, and they will see a server crash on first render. Either:
- Add `"use client"` to every component file, **or**
- Guard all `window`/`document` access and defer to `useEffect`, **and**
- Document SSR behaviour in the README.

### 4.7 Token expiry is nobody's problem
`useAssociatedClient` associates once and never again. When Weavr invalidates the session, the next tokenize call fails at runtime with no recovery path. The SDK should at minimum expose a `reassociate()` method and document expected token lifetime.

### 4.8 Stale `containerRef`
`SecureInput.tsx:149` checks `containerRef.current` but if the parent tears down and re-attaches the node, the ref may point at a detached node. Callback refs with `isConnected` checks are the correct idiom.

---

## 5. Testing — the elephant in the room

Three test files. 47 lines. `setup.ts`, `types.test.ts` (a TS-compiles-smoke-test), and `client.test.ts`. **Zero component tests. Zero hook tests. Zero theme tests.** `theme.ts` alone is 662 lines of untested branching logic.

The existing `client.test.ts` tests verify that mocked callbacks are called — they do not verify behaviour through the promise wrapper, they do not verify error translation, and they do not verify cleanup.

There is no `test:coverage` script, no coverage threshold in `vitest.config.ts`, and CI does not enforce coverage. You cannot detect regressions you can't measure.

**Minimum bar before this should be trusted in production:**
1. Component render tests using `@testing-library/react` (already a dep implicitly via React).
2. Hook tests for lifecycle (`useAssociatedClient` under unmount-during-associate, `useSecureForm` under provider absence).
3. Integration tests for `WeavrProvider` under Strict Mode (`<StrictMode><WeavrProvider /></StrictMode>`).
4. `theme.ts` table-driven tests for `themeToKycCss` — it's a pure function; there is no excuse.
5. A coverage gate in CI at a realistic number (70%+).

> **Lesson for juniors:** A green CI that runs tests covering 1% of the code is worse than no CI. It produces false confidence. When you add tests, add coverage reporting in the same PR.

---

## 6. Security

The iframe-isolation model is inherited from Weavr and correctly left alone — no `dangerouslySetInnerHTML`, no `eval`, no raw value touching JS. That is the big one, and it's right.

Things that should still worry you:

- **CSS injection via theme** (`theme.ts:485–540`). `themeToKycCss` interpolates theme values into a CSS string with no sanitisation. Today, theme values come from code and the risk is nil. The day someone ships a "let users customise their checkout theme" feature, this is a vector. Escape now, not later.
- **No Subresource Integrity** on the injected `<script>` tag (`client.ts:24`). Weavr could, in principle, ship compromised JS; SRI is the belt-and-braces defence.
- **No origin validation assumed.** This SDK delegates postMessage handling to Weavr. Fine — but the README should say so and tell consumers what CSP `frame-src` entries they need.
- **Token handling by prop only** is correct (tokens aren't persisted by the SDK), but the README doesn't warn consumers against logging or storing them. For a fintech SDK, that warning belongs on page one.

---

## 7. Accessibility — effectively absent

For a component library that will appear in checkout flows (i.e. places that are legally required to be accessible in many jurisdictions):

- **No ARIA labels** on `SecureInput` or `SecureSpan`. Iframes cannot be labelled by `<label for>`, so you **must** accept and forward an `aria-label` prop. Today, screen reader users hit a "frame" with no idea what it is.
- **Error states are a `<div>` with red text.** No `role="alert"`, no `aria-live`. (`SecureInput.tsx:217`, `SecureSpan.tsx:136`, `KYC.tsx:94`, `KYB.tsx:150`.)
- **Loading states are unannounced.** Add `role="status" aria-live="polite"`.
- **Theme colours have no contrast validation.** `lightTheme.textPlaceholder: '#9ca3af'` on white background fails WCAG AA. Themes that ship with a library *must* meet AA by default.
- **No focus-visible indicators** documented on the manual verify button (`KYB.tsx:168–175`).

This isn't nice-to-have. An EU customer integrating this into a regulated product will fail an audit.

---

## 8. API surface — inconsistent naming

- `SecureInput` takes `options`; `SecureSpan` takes `weavrStyle` + `styleOverrides`; `KYC`/`KYB` take `config`. Three different names for "the thing you pass to the underlying Weavr SDK".
- Event callbacks diverge: `SecureInput` has `onChange/onFocus/onBlur/onKeyUp/onStrength/onReady`; `SecureSpan` has only `onChange/onReady` (no focus/blur); `KYC` uses verbs from a different family (`onComplete/onClose/onError/onStepChange`).
- `useAssociate` vs `useSetUserToken` are near-identical hooks with a one-word difference in behaviour. A junior engineer reading the exports will not know which to pick. Either merge them into one hook with a mode flag, or document the distinction in a single paragraph.

> **Lesson for juniors:** Naming is load-bearing. A good library feels like it was designed by one person. If you add a component that takes `config` and the existing sibling takes `options`, pick one and refactor the other in the same PR.

---

## 9. Documentation drift — red flags for a 1.0.0

- `package.json` says `"version": "1.0.0"`. `CHANGELOG.md` tops out at `## [0.1.0] - 2024-01-01` with an "Unreleased" section describing features that are already shipped. The changelog has never been maintained. Tagging a 1.0 without a corresponding changelog entry is, for library users, a trust-destroying event.
- `README.md:106` documents a `showStrength={true}` prop that does not exist. The actual mechanism is `type="password"` + an `onStrength` callback.
- `README.md:29` shows `useSecureForm` returning `{ tokenize, isReady }`; the actual return is `{ form, createInput, tokenize, destroy, isReady }`.
- Storybook stories (`SecureInput.stories.tsx:57`) present `placeholder` as a top-level prop; it lives under `options.placeholder`.
- `CONTRIBUTING.md` does not mention coverage expectations or that tests must accompany new components.

---

## 10. Build, CI, tooling

Mostly competent:
- `ci.yml`: typecheck + lint + test + build on push/PR. Good.
- `publish.yml`: uses `--provenance` and `--access public`. Good.
- `husky` + `lint-staged`. Good.
- `.eslintrc.json` has `react-hooks/exhaustive-deps: warn` and `@typescript-eslint/no-explicit-any: warn`. Both should be `error` in a library. A warning that nobody reads is not a rule.

Missing:
- Coverage gate.
- `format:check` in CI (so unformatted code *can* land if `lint-staged` is bypassed).
- No bundle size check. For a published npm package this is table stakes — use `size-limit` or `bundlewatch`.
- No automated publishing to a preview tag per PR (pkg.pr.new / preview-release) so consumers can't try the branch.

---

## 11. Dead code and inconsistencies

- `types.ts:203–212`: `DisplayModule`, `SpanOptions` — unused, delete.
- `CHANGELOG.md` at `0.1.0` vs package at `1.0.0`.
- README examples that don't match the API (see §9).
- `useAssociate` vs `useSetUserToken` functional overlap (see §8).

---

## 12. Edge cases the team likely hasn't considered

A non-exhaustive list:
1. **Two `SecureInput`s with the same `name` in the same form.** What happens? Does the second silently overwrite the first? No test covers this.
2. **A consumer unmounting `WeavrProvider` mid-association.** Module-level `clientInitialized` says "yes"; the next mount inherits half-initialised state.
3. **`tokenize()` called before `isReady`.** Does it throw, reject, or hang?
4. **`auth` prop changing on an already-mounted `KYC`.** The `initializedRef` guard (§3.1) swallows this.
5. **Concurrent tokenize calls.** The SDK exposes `tokenize` on a single form — is it re-entrant?
6. **Theme swap at runtime.** `theme.ts` computes CSS once per `useMemo`; will already-mounted iframes re-theme?
7. **Browser back-button mid-KYC.** Does the iframe clean up? Does the session state resync?
8. **Next.js App Router + Suspense boundary suspending mid-init.** The Promise in `client.ts` will be resumed; the React tree may not be.
9. **React 19's async transitions** wrapping an `initWeavr` call.
10. **Multiple instances of this SDK loaded in the same page** (e.g. micro-frontends). The `window.OpcUxSecureClient` singleton will be shared — intentional? Documented? Tested? None of the above.

---

## 13. Prioritised action list

**Must-fix before any more customers adopt this:**
1. Add SSR guards or `"use client"` pragmas; document SSR behaviour.
2. Remove silent `catch {}` blocks; surface errors through `onError` callbacks and/or provider state.
3. Fix the callback-in-deps pattern in `KYC`/`KYB` (move to refs, make auth-change re-init actually work).
4. Add Strict Mode tests; fix the double-mount tear-down race.
5. Add timeouts to every callback→promise wrapper.
6. Write component and hook tests; add coverage gate ≥70%.

**Should-fix this quarter:**
7. Unify prop/event naming across `SecureInput`/`SecureSpan`/`KYC`/`KYB`.
8. Add `aria-label` prop and `role="alert"`/`role="status"` semantics.
9. Sync README, CHANGELOG, Storybook with the actual API.
10. Tighten ESLint `warn`s to `error`s.
11. Build a proper state machine around `initWeavr` so failure is recoverable.
12. Adapter layer between this SDK and Weavr's vanilla client (§1).

**Nice-to-have:**
13. Discriminated unions for message payloads.
14. Branded token types.
15. Bundle-size budget in CI.
16. Contrast-checked theme defaults.

---

## 14. What the team should take away

If I could put three things on a poster for the next engineer joining this codebase:

1. **Libraries are not apps.** In an app, a `catch {}` is a pragmatic bodge. In a library that lives in thousands of other apps, it is an obligation to debug at a distance — which means loud, structured, optional-to-surface errors. Never swallow.
2. **Your `useEffect` dependency array is a contract.** Parent-provided callbacks don't belong in it. When you write one, ask: "what piece of *data* should cause this to re-run?" — and list only that.
3. **Tests buy you the right to move fast later.** Every untested branch is a future incident. The bar isn't "100% coverage" — it's "every behaviour a consumer could rely on is pinned by a test". Right now, almost nothing is.

This codebase has good bones. With a disciplined quarter, it becomes a solid 1.0. Without one, the `1.0.0` tag is writing cheques the code can't cash.
