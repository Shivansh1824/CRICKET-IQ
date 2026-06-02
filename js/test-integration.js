const { Client } = require('pg');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("Error: DATABASE_URL is missing in .env file.");
  process.exit(1);
}

async function verifyBackend() {
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Connecting to Supabase...");
    await client.connect();
    console.log("Connected successfully.");

    // 1. Check Matches table
    const matchesRes = await client.query("SELECT COUNT(*) FROM public.matches");
    const count = parseInt(matchesRes.rows[0].count, 10);
    console.log(`Verification: Found ${count} matches in matches table.`);

    if (count === 0) {
      console.error("Verification failed: No matches found in database.");
      process.exit(1);
    }

    // 2. Fetch one match details
    const matchRes = await client.query("SELECT * FROM public.matches LIMIT 1");
    const sampleMatch = matchRes.rows[0];
    console.log(`Sample Match Selected: ID ${sampleMatch.id} | ${sampleMatch.team1} vs ${sampleMatch.team2} on ${sampleMatch.date}`);

    // 3. Check Deliveries for this match
    const deliveriesRes = await client.query(
      "SELECT COUNT(*) FROM public.deliveries WHERE match_id = $1",
      [sampleMatch.id]
    );
    const deliveriesCount = parseInt(deliveriesRes.rows[0].count, 10);
    console.log(`Verification: Found ${deliveriesCount} deliveries for sample match.`);

    if (deliveriesCount === 0) {
      console.error("Verification failed: Deliveries table is empty for the match.");
      process.exit(1);
    }

    // 4. Fetch sample deliveries to check details
    const sampleDelsRes = await client.query(
      "SELECT * FROM public.deliveries WHERE match_id = $1 LIMIT 5",
      [sampleMatch.id]
    );
    console.log("Sample Ball-by-ball Deliveries:");
    sampleDelsRes.rows.forEach((del, idx) => {
      console.log(`  Ball ${idx+1}: Innings ${del.innings} | Over ${del.over}.${del.ball} | Batter: ${del.batter} | Bowler: ${del.bowler} | Total runs: ${del.runs_total}`);
    });

    console.log("\nAll checks PASSED! Supabase database setup and migration are fully operational.");
  } catch (err) {
    console.error("Verification failed with error:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verifyBackend();
