import { createClient, Client } from '@libsql/client';

let dbClient: Client | null = null;

export function getDb(): Client {
  if (!dbClient) {
    const url = process.env.DATABASE_URL || 'file:./cyberism.db';
    const authToken = process.env.DATABASE_AUTH_TOKEN;

    dbClient = createClient({
      url,
      authToken,
    });

    initDb(dbClient);
  }
  return dbClient;
}

let initialized = false;
export async function initDb(client: Client) {
  if (initialized) return;
  try {
    // Create users table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);

    // Create save slots table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS saves (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        slot_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        summary TEXT,
        character_data TEXT,
        messages TEXT NOT NULL,
        turn_count INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Index for quick user saves lookup
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_saves_user ON saves(user_id, slot_number);
    `);

    initialized = true;
  } catch (err) {
    console.error('Error initializing database schema:', err);
  }
}
