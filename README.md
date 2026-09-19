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
docker-compose up -d
```

This starts a `postgres:15` container named `postgres`, exposed on host port **5433** (mapped to 5432 inside the container).

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

## Tech Stack

| Area        | Tool                       |
| :---------- | :------------------------- |
| Test runner | Playwright (`@playwright/test`, TypeScript) |
| Database    | PostgreSQL 15 (Docker)     |
| DB driver   | `pg` (node-postgres)       |
| Linting     | ESLint                     |
| CI/CD       | GitHub Actions (planned)   |

## Project Structure

```
.
├── docker-compose.yml   # PostgreSQL container definition
├── db-client.ts         # runQuery() helper: connect, execute SQL, disconnect
├── database.spec.ts     # DB test: create table, insert a row, verify it
├── package.json
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

## Database Configuration

Connection settings live in `dbConfig` in `db-client.ts` and must match `docker-compose.yml`:

| Setting  | Value       |
| :------- | :---------- |
| Host     | `localhost` |
| Port     | `5433`      |
| User     | `postgres`  |
| Database | `postgres` (the compose file also creates `test_db`) |

The password is set in `docker-compose.yml` (`POSTGRES_PASSWORD`) and read from `db-client.ts`. Credentials are currently hard-coded for local development; move them to environment variables (e.g. a git-ignored `.env`) before sharing the repo or adding CI.

## Troubleshooting

- **Connection refused:** check that the container is running with `docker ps`, and that the port in `db-client.ts` is 5433.
- **Port already in use:** a native Postgres service may be bound to 5432. That is why the container uses 5433.
- **Reset the database:** `docker-compose down -v` removes the container and its `pgdata` volume.
