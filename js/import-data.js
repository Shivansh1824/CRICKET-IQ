const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("Error: DATABASE_URL environment variable is missing in .env file.");
  process.exit(1);
}

const METADATA_FILE = path.join(__dirname, '../matches_metadata.json');
const DATA_DIR = path.join(__dirname, '../ipl_male_json');

// Helper to convert team name to short code for slug generation
function getTeamShort(teamName) {
  if (!teamName) return 'unknown';
  const mapping = {
    'sunrisers hyderabad': 'srh',
    'royal challengers bangalore': 'rcb',
    'royal challengers bengaluru': 'rcb',
    'mumbai indians': 'mi',
    'kolkata knight riders': 'kkr',
    'chennai super kings': 'csk',
    'delhi daredevils': 'dd',
    'delhi capitals': 'dc',
    'kings xi punjab': 'kxip',
    'punjab kings': 'pbks',
    'rajasthan royals': 'rr',
    'deccan chargers': 'dc',
    'kochi tuskers kerala': 'ktk',
    'pune warriors': 'pwi',
    'rising pune supergiant': 'rps',
    'rising pune supergiants': 'rps',
    'gujarat lions': 'gl',
    'gujarat titans': 'gt',
    'lucknow super giants': 'lsg'
  };
  const key = teamName.toLowerCase().trim();
  if (mapping[key]) return mapping[key];
  return teamName.split(' ').map(w => w[0]).join('').toLowerCase();
}

async function batchInsertDeliveries(client, deliveriesList) {
  if (deliveriesList.length === 0) return;
  const chunkSize = 2000;
  for (let i = 0; i < deliveriesList.length; i += chunkSize) {
    const chunk = deliveriesList.slice(i, i + chunkSize);
    const valuePlaceholders = [];
    const values = [];
    
    let paramIndex = 1;
    chunk.forEach(d => {
      valuePlaceholders.push(`($${paramIndex}, $${paramIndex+1}, $${paramIndex+2}, $${paramIndex+3}, $${paramIndex+4}, $${paramIndex+5}, $${paramIndex+6}, $${paramIndex+7}, $${paramIndex+8}, $${paramIndex+9}, $${paramIndex+10}, $${paramIndex+11}, $${paramIndex+12}, $${paramIndex+13}, $${paramIndex+14}, $${paramIndex+15}, $${paramIndex+16})`);
      values.push(
        d.match_id,
        d.innings,
        d.over,
        d.ball,
        d.batter,
        d.bowler,
        d.non_striker,
        d.runs_batter,
        d.runs_extras,
        d.runs_total,
        d.wides,
        d.noballs,
        d.byes,
        d.legbyes,
        d.wicket_kind,
        d.player_out,
        d.fielders
      );
      paramIndex += 17;
    });
    
    const query = `
      INSERT INTO public.deliveries (
        match_id, innings, over, ball, batter, bowler, non_striker, 
        runs_batter, runs_extras, runs_total, wides, noballs, byes, 
        legbyes, wicket_kind, player_out, fielders
      ) VALUES ${valuePlaceholders.join(', ')}
    `;
    await client.query(query, values);
  }
}

