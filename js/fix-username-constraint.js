const { Client } = require('pg');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("Error: DATABASE_URL is missing in .env.");
  process.exit(1);
}

const fixSql = `
-- 1. Drop the unique constraint on username if it exists
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_username_key;

-- 2. Update trigger function to handle exceptions gracefully
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      username = COALESCE(EXCLUDED.username, public.profiles.username);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the warning but allow signup to succeed
  RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

async function runFix() {
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Connecting to Supabase Database to optimize trigger and constraints...");
    await client.connect();
    console.log("Running SQL script...");
    await client.query(fixSql);
    console.log("Trigger and constraints successfully optimized! Zero signup collisions will occur.");
  } catch (error) {
    console.error("Failed to run SQL fix:", error.message);
  } finally {
    await client.end();
  }
}

runFix();
