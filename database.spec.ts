import { test, expect} from '@playwright/test';
import { runQuery } from './db-client';

test('Data Flow: Insert a task and verify it exists', async () => {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS playwright_tasks (
            id SERIAL PRIMARY KEY,
            task_name TEXT NOT NULL,
            completed BOOLEAN DEFAULT FALSE
        );
    `;
    
    await runQuery(createTableSQL);
    console.log('Successfully created the playwright_tasks table!');

    const taskName = `Task created at ${new Date().toISOString()}`;
    
    // 1. Insert data, injects dynamic JavaScript data into a static SQL string.
    await runQuery(`INSERT INTO playwright_tasks (task_name) VALUES ('${taskName}');`);
    
    // 2. Select data to verify
    /**
     * The Result Object (res): When you run a SELECT,
     * the pg driver returns a massive object.
     * We specifically look at result.rows, which is an Array of Objects.
     * Each object in that array represents a row in your table.
     */
    const result = await runQuery(`SELECT * FROM playwright_tasks WHERE task_name = '${taskName}';`);
    
    // 3. Playwright Assertion
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].task_name).toBe(taskName);
    
    console.log(`Verified: ${result.rows[0].task_name} is in the database!`);
});