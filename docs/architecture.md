# ShiftPizza architecture

This document explains the decisions that are easy to miss when reading the repository file-by-file. It focuses on boundaries, invariants, and operational trade-offs rather than repeating the README.

## System shape

ShiftPizza is a small modular web application with two independently installed applications:

```text
Browser
  |
  | HTTPS / JSON
  v
React + Vite SPA
  |
  | Bearer JWT
  v
NestJS REST API
  |
  v
Prisma
  |
  v
PostgreSQL
```

The frontend is responsible for presentation, navigation, local interaction state, and typed API adapters. The backend is the authorization and domain boundary. PostgreSQL is the durable source of truth.

The backend is intentionally a modular monolith. The current product scope does not justify distributed services, a message broker, or eventual-consistency infrastructure. Keeping employee, schedule, audit, and authentication rules in one transactional boundary makes the important invariants easier to preserve.

## Backend boundaries

The API is split into focused modules:

- `auth`: login and authenticated-user resolution;
- `employees`: employee lifecycle and recurring weekly work rules;
- `schedules`: monthly generation, schedule reads, and manual day changes;
- `audit`: append-style records for meaningful administrative mutations;
- `demo`: isolated demo reset behavior guarded by environment policy;
- `health`: liveness endpoint.

Cross-cutting infrastructure lives outside those feature modules: environment validation, Prisma lifecycle, guards, filters, validation pipes, and civil-date helpers.

## Authorization boundary

Client-side route guards are a usability feature, not a security boundary.

Every authenticated request is validated from the bearer JWT. The API does not trust the role embedded in the token as the final source of truth: the JWT strategy reloads the user and employee from the database and rejects tokens for missing or inactive employees. Administrator-only operations are protected by server-side role guards.

This has two useful consequences:

1. deactivating an employee invalidates their effective access without waiting for a previously issued token to expire;
2. modifying browser state cannot promote an employee into an administrator.

## Schedule model and invariants

A schedule day has two independent concepts:

- **status**: what the day currently means (`SCHEDULED`, `ABSENT`, `EXTRA_SHIFT`, `DAY_OFF`, or `REMOVED_SHIFT`);
- **source**: whether the row came from automatic generation or a manual change.

Monthly generation follows the active employees' recurring weekday rules and creates automatic `SCHEDULED` rows. Generation is intentionally idempotent: the database uniqueness constraint plus Prisma `createMany({ skipDuplicates: true })` prevents duplicate schedule rows when the same month is generated again.

Manual edits change the source to `MANUAL`, persist the administrator who changed the row, and append an audit entry. Reads hide `REMOVED_SHIFT` rows rather than deleting the history-producing mutation.

## Concurrent schedule mutations

Schedule generation and rule-driven future schedule synchronization can touch overlapping rows. Those mutation paths run inside database transactions and acquire the shared schedule-mutation lock before changing schedule state.

This protects the application from two administrative requests racing to regenerate/synchronize the same scheduling data while still keeping read operations independent.

## Updating recurring work rules

Changing an employee's recurring weekdays must not blindly rewrite historical schedule data.

The employee service therefore synchronizes only the relevant future schedule:

- future untouched `AUTO + SCHEDULED` rows that no longer match the rule may be removed;
- manually changed rows are preserved;
- newly added weekdays are materialized only in months that have already been generated;
- duplicate dates are prevented before insertion and again by the database constraint.

The business timezone is used to determine the current civil day so this behavior does not shift when the server runs in a different timezone.

## Civil dates versus timestamps

A work date such as `2026-08-13` is a calendar fact, not an instant in time. Converting it through arbitrary local timezones can turn it into the previous or next day.

ShiftPizza therefore centralizes civil-date construction, comparison, serialization, and weekday calculations. Backend date logic uses UTC-safe civil-date helpers, while the business timezone is applied explicitly where the concept of "today" matters.

The frontend follows the same rule: schedule dates are handled through dedicated civil-date helpers instead of ad-hoc `new Date(string)` conversions.

## Transactions and audit consistency

Mutations that change business state and create an audit record execute in the same Prisma transaction where applicable. The intent is simple: the application should not report a business mutation as successful while silently losing the corresponding audit record, or vice versa.

Audit entries are operational history, not an event-sourcing implementation. Current application state still lives in the domain tables.

## Error and input boundary

The API uses a global validation pipe with:

- DTO transformation;
- allowlisted properties;
- rejection of unknown properties.

Prisma errors are translated by a global exception filter. Environment variables are validated during startup so invalid production configuration fails early rather than producing partially working behavior at request time.

## Security posture

Current defensive layers include:

- Argon2 password hashing;
- expiring JWT authentication;
- server-side user/activity revalidation;
- role-based authorization;
- login throttling;
- CORS allowlisting;
- Helmet HTTP headers on the API;
- restrictive production environment validation;
- isolated and disabled-by-default destructive demo reset;
- defensive static response headers on Vercel;
- CodeQL and dependency review in GitHub Actions.

Secrets belong only in deployment/local environment configuration. `VITE_*` values are public by design because Vite bundles them into browser code.

## Quality strategy

The repository deliberately tests at multiple levels:

- backend unit tests for domain/service behavior;
- backend HTTP integration tests for validation and security boundaries;
- frontend unit/component tests;
- Playwright E2E tests for administrator and employee workflows;
- automated accessibility and responsive checks with axe-core;
- CI build/lint gates for both applications;
- CodeQL static security analysis;
- dependency review for pull requests.

Playwright retains trace and screenshot diagnostics on CI failures, and CI uploads those artifacts for post-failure investigation.

## Deployment boundaries

The frontend is a static SPA deployed to Vercel. SPA rewrites route browser paths back to `index.html`; the API base URL is injected through the public `VITE_API_URL` build variable.

The backend is a separately deployable NestJS process backed by PostgreSQL. The frontend deployment must never be treated as the location of private server configuration.

## Explicit non-goals

The following are intentionally not introduced until product requirements justify them:

- microservices;
- Kafka or another event bus;
- Redis as a mandatory dependency;
- Kubernetes;
- GraphQL alongside the existing REST API;
- event sourcing;
- payroll and clock-in/clock-out modeling.

Avoiding unnecessary infrastructure is part of the architecture: complexity should be purchased only when it solves a demonstrated problem.
