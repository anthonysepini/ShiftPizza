# ShiftPizza Safe Professional Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the confirmed ShiftPizza security, data, reliability, mobile, accessibility, testing, and maintainability defects without changing its product contracts or visual identity.

**Architecture:** Work in independently verifiable slices. Pure contract/date/session helpers form the stable core; controllers, services, pages, and UI primitives consume them without adding speculative layers. Database writes that must agree use one Prisma transaction.

**Tech Stack:** TypeScript, React 19, Vite 8, React Router 7, Axios, Tailwind CSS 4, NestJS 11, Jest 30, Prisma 7, PostgreSQL/Neon, Vitest, Playwright, axe-core.

## Global Constraints

- Preserve existing product flows, API routes, successful payloads, data, URLs, and black/orange visual identity.
- Do not commit, push, merge, deploy, rewrite history, reset databases, seed remote databases, or run destructive migrations.
- Do not add state-management, UI-system, ORM, repository-pattern, CQRS, or microservice dependencies.
- Apply RED-GREEN-REFACTOR to every behavior change and run a focused review after each task.
- Keep the pre-existing `frontend/test-results/` untracked artifact intact.

---

### Task 1: Reproducible test foundations

**Files:**
- Modify: `backend/test/app.e2e-spec.ts`
- Create: `backend/src/modules/health/presentation/controllers/health.controller.spec.ts`
- Modify: `frontend/package.json`
- Modify: `frontend/package-lock.json`
- Create: `frontend/vitest.config.ts`
- Create: `frontend/playwright.config.ts`
- Create: `frontend/e2e/support/mock-api.ts`
- Create: `frontend/e2e/role-routing.spec.ts`

**Interfaces:**
- Produces: `npm test`, `npm run test:e2e`, and `npm run test:a11y` gates in the frontend; isolated health E2E in the backend.

- [ ] **Step 1: Repair the stale backend E2E test and assert `GET /health`**

Use a CommonJS-compatible `supertest` import, override `PrismaService` with connect/disconnect no-ops, and assert `{ status: 'ok', service: 'ShiftPizza API', timestamp: expect.any(String) }`.

- [ ] **Step 2: Run the backend E2E test**

Run: `npm run test:e2e -- --runInBand`

Expected: PASS without opening a database connection.

- [ ] **Step 3: Add frontend test scripts and pinned dev dependencies**

Add `test`, `test:run`, `test:e2e`, and `test:a11y`; add only `vitest`, `@playwright/test`, and `@axe-core/playwright` because each closes a confirmed missing quality gate.

- [ ] **Step 4: Write a failing mocked-browser role test**

Assert that an EMPLOYEE navigating to `/admin` lands on `/employee`, and an ADMIN navigating to `/employee` lands on `/admin`.

- [ ] **Step 5: Run the role test and verify RED**

Run: `npm run test:e2e -- role-routing.spec.ts`

Expected: FAIL because current `AppLayout` checks only token presence.

### Task 2: Backend configuration and authorization boundary

**Files:**
- Create: `backend/src/config/environment.ts`
- Create: `backend/src/config/environment.spec.ts`
- Modify: `backend/src/app.module.ts`
- Modify: `backend/src/main.ts`
- Modify: `backend/src/modules/auth/auth.module.ts`
- Modify: `backend/src/modules/auth/infrastructure/strategies/jwt.strategy.ts`
- Create: `backend/src/common/types/authenticated-user.ts`
- Modify: `backend/src/common/decorators/current-user.decorator.ts`
- Modify: `backend/src/modules/employees/employees.controller.ts`
- Create: `backend/src/modules/employees/employees.controller.spec.ts`
- Modify: `backend/src/modules/audit/audit.service.ts`
- Create: `backend/src/modules/audit/audit.service.spec.ts`
- Modify: `backend/src/modules/demo/demo.controller.ts`
- Create: `backend/src/modules/demo/demo.controller.spec.ts`
- Create: `backend/.env.example`

