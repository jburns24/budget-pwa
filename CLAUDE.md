# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # start dev server (fake auth + data by default via .env.development)
npm run build         # tsc type-check + vite build (outputs dist/)
npm run preview       # serve dist/ locally — use this to test PWA installability
npm run lint          # oxlint (React + TypeScript rules)
npm run test          # vitest watch mode
npm run test:run      # vitest single pass
npm run test:coverage # vitest with v8 coverage report
npm run test:e2e      # playwright E2E (against dev server on :5173)
supabase start        # start local Postgres stack (Docker required; API :54321, Studio :54323)
```

## Architecture

Single-page React 19 app built with Vite 8. Uses the **ports + adapters** pattern throughout.

### Ports + adapters layout

```
src/
  domain/
    transaction.ts            # Transaction / NewTransaction types (vendor-agnostic)
  lib/
    ports/
      transaction-repository.ts   # interface: list/add/remove
      auth-port.ts                 # interface: signInWithGoogle/signOut/getSession/onAuthChange
    adapters/
      transaction-supabase.ts      # real repo (supabase-js, Postgres)
      transaction-memory.ts        # in-memory fake (TDD + dev)
      auth-supabase.ts             # real auth (Google OAuth via Supabase)
      auth-fake.ts                 # fake auth (instant test user, no network)
    supabase.ts                    # createClient(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)
    registry.ts                    # the ONE file that imports adapters and wires them by env
  auth/
    auth-context.tsx               # AuthProvider + useAuth() hook; consumes AuthPort from registry
    protected-route.tsx            # route guard — shows nothing while loading, redirects when unauthed
  routes/
    login.tsx                      # "Sign in with Google" button; redirects home if already authed
    callback.tsx                   # /auth/callback — waits for session then navigates
    home.tsx                       # protected landing; shows user + transaction list
  test/
    setup.ts                       # @testing-library/jest-dom/vitest import
    test-utils.tsx                 # custom render() wrapping MemoryRouter + AuthProvider (fake auth)
  App.tsx                          # BrowserRouter + AuthProvider + route tree
```

**Dependency rule:** `domain/`, `routes/`, `auth/` import from `lib/ports`, **never** from `lib/adapters`. Only `registry.ts` imports adapters.

### Registry and tree-shaking

`registry.ts` selects adapters via an **outer `import.meta.env.DEV` guard** (always `false` in prod builds) with an **inner `VITE_USE_FAKE_*` flag**. A bare `VITE_USE_FAKE_*` check without the outer `DEV` guard is NOT reliably tree-shaken — the `DEV` guard is mandatory. Verify with `grep -r "fake-user-1" dist/` after a prod build — should be empty.

### Adding a new backend

1. Create a new adapter in `lib/adapters/` implementing the relevant port interface.
2. Add a branch in `registry.ts` behind `import.meta.env.DEV` (or add a new env flag).
3. No other files change — callers only depend on the port interface.

## TDD workflow

**Red → green → refactor** is the standard. Write the failing test first.

- **Unit / domain tests** (`*.test.ts`) — test `InMemoryTransactionRepository` and pure domain logic directly; no render needed.
- **Component tests** (`*.test.tsx`) — use `src/test/test-utils.tsx`'s custom `render()` which wraps in `MemoryRouter` + `AuthProvider` (fake auth). Pass `{ authProvider: new FakeAuthProvider(null) }` for unauthenticated scenarios.
- **E2E tests** (`e2e/*.spec.ts`) — Playwright against the dev server; fake auth is on by default in `.env.development`.

Co-locate tests with their source (`login.tsx` → `login.test.tsx`). The in-memory repo and fake auth provider are **permanent** production-quality fakes, not throwaway stubs.

## Auth

`AuthPort` interface → `SupabaseAuthProvider` (real) or `FakeAuthProvider` (dev/test).

- `FakeAuthProvider` starts authenticated by default (`new FakeAuthProvider()`). Pass `null` for the unauthenticated state: `new FakeAuthProvider(null)`.
- `SupabaseAuthProvider.signInWithGoogle()` always passes explicit `redirectTo: window.location.origin + '/auth/callback'`. **Do not omit redirectTo** — omitting it falls back to Supabase's site URL which may not match the current origin.
- `auth-context.tsx` exports both `AuthProvider` and `useAuth()` from one file (standard pattern). The resulting oxlint fast-refresh warning is expected and benign.

### Env flags

| File | Effect |
|---|---|
| `.env.development` | `VITE_USE_FAKE_AUTH=true`, `VITE_USE_FAKE_DATA=true` — `npm run dev` uses in-memory fakes by default |
| `.env.local` | Override for local real-Supabase dev; git-ignored via `*.local` |
| `.env.production` | Flags absent — fake adapters tree-shaken by the `DEV` guard |

## PWA

After `npm run build && npm run preview`, open Chrome DevTools → Application:
- **Manifest** panel: confirms installability (name, icons, `display: standalone`)
- **Service Workers** panel: confirms SW is registered and activated
- **Network → Offline** then reload: app must still load (Workbox precache)
- **Navigate to `/auth/callback`**: the SW must NOT serve cached HTML (verified by `navigateFallbackDenylist: [/^\/auth\/callback/]` in `vite.config.ts`).

The legacy Lighthouse PWA audit category is deprecated — use the Manifest panel's installability verdict.

## Supabase local stack

Prerequisites: Docker running, Supabase CLI installed (`brew install supabase/tap/supabase`).

```bash
supabase start   # spins up API :54321, Postgres :54322, Studio :54323
supabase stop    # tear down
```

Migrations live in `supabase/migrations/`. Apply automatically on `supabase start`.

Google OAuth in local Supabase: set `SUPABASE_AUTH_GOOGLE_CLIENT_ID` and `SUPABASE_AUTH_GOOGLE_SECRET` env vars before `supabase start` (see `supabase/config.toml`).

## Manual prerequisites (deferred until real SSO is needed)

1. Create a Google Cloud OAuth client; add `http://localhost:5173` to *Authorized JavaScript origins* and `http://localhost:54321/auth/v1/callback` to *Authorized redirect URIs*.
2. Create a Supabase cloud project; configure the Google provider + allowed redirect URLs in its dashboard.
3. Set production `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (publishable anon key only — never a service-role key in a `VITE_` var).

## Committing

Commit via the `/commit` skill (`.claude/skills/commit/`), not bare `git commit` — it checks the diff for knowledge worth adding to a CLAUDE.md first.
