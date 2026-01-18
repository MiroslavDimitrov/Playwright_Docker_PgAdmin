import {Client} from 'pg'

export const dbConfig = {
    user: 'postgres',
    password: 'Mi@1122@ro',
    host: 'localhost',
    port: 5432,
    database: 'postgres'
}

/**
 * Executes a SQL query against the PostgreSQL container.
 * @param query - The SQL string to be executed (e.g., SELECT, INSERT, CREATE).
 * @returns The result object from the 'pg' driver, where 'rows' contains the data.
 */

export async function runQuery(query: string) {
    const client = new Client(dbConfig);

    // 1. Establish the connection through the 'window' (port 5432) we opened in Docker.
    await client.connect();

    try {
        // 2. Hand off the SQL string to the Database
        const result = await client.query(query);
        return result;
    } catch (error) {
        console.error("Database Query Error:", error);
        throw error;

    } finally {
        // 4. Critical: Close the bridge so we don't leak memory or exhaust connections.
        await client.end;
    }
}
