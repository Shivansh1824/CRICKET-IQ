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
    rejectUnauthorized: false // Required for secure SSL connection to Supabase
  }
});

const schemaSql = `
-- 1. Create matches table
CREATE TABLE IF NOT EXISTS public.matches (
    id SERIAL PRIMARY KEY,
    cricsheet_id INT UNIQUE,
    match_slug VARCHAR(255) UNIQUE,
    season VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    team1 VARCHAR(100) NOT NULL,
    team2 VARCHAR(100) NOT NULL,
    venue VARCHAR(255),
    city VARCHAR(100),
    toss_winner VARCHAR(100),
    toss_decision VARCHAR(50),
    winner VARCHAR(100),
    win_margin_runs INT DEFAULT 0,
    win_margin_wickets INT DEFAULT 0,
    player_of_the_match VARCHAR(100)
);

-- 2. Create deliveries table
CREATE TABLE IF NOT EXISTS public.deliveries (
    id BIGSERIAL PRIMARY KEY,
    match_id INT REFERENCES public.matches(id) ON DELETE CASCADE,
    innings INT NOT NULL,
    over INT NOT NULL,
    ball INT NOT NULL,
    batter VARCHAR(100) NOT NULL,
    bowler VARCHAR(100) NOT NULL,
    non_striker VARCHAR(100) NOT NULL,
    runs_batter INT DEFAULT 0,
    runs_extras INT DEFAULT 0,
    runs_total INT DEFAULT 0,
    wides INT DEFAULT 0,
    noballs INT DEFAULT 0,
    byes INT DEFAULT 0,
    legbyes INT DEFAULT 0,
    wicket_kind VARCHAR(50),
    player_out VARCHAR(100),
    fielders TEXT[]
);

-- 3. Create profiles table (linked to Supabase auth.users for login profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    updated_at TIMESTAMP WITH TIME ZONE,
    username TEXT UNIQUE,
    favorite_team TEXT,
    avatar_url TEXT
);

-- 4. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_matches_season ON public.matches(season);
CREATE INDEX IF NOT EXISTS idx_matches_slug ON public.matches(match_slug);
CREATE INDEX IF NOT EXISTS idx_matches_teams ON public.matches(team1, team2);
CREATE INDEX IF NOT EXISTS idx_deliveries_match ON public.deliveries(match_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_batter ON public.deliveries(batter);
CREATE INDEX IF NOT EXISTS idx_deliveries_bowler ON public.deliveries(bowler);
`;

async function runSetup() {
  try {
    console.log("Connecting to Supabase Database...");
    await client.connect();
    console.log("Connected successfully. Initializing database schema...");
    
    await client.query(schemaSql);
    console.log("Database tables and indexes created successfully!");
  } catch (error) {
    console.error("Error setting up database schema:", error);
  } finally {
    await client.end();
  }
}

runSetup();