**Interfaces:**
- Produces: `AuthenticatedUser`; startup validation; self-or-admin employee read; opt-in demo reset.

- [ ] **Step 1: Write failing tests**

Cover missing/short JWT secret, inactive employee validation, employee cross-profile denial, audit actor projection excluding `passwordHash`, and disabled demo reset.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- --runInBand config/environment.spec.ts jwt.strategy.spec.ts employees.controller.spec.ts audit.service.spec.ts demo.controller.spec.ts`

Expected: FAIL for each missing safeguard.

- [ ] **Step 3: Implement the minimum safeguards**

Require `DATABASE_URL` and a 32+ character `JWT_SECRET`, parse `CORS_ORIGIN` and `DEMO_RESET_ENABLED`, remove JWT fallbacks, reject inactive users, authorize employee reads by role/id, explicitly select safe audit actor fields, and return 404 for reset when demo mode is disabled.

- [ ] **Step 4: Run focused and full backend tests**

Run: `npm test -- --runInBand` then `npm run test:e2e -- --runInBand`.

Expected: PASS with no remote mutations.

### Task 3: Atomic and timezone-safe schedules

**Files:**
- Create: `backend/src/common/date/civil-date.ts`
- Create: `backend/src/common/date/civil-date.spec.ts`
- Modify: `backend/src/modules/schedules/schedules.service.ts`
- Create: `backend/src/modules/schedules/schedules.service.spec.ts`
- Modify: `backend/src/modules/employees/employees.service.ts`
- Create: `backend/src/modules/employees/employees.service.spec.ts`
- Modify: `backend/src/modules/audit/audit.service.ts`
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/prisma/migrations/20260813_add_operational_indexes/migration.sql`

**Interfaces:**
- Produces: UTC-safe `createCivilDate`, `getCivilDateKey`, `getCivilWeekday`, and transaction-aware `AuditService.log`.

- [ ] **Step 1: Write failing timezone and query-shape tests**

Test March 1 in UTC-03, month boundaries, generated row counts, one `createMany`, `skipDuplicates`, and audit through the same transaction client.

- [ ] **Step 2: Verify RED in UTC and Sao Paulo**

Run: `$env:TZ='UTC'; npm test -- --runInBand civil-date.spec.ts schedules.service.spec.ts employees.service.spec.ts`

Run: `$env:TZ='America/Sao_Paulo'; npm test -- --runInBand civil-date.spec.ts schedules.service.spec.ts employees.service.spec.ts`

Expected: current local-date and N+1 code fails expectations.

- [ ] **Step 3: Implement UTC date helpers, batched insert, and atomic audit**

Build all candidate rows in memory, call `createMany({ skipDuplicates: true })` once inside `$transaction`, and write the audit with the same transaction client. Wrap `updateDay` and its audit together. Replace local getters used for PostgreSQL date values.

- [ ] **Step 4: Add additive indexes only**

Add indexes for month-range schedule reads, audit ordering, and unindexed foreign keys. Do not execute the migration against the configured database.

- [ ] **Step 5: Run tests, Prisma validation, and generation**

Expected: both timezones PASS; Prisma commands exit 0 without schema mutation.

### Task 4: Frontend session, role, date, and status contracts

**Files:**
- Create: `frontend/src/features/auth/session.ts`
- Create: `frontend/src/features/auth/session.test.ts`
- Create: `frontend/src/features/auth/route-access.ts`
- Create: `frontend/src/features/auth/route-access.test.ts`
- Modify: `frontend/src/features/auth/AuthProvider.tsx`
- Modify: `frontend/src/components/layout/AppLayout.tsx`
- Modify: `frontend/src/app/router.tsx`
- Modify: `frontend/src/services/api.ts`
- Create: `frontend/src/utils/civil-date.ts`
- Create: `frontend/src/utils/civil-date.test.ts`
- Create: `frontend/src/features/schedules/status.ts`
- Create: `frontend/src/features/schedules/status.test.ts`
- Modify: `frontend/src/pages/employee/MyCalendarPage.tsx`
- Modify: `frontend/src/pages/employee/MyDashboardPage.tsx`
- Modify: `frontend/src/pages/admin/SchedulePage.tsx`
- Modify: `frontend/src/pages/admin/DashboardPage.tsx`
- Modify: `frontend/src/pages/admin/EmployeesPage.tsx`
- Modify: `frontend/src/components/ui/Badge.tsx`

