# VivahGo — Agent Notes

## Repo shape

- `vivahgo/` — React + Vite + Tailwind app (Capacitor iOS). Also contains the local Express API in `vivahgo/server/`.
- `api/` — Vercel serverless routes (`auth`, `planner`, `vendors`, `careers`, `subscription`, `admin`, `media`, `system`).
- `api-handlers/`, `cloudflare/`, `config/`, `scripts/`, `test/` — supporting layers.

## Setup

`node_modules` is not checked in and is **not** installed by default in either package. Install both:

```bash
npm install
(cd vivahgo && npm install)
```

The root mocha suite resolves some modules out of the app's tree (`vivahgo/node_modules/react`, `react-dom/client`). Without the second install it dies with `MODULE_NOT_FOUND` before running a single test.

## Two test suites — pick the cheap one

| Command | Runtime | Scope |
|---|---|---|
| `npm test` (root) | ~3s | Mocha over `test/**/*.test.cjs`. 247 passing, 5 pending. |
| `cd vivahgo && npm test` | ~6.5min | Vitest + Testing Library for app components. |

Root `npm test` is fast enough to run freely. The vitest suite is slow — scope it to a single file whenever you can:

```bash
cd vivahgo && npx vitest run src/features/planner/PlannerShell.test.jsx
```

Coverage gate lives at the root: `npm run test:coverage`, `npm run coverage:check` (90% statements).

## Known failure

`vivahgo/src/features/planner/PlannerShell.test.jsx` — `"opens the demo planner from the splash screen CTA"` fails: no button named `Open My Planner ✨`.

Not yet diagnosed. The `SplashScreen` CTA is chosen by `showSkip={store.requiresOnboarding}` (`PlannerShell.jsx`), but the splash only renders when `resolvePlannerScreen` returns `"splash"`, which only happens when onboarding is required — so `showSkip` is always `true` there and the `Open My Planner ✨` branch in `SplashScreen.jsx` looks unreachable. Someone opened demo login, `createDemoPlanner()` already has a wedding profile, `shouldShowOnboarding` returns false, and the shell lands on `"app"` directly. Decide whether splash should be reachable again or the test should target the `Start My Setup ✨` path.

That file also OOMs its vitest worker (V8 heap exhaustion around 4 GB) and hangs on "Timeout terminating forks worker", which is most of the 6.5 min runtime.

## Conventions

- Serverless handlers are plain CJS in `api/`, mounted via `vercel.json`.
- The app is ESM (`vivahgo/package.json` has `"type": "module"`).
- Lint with `npm run lint` (delegates to `eslint` in `vivahgo/`).