# Manual Validation Checklist

Steps that need a human + browser to complete. Check these off before considering the
foundation "done." Until every item is checked, this file should be flagged before commits.

## Status: INCOMPLETE

---

## 1. Unit + component tests (automated — verify locally)
- [ ] `npm run test:run` — all 20 tests pass

## 2. Lint (automated)
- [ ] `npm run lint` — exits 0 (warnings for context file + test-utils are expected)

## 3. E2E: fake-auth flow (Playwright)
- [ ] `npm run test:e2e` — all 3 specs pass
  - app boots → fake auth → home shows "Dev User"
  - sign out redirects to /login
  - sign in from /login navigates home

## 4. PWA validation (Chrome DevTools, requires preview build)
```bash
npm run build && npm run preview
# open http://localhost:4173 in Chrome
```
- [ ] DevTools → Application → **Manifest**: installable verdict, name = "Budget", icons shown
- [ ] DevTools → Application → **Service Workers**: SW registered and activated
- [ ] DevTools → Network → check **Offline**, then reload → app still loads (Workbox precache)
- [ ] Navigate to `http://localhost:4173/auth/callback` → SW does **not** serve cached index.html
  (confirm in Network tab: no SW intercept on that path)

## 5. Dev server: fake auth flow (visual)
```bash
npm run dev
# open http://localhost:5173
```
- [ ] App loads directly into the home route as "Dev User" (no login prompt)
- [ ] Sign out → redirected to /login
- [ ] Sign in → back to home

## 6. Dev server: local Supabase (requires Docker + Supabase CLI)
```bash
brew install supabase/tap/supabase   # if not installed
supabase start
# update .env.local:
#   VITE_USE_FAKE_AUTH=false
#   VITE_USE_FAKE_DATA=false
npm run dev
```
- [ ] App redirects to /login (no fake session)
- [ ] "Sign in with Google" button visible
- [ ] (Can skip Google OAuth for now — see item 7)

## 7. Real Google SSO (deferred — requires credentials)
Prerequisites:
1. Google Cloud OAuth client
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:54321/auth/v1/callback`
2. Supabase cloud project with Google provider configured
3. Production `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` set

- [ ] Sign in with real Google account end-to-end
- [ ] Transaction persists to Postgres after add
- [ ] Sign out clears session

## 8. Production bundle: no fake code leaked
```bash
npm run build
grep -r "fake-user-1" dist/   # must return nothing
```
- [ ] Confirmed: fake adapter code absent from dist/

---

## Done?
When all boxes are checked, delete this file and remove the memory reminder.
