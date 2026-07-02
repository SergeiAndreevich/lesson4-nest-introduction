import {Pool} from "pg";

export async function initDatabase(pool: Pool){
    await pool.query(
        `CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY,
            login VARCHAR(10) NOT NULL UNIQUE,
            email VARCHAR(100) NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL
            )
    `
    );
}