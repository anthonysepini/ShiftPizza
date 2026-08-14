# Contributing to ShiftPizza

Thank you for improving ShiftPizza. Changes should keep the repository reproducible, the scheduling rules explicit, and the security boundary on the server.

## Development runtime

The reference Node.js runtime is pinned in `.nvmrc`.

```bash
nvm use
```

The frontend and backend are independent npm projects. Install each with its committed lockfile:

```bash
cd backend
npm ci

cd ../frontend
npm ci
```

Do not commit `node_modules`, build output, Playwright output, local environment files, coverage output, or generated Prisma clients.

## Branches

Create focused branches from an up-to-date `main`. Prefer descriptive names such as:

```text
feat/employee-search
fix/schedule-date-boundary
refactor/audit-presentation
chore/dependency-maintenance
```

Avoid mixing unrelated refactors, dependency upgrades, and behavior changes in the same pull request.

## Environment safety

Copy the example environment files locally and keep real values outside Git:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Before any Prisma migration, seed, or reset command, verify the database target. Development commands that mutate schema or seed data must use a disposable local database unless a separate deployment change has been explicitly approved.

Never run the demo reset against shared or durable data.

## Domain rules to preserve

Changes around scheduling must respect these invariants:

- a work date is a civil calendar date, not an arbitrary timestamp;
- monthly generation is safe to run repeatedly and must not create duplicate schedule days;
- automatic schedule synchronization must not overwrite meaningful manual schedule changes;
- schedule-changing operations that require serialization must use the shared mutation lock;
- administrator mutations that are expected to be audited should keep the business mutation and audit write transactionally consistent;
- frontend role checks are navigation aids; authorization must remain enforced by the API.

See [`docs/architecture.md`](docs/architecture.md) before changing schedule, authentication, or date behavior.

## Required validation

Run the checks affected by your change before opening a pull request.

### Backend

```bash
cd backend
npm run lint
npx prisma validate
npx prisma generate
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run build
```

### Frontend

```bash
cd frontend
npm run lint
npm run test:run
npm run build
npm run test:e2e
```

For accessibility or responsive UI work, also run:

```bash
npm run test:a11y
```

The pull request CI repeats the core gates. CodeQL scans JavaScript/TypeScript and Dependency Review checks dependency changes introduced by pull requests.

## Testing expectations

A behavior change should normally include a test at the lowest useful level:

- pure/domain logic: unit test;
- API validation, guard, header, or HTTP contract: backend integration/E2E test;
- user workflow or regression crossing components: Playwright E2E test;
- visual interaction with accessibility impact: axe/keyboard/responsive coverage where practical.

A refactor that intentionally preserves behavior should keep existing tests passing and should not weaken assertions merely to make the refactor green.

## Dependency changes

Keep major upgrades isolated from feature work. Read release notes and migration guides before merging them, especially for TypeScript, ESLint, NestJS, Prisma, React, Vite, and test tooling.

Do not merge a dependency pull request only because it is newer. CI compatibility, runtime support, security advisories, and behavioral changes all matter.

## Pull requests

A useful pull request explains:

1. what problem is being solved;
2. what changed;
3. how it was validated;
4. what risk remains;
5. screenshots for meaningful UI changes.

Keep commits intentional. Conventional-style subjects are welcome, for example:

```text
feat: add employee search filters
fix: preserve manual schedule overrides
refactor: split audit presentation logic
security: harden deployment headers
chore: update test tooling
```

## Security reports

Do not open a public issue containing an exploitable vulnerability, credential, token, or private deployment detail. Follow [`SECURITY.md`](SECURITY.md) instead.
