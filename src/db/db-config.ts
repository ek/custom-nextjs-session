/**
 * Node.js version of database configuration for Vercel deployment
 * This is the equivalent of db.ts but adapted for Node.js runtime
 */
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from '@/db/schema';

const ENV = process.env.NODE_ENV;
const databaseUrl = process.env.DATABASE_URL;

// Throw error if database URL is not available
if (!databaseUrl) {
  throw new Error(`Database URL for environment ${ENV} not set`);
}

// Create SQL client - Fixed: Using neon with proper HTTP options
const sql = neon(databaseUrl);

// Initialize Drizzle ORM - Fixed: Using drizzle-orm/neon-http instead of neon-serverless
export const db = drizzle(sql, { schema });

// Test connection in production to catch issues early
try {
  sql`SELECT 1`.then(() => {
    console.log('✅ Successfully connected to database');
  }).catch(err => {
    console.error('❌ Database connection error:', err);
  });
} catch (err) {
  console.error('❌ Failed to test database connection:', err);
}

// Default export for flexibility
export default db;