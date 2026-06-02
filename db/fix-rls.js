const { Client } = require('pg');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("Error: DATABASE_URL is missing in .env.");
  process.exit(1);
}

const rlsSql = `
-- 1. Enable RLS and setup SELECT/UPDATE policies on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on profiles" ON public.profiles;
CREATE POLICY "Allow public read access on profiles" 
ON public.profiles FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
CREATE POLICY "Allow users to update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 2. Enable RLS and setup SELECT policy on matches
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read access on matches" ON public.matches;
CREATE POLICY "Allow authenticated read access on matches" 
ON public.matches FOR SELECT 
TO authenticated 
USING (true);

-- 3. Enable RLS and setup SELECT policy on deliveries
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read access on deliveries" ON public.deliveries;
CREATE POLICY "Allow authenticated read access on deliveries" 
ON public.deliveries FOR SELECT 
TO authenticated 
USING (true);
`;

async function runRlsSetup() {
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Connecting to Supabase Database to set up RLS policies...");
    await client.connect();
    console.log("Running SQL scripts for security policies...");
    await client.query(rlsSql);
    console.log("Successfully enabled RLS and configured clean access policies!");
  } catch (error) {
    console.error("Failed to setup RLS policies:", error.message);
  } finally {
    await client.end();
  }
}

runRlsSetup();
