# ShiftPizza Safe Professional Refactor Design

## Objective

Raise ShiftPizza to a credible professional portfolio standard while preserving its public REST contracts, business flows, data, URLs, dark black/orange identity, and ADMIN/EMPLOYEE behavior. Correctness, behavioral compatibility, and security take precedence over aesthetic or architectural novelty.

## Current system

ShiftPizza is a two-package repository:

- `frontend`: React 19, Vite 8, TypeScript, React Router, Axios, Tailwind CSS.
- `backend`: NestJS 11, Prisma 7, PostgreSQL/Neon, JWT, Argon2.

The frontend owns only session state globally. Pages fetch data directly through domain services. The backend is organized by Nest module and uses one shared Prisma service. The product is a demo-capable operational tool for employees and monthly schedules.

## Confirmed baseline

- Frontend lint and build pass.
- Backend read-only lint and build pass.
- Backend unit tests fail because no unit tests exist.
- Backend E2E fails before the request because of the `supertest` import, and its assertion still targets the removed Nest starter route.
- Prisma validation and generation pass.
- Browser baseline exists outside the repository for 390x844, 768x1024, and 1440x900.
- Mobile authenticated pages are unusable because the fixed 224 px sidebar leaves 166 px for content at 390 px.
- EMPLOYEE can render `/admin` routes and causes unhandled 403 responses.
- `POST /demo/reset` is public and deletes all application data before recreating demo users.
- The configured database is non-local, so no migration, seed, reset, or mutating baseline operation is permitted.

## Considered approaches

### 1. Incremental hardening and bounded refactoring (selected)

Add characterization tests, repair security and correctness defects, then extract only coherent responsibilities from oversized files. Preserve route and payload shapes. This provides small rollback surfaces and evidence after each slice.

### 2. Feature-first repository restructuring

Move every frontend and backend file into a new domain architecture before fixing behavior. This could improve discoverability eventually, but it creates a large diff with weak behavioral evidence and high regression risk.

### 3. Rewrite around new state, UI, and data libraries

Adopt a query cache, global store, new component system, and repository layer. This is rejected because the current product does not demonstrate a need for those dependencies and the brief explicitly prohibits speculative architecture and redesign.

## Target architecture

### Frontend

- Keep Axios services per domain.
- Introduce small pure domain utilities for civil dates, session parsing, role routing, and exhaustive schedule status presentation.
- Make route authorization explicit at the layout boundary.
- Keep page-local server state, but model `loading`, `ready`, and `error` distinctly so failures never masquerade as empty data.
- Pass one toast channel into child mutation dialogs.
- Harden existing UI primitives for labels, dialogs, live regions, focus, reduced motion, and contrast.
- Replace the permanently visible mobile sidebar with a compact header/drawer while keeping the desktop navigation visually intact.
- Add reproducible Vitest and Playwright/Axe gates. No state-management or design-system dependency is introduced.

### Backend

- Validate required configuration at startup and remove known-secret fallbacks.
- Rehydrate JWT users from the database and reject inactive accounts.
- Enforce self-or-admin access for employee details without changing the endpoint.
- Return explicit selects for audit actors so password hashes cannot escape.
- Make demo reset opt-in by configuration and expose read-only availability to the login UI.
- Batch monthly schedule creation and make schedule mutation plus audit atomic.
- Use UTC/civil-date helpers consistently for PostgreSQL `date` values.
- Add only additive indexes/constraints justified by actual queries; do not run migrations against the configured remote database.

### Repository

- Keep application changes unstaged and uncommitted.
- Treat the 29,301 tracked backend `node_modules` files as a separate hygiene change. Untracking may be staged separately only after functional verification; files on disk remain untouched.
- Replace starter documentation with project-specific setup, environment, test, security, and manual QA instructions.

## Error and security model

- 401 clears invalid local session state and redirects to login.
- Wrong-role frontend routes redirect to that user's correct home before page effects run.
- 403 from an otherwise valid session becomes an explicit permission error, not logout.
- Data-loading errors render retryable error states; zero and empty states remain reserved for successful responses.
- Demo reset is unavailable unless the server explicitly enables it. It remains public only in an intentionally isolated demo environment.
- Missing/weak JWT configuration prevents startup.
- All employee-detail reads are ADMIN or self; audit responses expose only actor identifiers, role, and display name.

## Testing strategy

- Backend: Jest unit tests for config, JWT activity checks, employee authorization, audit projection, date handling, batched schedule generation, and transactional audit; isolated E2E for health/auth guards with Prisma mocked.
- Frontend: Vitest tests for civil dates, schedule status, session parsing, and role routing; Playwright tests with mocked APIs for role isolation, loading/error states, mobile navigation, keyboard dialogs, and critical Axe rules.
- Database: `prisma validate`, `prisma generate`, schema diff inspection, and migration SQL review only. No remote mutation.
- Visual: compare affected screens against the original screenshots at all three viewports and inspect console/network failures.

## Out of scope

- New product features or roles.
- New schedule statuses, inferred attendance, or vacations derived from note text.
- Dependency upgrades unrelated to testing.
- ORM replacement, CQRS, microservices, repositories over Prisma, or a new design system.
- Commit, push, PR, deploy, remote reset/seed, destructive migration, or Git-history rewrite.

## Acceptance criteria

- Existing public URLs and successful payload shapes remain compatible.
- ADMIN and EMPLOYEE cannot render each other's route trees.
- Employee detail is self-or-admin, inactive JWTs are rejected, audit never returns password hashes, and demo reset fails closed unless enabled.
- Schedule generation has bounded database round trips and mutation/audit operations are atomic.
- Civil dates are stable in UTC and America/Sao_Paulo tests.
- Every principal page distinguishes loading, empty, and error.
- 390x844, 768x1024, and 1440x900 are usable with no inaccessible fixed sidebar.
- Fresh lint, build, test, Prisma, Playwright, Axe, diff, and browser evidence is recorded.
- No commit or push is performed.

