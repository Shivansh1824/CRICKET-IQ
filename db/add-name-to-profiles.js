const { Client } = require('pg');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("Error: DATABASE_URL environment variable is missing in .env file.");
  process.exit(1);
}

const client = new Client({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

async function addNameColumn() {
  try {
    console.log("Connecting to Supabase Database...");
    await client.connect();
    console.log("Connected successfully. Adding name column to profiles table...");
    
    await client.query('ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT;');
    
    console.log("Column 'name' added successfully (or already exists).");
  } catch (error) {
    console.error("Error updating database schema:", error);
  } finally {
    await client.end();
  }
}

addNameColumn();
