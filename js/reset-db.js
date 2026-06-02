const { Client } = require('pg');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is missing.");
  process.exit(1);
}

async function resetDb() {
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Connecting to Supabase...");
    await client.connect();
    console.log("Resetting matches and deliveries tables...");
    await client.query("TRUNCATE TABLE public.matches, public.deliveries RESTART IDENTITY CASCADE");
    console.log("Database tables reset successfully.");
  } catch (err) {
    console.error("Reset failed:", err.message);
  } finally {
    await client.end();
  }
}

resetDb();
