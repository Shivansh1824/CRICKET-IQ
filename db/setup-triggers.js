const { Client } = require('pg');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("Error: DATABASE_URL is missing in .env.");
  process.exit(1);
}

const triggerSql = `
-- 1. Alter profiles table to include email
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- 2. Create the synchronization trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- ONLY insert into public.profiles if the user has verified their email (OTP entered)
  IF new.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, username)
    VALUES (
      new.id,
      new.email,
      COALESCE(NULLIF(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1))
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        username = COALESCE(EXCLUDED.username, public.profiles.username);
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the warning but allow signup/update to succeed
  RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Bind the trigger to BOTH INSERT and UPDATE on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;

async function runSetup() {
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Connecting to Supabase Database to set up triggers...");
    await client.connect();
    console.log("Running SQL changes...");
    await client.query(triggerSql);
    console.log("Successfully setup email profile tracking and triggers!");
  } catch (error) {
    console.error("Failed to run SQL triggers:", error.message);
  } finally {
    await client.end();
  }
}

runSetup();
