# ShiftPizza frontend

The frontend is a React 19 single-page application built with TypeScript, Vite 8, React Router, Axios, Tailwind CSS, and Lucide icons. It presents separate administrator and employee workspaces while keeping authorization decisions enforced by the backend.

## Responsibilities

- authenticate with CPF and password;
- persist and validate the local JWT session representation;
- redirect authenticated users away from routes for the other role;
- provide administrator screens for employees, schedules, and audit history;
- provide employee screens for the signed-in user's schedule and profile;
- format PostgreSQL civil dates without shifting the displayed calendar day.

The frontend route check is a usability boundary, not a security boundary. The backend must authorize every protected request.

## Source layout

```text
frontend/
├── e2e/                 Playwright browser scenarios
├── public/              Static files copied by Vite
└── src/
    ├── app/             Browser router
    ├── components/      Layout and reusable UI primitives
    ├── features/        Authentication/session and schedule policies
    ├── hooks/           Reusable React hooks
    ├── pages/           Route-level views
    ├── services/        Axios clients grouped by API domain
    ├── types/           API and domain types
    └── utils/           Civil-date helpers
```

## Requirements

- Node.js `20.19+`, `22.12+`, or `24+`
- npm
- a running ShiftPizza API for interactive use

## Environment

Create a local environment file from the tracked placeholder:

```powershell
npm ci
npx playwright install chromium
Copy-Item .env.example .env.local
```

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the ShiftPizza API, without credentials. |

`VITE_` variables are embedded in the browser bundle. Never put tokens, passwords, database URLs, or other secrets in them. When the variable is absent, the current client falls back to `http://localhost:3000`; an explicit local value is preferred so the runtime contract is visible.

## Development

```powershell
npm run dev
```

Useful scripts:

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check the project and create a production bundle. |
| `npm run preview` | Serve the built bundle locally. |
| `npm run lint` | Run ESLint without rewriting source files. |
| `npm run test` | Run Vitest in watch mode. |
| `npm run test:run` | Run the deterministic Vitest suite once. |
| `npm run test:e2e` | Run Playwright browser checks. |

## Tests

```powershell
npm run lint
npm run test:run
npm run build
npm run test:e2e
```

Vitest currently exercises pure session, role-routing, schedule-status, and civil-date policies in a Node environment. Playwright starts Vite on `127.0.0.1:4173`, intercepts the configured API origin, and verifies that a user is redirected before a page for the wrong role can request protected data. It does not require or mutate a real database.

`npx playwright install chromium` installs the browser binary required by the current Playwright configuration. It is normally needed once per development environment.

There is not yet a dedicated automated accessibility command. Before release, perform keyboard and browser accessibility checks for:

- semantic headings, labels, live regions, and dialogs;
- visible focus and logical focus order;
- keyboard-only navigation and Escape behavior;
- text/background contrast;
- horizontal and vertical overflow;
- reduced-motion preferences;
- responsive layouts at `390x844`, `768x1024`, and `1440x900`.

## Session and API behavior

The Axios adapter adds the bearer token from local storage to API requests. A `401` response clears the stored session and returns the browser to login. Role mismatches are redirected before the protected page is rendered.

Because the current session is stored in local storage, XSS prevention remains important: render user data as text, avoid unsafe HTML injection, and keep third-party browser code to a minimum.

## Production notes

Set `VITE_API_URL` at build time to the deployed API origin. Configure the same frontend origin in the backend `CORS_ORIGIN` allowlist. The repository does not currently define a deployment provider or claim a production deployment workflow.