**Interfaces:**
- Produces: validated session hydration, role-home resolution, `YYYY-MM-DD` parsing/formatting, and one exhaustive status map.

- [ ] **Step 1: Write failing pure tests**

Cover corrupt storage, mismatched token/user, wrong-role destinations, UTC ISO date display in UTC-03, local form-date generation, and every `ScheduleStatus`.

- [ ] **Step 2: Run Vitest and verify RED**

Run: `npm run test:run`

Expected: FAIL because helpers do not exist and current status logic invents PRESENT/vacation semantics.

- [ ] **Step 3: Implement helpers and consume them**

Remove string heuristics and synthetic attendance. Keep only server statuses. Validate stored sessions and redirect wrong-role routes before rendering their pages. Preserve 403 as a permission error and clear session only on 401.

- [ ] **Step 4: Re-run unit and role E2E tests**

Expected: PASS; no wrong-role API calls in Playwright network logs.

### Task 5: Honest request states and mutation feedback

**Files:**
- Create: `frontend/src/components/ui/RequestError.tsx`
- Modify: `frontend/src/pages/admin/DashboardPage.tsx`
- Modify: `frontend/src/pages/admin/EmployeesPage.tsx`
- Modify: `frontend/src/pages/admin/SchedulePage.tsx`
- Modify: `frontend/src/pages/admin/AuditPage.tsx`
- Modify: `frontend/src/pages/employee/MyDashboardPage.tsx`
- Modify: `frontend/src/pages/employee/MyCalendarPage.tsx`
- Modify: `frontend/src/pages/employee/MyProfilePage.tsx`
- Modify: `frontend/e2e/request-states.spec.ts`

**Interfaces:**
- Produces: distinct loading/ready/error states and retry actions; child dialogs receive the page toast callback.

- [ ] **Step 1: Write failing browser tests for API failure and stale responses**

Assert failed schedule load shows an error rather than “not generated”, failed dashboard does not show zero metrics, dialog mutation feedback is announced, and older month responses cannot overwrite newer selections.

- [ ] **Step 2: Verify RED**

Run: `npm run test:e2e -- request-states.spec.ts`

- [ ] **Step 3: Implement explicit request state and shared feedback**

Keep state local to each page. Use abort/cancellation guards for parameterized requests. Pass `toast` to mutation dialogs and report schedule regeneration failure truthfully.

- [ ] **Step 4: Verify focused browser tests and lint**

Expected: PASS with no unhandled rejection or unexpected 4xx console entry.

### Task 6: Accessible, responsive shell and UI primitives

**Files:**
- Modify: `frontend/src/components/layout/AppLayout.tsx`
- Modify: `frontend/src/components/layout/Sidebar.tsx`
- Modify: `frontend/src/components/layout/PageHeader.tsx`
- Modify: `frontend/src/components/ui/Input.tsx`
- Modify: `frontend/src/components/ui/Select.tsx`
- Modify: `frontend/src/components/ui/Modal.tsx`
- Modify: `frontend/src/components/ui/Toast.tsx`
- Modify: `frontend/src/components/ui/Button.tsx`
- Modify: `frontend/src/index.css`
- Modify: `frontend/index.html`
- Modify: `frontend/src/pages/login/LoginPage.tsx`
- Modify: `frontend/src/pages/admin/EmployeesPage.tsx`
- Modify: `frontend/src/pages/admin/SchedulePage.tsx`
- Modify: `frontend/src/pages/employee/MyCalendarPage.tsx`
- Create: `frontend/e2e/accessibility-responsive.spec.ts`

