# Full-Stack Automation Framework

**Database • API • UI**

A containerized automation suite that uses Playwright (TypeScript) for testing and Docker to run a local PostgreSQL instance. Database tests are in place; API and UI tests will be added.

## Quick Start

### 1. Prerequisites

- Node.js (v18+)
- Docker Desktop
- DBeaver or pgAdmin (optional, for browsing the database)

### 2. Start the database

```bash
docker-compose up -d --build
```

This builds the custom database image from the `Dockerfile` and starts a container named `postgres`, exposed on host port **5433** (mapped to 5432 inside the container). The image is based on `postgres:15` and creates the `test_db` database with its tables on first start (see [Database Image](#database-image)).

### 3. Install dependencies

```bash
npm install
npx playwright install
```

### 4. Run the tests

```bash
# Run all tests
npx playwright test

# Run a specific spec
npx playwright test database.spec.ts
```

### npm scripts

Shortcuts for the common tasks are defined in `package.json`:

| Script | What it does |
| :----- | :----------- |
| `npm test` | Runs the Playwright tests |
| `npm run typecheck` | Type-checks the TypeScript (`tsc --noEmit`) |
| `npm run build:image` | Builds the `playwright-pg:1.0` Docker image |
| `npm run build` | Type-checks, then builds the Docker image |
| `npm run db:up` | Builds the image and starts the database (`docker-compose up -d --build`) |
| `npm run db:down` | Stops and removes the database container (the data volume is kept) |

### IDE support

**Visual Studio** — open `Playwright_Docker_Pgadmin.sln`. The `.esproj` project wraps the `npm` scripts:

- **Build / Rebuild** runs `npm run build` (type-check + Docker image build).
- **Start** runs `npm test`.
- The JavaScript project SDK is downloaded from NuGet on the first build, so internet access is needed once.
- Run `npm install` yourself when dependencies change; the build does not do it.

**VS Code** — open the folder. VS Code has no Build menu and does not use the `.esproj` or `.sln` files; use the `npm` scripts instead, from the terminal or the NPM Scripts view in the Explorer. `.vscode/tasks.json` defines tasks for them: press `Ctrl+Shift+B` to build (type-check + Docker image), or use **Terminal → Run Task…** for type-check, tests and database start/stop. Optionally install the *Playwright Test for VS Code* extension to run and debug tests from the editor.

## Tech Stack

| Area        | Tool                       |
| :---------- | :------------------------- |
| Test runner | Playwright (`@playwright/test`, TypeScript) |
| Database    | PostgreSQL 15 (Docker)     |
| DB driver   | `pg` (node-postgres)       |
| Language    | TypeScript (`tsc` type-check) |
| Linting     | ESLint                     |
| CI/CD       | GitHub Actions (planned)   |

## Project Structure

```
.
├── Dockerfile           # Custom Postgres image (postgres:15 + init script)
├── db/
│   └── init.sql         # Creates the tables on first start
├── docker-compose.yml   # Builds the image and runs the container
├── db-client.ts         # runQuery() helper: connect, execute SQL, disconnect
├── database.spec.ts     # DB test: create table, insert a row, verify it
├── tsconfig.json        # TypeScript settings (strict, no emit)
├── Playwright_Docker_Pgadmin.esproj  # Visual Studio project (wraps the npm scripts)
├── Playwright_Docker_Pgadmin.sln     # Visual Studio solution
├── package.json         # Dependencies and npm scripts
└── test-results/        # Playwright output (generated)
```

As API and UI tests are added, group them into folders (e.g. `tests/db`, `tests/api`, `tests/ui`).

## Testing Layers

| Layer | Status  | Description |
| :---- | :------ | :---------- |
| **DB**  | Done    | Direct SQL validation against PostgreSQL using `runQuery` |
| **API** | Planned | Backend endpoint validation with Playwright's `request` fixture |
| **UI**  | Planned | End-to-end browser tests |

### DB helper

`runQuery(sql)` in `db-client.ts` opens a connection, runs the query and always closes the connection. It returns the `pg` result object; the returned rows are in `result.rows`.

## Database Image

The `Dockerfile` extends `postgres:15` and copies `db/init.sql` into `/docker-entrypoint-initdb.d/`. The Postgres image runs scripts in that folder **once**, when it creates a new data directory, against the database named in `POSTGRES_DB` (`test_db`).

```bash
# Build the image on its own
docker build -t playwright-pg:1.0 .
```

- The password is not baked into the image; it is passed at runtime through `POSTGRES_PASSWORD`.
- If the `pgdata` volume already exists, changes to `db/init.sql` are ignored. Delete the volume to re-run the script (see Troubleshooting).
- Keep `db/init.sql` and the `CREATE TABLE IF NOT EXISTS` statements in the specs consistent.

## Database Configuration

Connection settings live in `dbConfig` in `db-client.ts` and must match `docker-compose.yml`:

| Setting  | Value       |
| :------- | :---------- |
| Host     | `localhost` |
| Port     | `5433`      |
| User     | `postgres`  |
| Database | `test_db` (created by `POSTGRES_DB` in the compose file) |

The password is set in `docker-compose.yml` (`POSTGRES_PASSWORD`) and read from `db-client.ts`. Credentials are currently hard-coded for local development; move them to environment variables (e.g. a git-ignored `.env`) before sharing the repo or adding CI.

## Troubleshooting

- **Connection refused:** check that the container is running with `docker ps`, and that the port in `db-client.ts` is 5433.
- **Port already in use:** a native Postgres service may be bound to 5432. That is why the container uses 5433.
- **Reset the database:** `docker-compose down -v` removes the container and its `pgdata` volume; the next `docker-compose up -d --build` re-runs `db/init.sql`. This deletes all data.
- **Init script not applied:** the `pgdata` volume already existed. Reset the database as above.
