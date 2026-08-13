# ShiftPizza backend

The backend is a NestJS 11 REST API using TypeScript, Prisma ORM, PostgreSQL, JWT bearer authentication, Argon2 password hashing, DTO validation, role guards, login throttling, CORS allowlisting, and HTTP security headers.

## Supported runtime

The package engine accepts Node.js `^20.19`, `^22.12`, or `>=24.0`. Install dependencies with the committed npm lockfile:

```powershell
npm ci
```

## Module boundaries

```text
src/
├── common/              Guards, decorators, filters, pipes, types, civil dates
├── config/              Startup environment validation
├── modules/
│   ├── auth/            Login use case and JWT strategy
│   ├── employees/       Employee, user, and weekly-rule operations
│   ├── schedules/       Monthly generation and day changes
│   ├── audit/           Schedule audit queries and writes
│   ├── demo/            Disabled-by-default destructive demo reset
│   └── health/          Public liveness response
├── prisma/              Prisma client lifecycle
├── app.module.ts        Application composition
├── configure-app.ts     Shared runtime and HTTP test configuration
└── main.ts              Process bootstrap
```

Prisma schema, migrations, and seed logic live in `prisma/`.

## Environment contract

Copy the tracked placeholder and replace its values locally:

```powershell
Copy-Item .env.example .env
```

| Variable | Requirement |
|---|---|
| `DATABASE_URL` | Required PostgreSQL connection string. Treat it as a secret. |
| `JWT_SECRET` | Required and at least 32 characters. Generate a random value per environment. |
| `CORS_ORIGIN` | Comma-separated allowed browser origins. Required in production; local Vite origins are the development default. |
| `BUSINESS_TIME_ZONE` | IANA timezone used to determine the current business day; defaults to `America/Sao_Paulo`. |
| `APP_MODE` | `standard` by default. Use `isolated-demo` only with a disposable demo database. |
| `DEMO_RESET_ENABLED` | `true` or `false`; defaults to `false`. |
| `PORT` | Integer from 1 to 65535; defaults to `3000`. |
| `NODE_ENV` | Runtime mode; production tightens the CORS requirement. |

Do not commit `.env`, connection strings, tokens, or real secrets. The example file contains placeholders only.

## Local database setup

Use a disposable local PostgreSQL database. Confirm the hostname and database name in `DATABASE_URL` before every Prisma command that can write data.

```powershell
npx prisma validate
npx prisma generate
npx prisma migrate deploy
```

To load the known demo users into a disposable database only:

```powershell
npx prisma db seed
```

Do not run the seed, `prisma migrate reset`, or the demo reset endpoint against a shared, staging, or production database. Remote database work requires an explicit review and deployment decision; local setup does not imply permission to modify a configured remote database.

## Run the API

```powershell
npm run start:dev
```

Other runtime commands:

| Command | Purpose |
|---|---|
| `npm run start` | Start Nest once from source configuration. |
| `npm run start:dev` | Start Nest in watch mode. |
| `npm run build` | Compile the production output. |
| `npm run start:prod` | Run the compiled `dist/src/main.js`. |

With the default port:

- health: `http://localhost:3000/health`
- Swagger UI outside production: `http://localhost:3000/api`

## API and authorization

| Route | Access | Purpose |
|---|---|---|
| `GET /health` | Public | Liveness response. |
| `POST /auth/login` | Public, rate-limited | Exchange CPF and password for an 8-hour JWT. |
| `GET /demo/status` | Public | Report whether demo reset is enabled. |
| `POST /demo/reset` | Public only when explicitly enabled | Destructively restore the demo dataset. |
| `GET /employees/:id` | Authenticated self or administrator | Read one employee profile. |
| `/employees` management routes | Administrator | Create, list, update, activate/deactivate, and delete employees. |
| `GET /schedules/my/:year/:month` | Authenticated user | Read the signed-in employee's schedule. |
| Other `/schedules` routes | Administrator | Generate/read monthly schedules and update a day. |
| `GET /audit` | Administrator | Read bounded schedule audit history. |

The JWT strategy loads the current user for each authenticated request and rejects missing users or inactive employees. The role in the database is used for authorization. Unknown DTO properties are rejected rather than silently stripped.

## Demo reset boundary

`APP_MODE=standard` and `DEMO_RESET_ENABLED=false` are the defaults. In that state, `POST /demo/reset` returns `404` and the reset service is not called.

Startup rejects `DEMO_RESET_ENABLED=true` unless `APP_MODE=isolated-demo` is also explicit. In that isolated mode the endpoint is unauthenticated and deletes every application audit log, schedule day, weekly rule, user, and employee inside a transaction, then creates known seed accounts. Never use that mode with shared or durable data.

## Verification

Read-only lint check:

```powershell
npm run lint
```

Use `npm run lint:fix` only when automatic formatting and safe lint rewrites are intended.

Complete local checks:

```powershell
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run lint
npm run build
npx prisma validate
npx prisma generate
```

Coverage can be collected with `npm run test:cov`. HTTP integration tests override Prisma and do not need or mutate a database. They verify the health contract, validation policy, baseline security headers, login throttling, and the disabled reset boundary.

## Database evolution

- Add schema changes through reviewed migrations in `prisma/migrations/`.
- Test migration SQL against a disposable local database first.
- Keep civil calendar dates timezone-independent in application code.
- Keep schedule writes and their audit entry in the same database transaction.
- Keep monthly generation and weekly-rule synchronization behind the shared PostgreSQL transaction advisory lock.
- Review query plans and indexes when list or schedule workloads change.
- Apply migrations to shared environments only through a separately authorized deployment process.