**Interfaces:**
- Produces: desktop sidebar plus mobile drawer/header; labelled form controls; focus-managed modal; live toasts; reduced-motion and contrast-safe tokens.

- [ ] **Step 1: Write failing Playwright/Axe checks**

At 390x844 assert main content has usable width, navigation can open/close by keyboard, modal focus stays inside and returns to trigger, form errors are described, and Axe has no serious/critical violations on principal pages.

- [ ] **Step 2: Verify RED**

Run: `npm run test:a11y`

- [ ] **Step 3: Implement accessibility and responsive corrections**

Use semantic controls, deterministic IDs, `aria-modal`, labelled close buttons, focus restore/trap, a focusable scroll region, Portuguese document language, visible focus, higher-contrast muted text, reduced motion, and a mobile drawer. Preserve desktop composition and colors.

- [ ] **Step 4: Re-run Axe and screenshots at all viewports**

Expected: no serious/critical automated violation and no horizontal clipping; visual differences limited to intentional accessibility/mobile fixes.

### Task 7: Focused modularization and repository documentation

**Files:**
- Split coherent employee form/dialog/list sections from `frontend/src/pages/admin/EmployeesPage.tsx`
- Split login dialog/account data from `frontend/src/pages/login/LoginPage.tsx`
- Modify: `frontend/src/app/router.tsx`
- Modify: `README.md`
- Modify: `frontend/README.md`
- Modify: `backend/README.md`
- Create: `frontend/.env.example`
- Create: `backend/.env.example`
- Remove only confirmed-unreferenced starter assets/files.

**Interfaces:**
- Produces: lazy route modules, bounded page files, and reproducible local/test/security documentation.

- [ ] **Step 1: Add characterization coverage for extracted behavior**

Run existing unit/E2E suites before and after each extraction; no new behavior is allowed in this task.

- [ ] **Step 2: Extract only multi-responsibility sections**

Keep components colocated by feature and avoid one-use wrappers that do not reduce page responsibility. Lazy-load route pages to keep authenticated code out of the login bundle.

- [ ] **Step 3: Remove verified dead starter artifacts and filler characters**

Confirm each file has zero references first. Replace layout filler characters with CSS layout, not visible whitespace hacks.

- [ ] **Step 4: Write project-specific setup and test documentation**

Document Node 20, safe environment variables without values, demo reset opt-in, Neon pooled connection guidance, every quality command, and manual role flows.

### Task 8: Independent review and final evidence

**Files:**
- Review all working-tree changes; modify only to resolve confirmed findings.

**Interfaces:**
- Produces: final evidence report and an uncommitted local branch ready for human inspection.

- [ ] **Step 1: Run full code gates**

Frontend: `npm run lint`, `npm run test:run`, `npm run build`, `npm run test:e2e`, `npm run test:a11y`.

Backend: read-only ESLint command, `npm run build`, `npm test -- --runInBand`, `npm run test:e2e -- --runInBand`, `npx prisma validate`, `npx prisma generate`.

- [ ] **Step 2: Run final browser QA**

Verify login, ADMIN dashboard/employees/schedule/audit, EMPLOYEE dashboard/calendar/profile, errors, modal keyboard behavior, wrong-role redirects, mobile/tablet/desktop, console, and failed requests. Do not trigger remote mutations.

- [ ] **Step 3: Compare visual artifacts**

Store final screenshots outside the repository and compare against baseline. Document intentional mobile/accessibility differences and correct every unintentional desktop regression.

- [ ] **Step 4: Request independent Staff review**

Reviewer must inspect the full working-tree diff for security, data loss, compatibility, tests, overengineering, and visual regression. Fix Critical and Important findings before closing.

- [ ] **Step 5: Inspect Git and clean processes**

Run `git status`, `git diff --stat`, `git diff`, `git diff --check`; stop all servers started by this task. Do not commit or push.