async function runMigration() {
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Connecting to Supabase database...");
    await client.connect();
    console.log("Connected successfully.");

    // 1. Fetch matches already in DB to avoid duplicate insertion
    const existingRes = await client.query("SELECT cricsheet_id FROM public.matches");
    const existingIds = new Set(existingRes.rows.map(r => r.cricsheet_id));
    console.log(`Found ${existingIds.size} matches already in database.`);

    // 2. Read metadata index
    if (!fs.existsSync(METADATA_FILE)) {
      console.error(`Metadata file not found: ${METADATA_FILE}`);
      process.exit(1);
    }
    const matchesMetadata = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf-8'));
    console.log(`Total matches in index: ${matchesMetadata.length}`);

    // For testing and speed, let's do a limit of 50 matches first to prove the pipeline works.
    // If you want to load everything, we can run it again without this limit.
    const LIMIT = 50; 
    const toProcess = matchesMetadata.filter(m => {
      const cricsheetId = parseInt(m.filename.replace('.json', ''), 10);
      return !existingIds.has(cricsheetId);
    }).slice(0, LIMIT);

    if (toProcess.length === 0) {
      console.log("No new matches to import.");
      return;
    }

    console.log(`Processing ${toProcess.length} matches (capped at test limit of ${LIMIT})...`);

    let importedCount = 0;
    for (const matchMeta of toProcess) {
      const filename = matchMeta.filename;
      const cricsheetId = parseInt(filename.replace('.json', ''), 10);
      const filePath = path.join(DATA_DIR, filename);

      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}, skipping.`);
        continue;
      }

      const matchData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const info = matchData.info;
      const innings = matchData.innings;

      // Extract match variables
      const date = info.dates[0] || '1970-01-01';
      const team1 = info.teams[0] || 'Unknown Team 1';
      const team2 = info.teams[1] || 'Unknown Team 2';
      const venue = info.venue || null;
      const city = info.city || null;
      const season = String(info.season);
      const tossWinner = info.toss ? info.toss.winner : null;
      const tossDecision = info.toss ? info.toss.decision : null;
      const winner = info.outcome ? info.outcome.winner : null;
      const winMarginRuns = (info.outcome && info.outcome.by && info.outcome.by.runs) || 0;
      const winMarginWickets = (info.outcome && info.outcome.by && info.outcome.by.wickets) || 0;
      const playerOfTheMatch = (info.player_of_match && info.player_of_match[0]) || null;

      // Generate Match Slug: 2017-04-05-srh-vs-rcb
      const t1Short = getTeamShort(team1);
      const t2Short = getTeamShort(team2);
      const slug = `${date}-${t1Short}-vs-${t2Short}`;

      // Insert Match
      let matchDbId;
      try {
        const matchInsertRes = await client.query(`
          INSERT INTO public.matches (
            cricsheet_id, match_slug, season, date, team1, team2, venue, city, 
            toss_winner, toss_decision, winner, win_margin_runs, win_margin_wickets, player_of_the_match
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (cricsheet_id) DO UPDATE SET match_slug = EXCLUDED.match_slug
          RETURNING id
        `, [
          cricsheetId, slug, season, date, team1, team2, venue, city,
          tossWinner, tossDecision, winner, winMarginRuns, winMarginWickets, playerOfTheMatch
        ]);
        matchDbId = matchInsertRes.rows[0].id;
      } catch (err) {
        console.error(`Failed to insert match ${cricsheetId}:`, err.message);
        continue;
      }

      // Parse deliveries
      const deliveriesList = [];
      innings.forEach((inn, innIdx) => {
        const innNumber = innIdx + 1;
        if (!inn.overs) return;

        inn.overs.forEach(overObj => {
          const overNum = overObj.over; // 0-indexed
          overObj.deliveries.forEach((del, delIdx) => {
            const ballNum = delIdx + 1; // 1-indexed

            const batter = del.batter;
            const bowler = del.bowler;
            const non_striker = del.non_striker;
            const runs_batter = del.runs.batter || 0;
            const runs_extras = del.runs.extras || 0;
            const runs_total = del.runs.total || 0;

            const wides = (del.extras && del.extras.wides) || 0;
            const noballs = (del.extras && del.extras.noballs) || 0;
            const byes = (del.extras && del.extras.byes) || 0;
            const legbyes = (del.extras && del.extras.legbyes) || 0;

            let wicketKind = null;
            let playerOut = null;
            let fielders = [];

            if (del.wickets && del.wickets.length > 0) {
              const w = del.wickets[0];
              wicketKind = w.kind || null;
              playerOut = w.player_out || null;
              if (w.fielders && w.fielders.length > 0) {
                fielders = w.fielders.map(f => f.name).filter(Boolean);
              }
            }

            deliveriesList.push({
              match_id: matchDbId,
              innings: innNumber,
              over: overNum,
              ball: ballNum,
              batter,
              bowler,
              non_striker,
              runs_batter,
              runs_extras,
              runs_total,
              wides,
              noballs,
              byes,
              legbyes,
              wicket_kind: wicketKind,
              player_out: playerOut,
              fielders
            });
          });
        });
      });

      // Batch insert deliveries
      if (deliveriesList.length > 0) {
        try {
          await batchInsertDeliveries(client, deliveriesList);
        } catch (err) {
          console.error(`Failed to insert deliveries for match ${cricsheetId}:`, err.message);
          // Delete match if deliveries insert fails to maintain integrity
          await client.query("DELETE FROM public.matches WHERE id = $1", [matchDbId]);
          continue;
        }
      }

      importedCount++;
      if (importedCount % 10 === 0 || importedCount === toProcess.length) {
        console.log(`Progress: Imported ${importedCount}/${toProcess.length} matches...`);
      }
    }

    console.log(`Success! Imported ${importedCount} matches successfully.`);

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.end();
  }
}

runMigration();
