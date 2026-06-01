document.addEventListener('DOMContentLoaded', () => {
    const matchSelector = document.getElementById('match-selector');
    const loadMatchBtn = document.getElementById('load-match');
    const generateInsightsBtn = document.getElementById('generate-insights');

    let currentMatchData = null;
    let runsChartInstance = null;
    let wicketsChartInstance = null;

    // Load matches index
    fetch('matches.json')
        .then(response => response.json())
        .then(matches => {
            matchSelector.innerHTML = '<option value="" disabled selected>Select a match</option>';
            // Take the first 100 to avoid freezing the DOM, or just all of them. Let's do all for completeness
            matches.slice(0, 200).forEach(match => {
                const option = document.createElement('option');
                option.value = match;
                option.textContent = match.replace('.json', '');
                matchSelector.appendChild(option);
            });
            matchSelector.addEventListener('change', () => {
                loadMatchBtn.disabled = false;
            });
        })
        .catch(err => {
            console.error("Failed to load matches list. Make sure you run this on a local server.", err);
            matchSelector.innerHTML = '<option value="" disabled selected>Error loading matches</option>';
        });

    loadMatchBtn.addEventListener('click', () => {
        const selectedMatch = matchSelector.value;
        if (!selectedMatch) return;

        loadMatchBtn.textContent = 'Loading...';
        loadMatchBtn.disabled = true;

        fetch(`ipl_male_json/${selectedMatch}`)
            .then(res => res.json())
            .then(data => {
                currentMatchData = data;
                processMatchData(data);
                document.getElementById('charts-container').style.display = 'grid';
                document.getElementById('stats-container').style.display = 'grid';
                generateInsightsBtn.disabled = false;
                loadMatchBtn.textContent = 'Load Analytics';
                loadMatchBtn.disabled = false;
            })
            .catch(err => {
                console.error(err);
                alert("Failed to load match data.");
                loadMatchBtn.textContent = 'Load Analytics';
                loadMatchBtn.disabled = false;
            });
    });

    function processMatchData(data) {
        const info = data.info;
        const innings = data.innings;

        // Header
        const matchHeader = document.getElementById('match-header');
        const teams = info.teams.join(' vs ');
        const venue = info.venue || info.city || 'Unknown Venue';
        const date = info.dates[0] || 'Unknown Date';
        const result = info.outcome.winner ? `${info.outcome.winner} won by ${info.outcome.by.runs ? info.outcome.by.runs + ' runs' : info.outcome.by.wickets + ' wickets'}` : 'No result';
        
        matchHeader.innerHTML = `
            <h2 class="match-title">${teams}</h2>
            <div class="match-meta">
                <span>📍 ${venue}</span>
                <span>📅 ${date}</span>
                <span>🏆 ${result}</span>
            </div>
        `;

        // Analytics Data Structures
        const teamsData = {};
        const batters = {};
        const bowlers = {};
        const milestones = [];

        innings.forEach(inn => {
            const team = inn.team;
            if (!teamsData[team]) {
                teamsData[team] = {
                    runsPerOver: [],
                    cumulativeRuns: [],
                    wicketsTimeline: [],
                    totalRuns: 0,
                    totalWickets: 0
                };
            }

            let cumRuns = 0;
            inn.overs.forEach(overObj => {
                let overRuns = 0;
                let overNum = overObj.over + 1; // 1-indexed

                overObj.deliveries.forEach(ball => {
                    // Batting stats
                    const batterName = ball.batter;
                    if (!batters[batterName]) batters[batterName] = { runs: 0, balls: 0, team: team, out: false };
                    
                    if (!ball.extras || !ball.extras.wides) {
                        batters[batterName].balls++;
                    }
                    batters[batterName].runs += ball.runs.batter;

                    // Bowling stats
                    const bowlerName = ball.bowler;
                    if (!bowlers[bowlerName]) bowlers[bowlerName] = { wickets: 0, runs: 0, balls: 0 };
                    
                    if (!ball.extras || (!ball.extras.legbyes && !ball.extras.byes)) {
                        bowlers[bowlerName].runs += ball.runs.total;
                    }
                    if (!ball.extras || (!ball.extras.wides && !ball.extras.noballs)) {
                        bowlers[bowlerName].balls++;
                    }

                    // Wickets
                    if (ball.wickets) {
                        ball.wickets.forEach(w => {
                            teamsData[team].totalWickets++;
                            teamsData[team].wicketsTimeline.push({
                                x: overNum,
                                y: cumRuns + overRuns,
                                label: w.player_out
                            });
                            if (w.kind !== 'run out') {
                                bowlers[bowlerName].wickets++;
                            }
                            if(batters[w.player_out]) batters[w.player_out].out = true;
                        });
                    }

                    overRuns += ball.runs.total;
                });

                cumRuns += overRuns;
                teamsData[team].runsPerOver.push(overRuns);
                teamsData[team].cumulativeRuns.push(cumRuns);
                teamsData[team].totalRuns = cumRuns;
            });
        });

        // Top Batters
        const topBatters = Object.keys(batters).map(name => ({
            name, ...batters[name]
        })).sort((a, b) => b.runs - a.runs).slice(0, 5);

        // Top Bowlers
        const topBowlers = Object.keys(bowlers).map(name => ({
            name, ...bowlers[name]
        })).sort((a, b) => b.wickets !== a.wickets ? b.wickets - a.wickets : a.runs - b.runs).slice(0, 5);

        // Milestones
        Object.keys(batters).forEach(b => {
            if (batters[b].runs >= 100) milestones.push(`🏏 ${b} scored a Century (${batters[b].runs})`);
            else if (batters[b].runs >= 50) milestones.push(`🏏 ${b} scored a Half-Century (${batters[b].runs})`);
        });
        Object.keys(bowlers).forEach(b => {
            if (bowlers[b].wickets >= 5) milestones.push(`🎯 ${b} took a 5-fer (${bowlers[b].wickets} wkts)`);
            else if (bowlers[b].wickets >= 3) milestones.push(`🎯 ${b} took ${bowlers[b].wickets} wickets`);
        });

        renderTopPlayers('top-batters', topBatters, p => `${p.runs} (${p.balls})`);
        renderTopPlayers('top-bowlers', topBowlers, p => `${p.wickets}-${p.runs}`);
        
        const mlUl = document.getElementById('milestones');
        mlUl.innerHTML = milestones.length > 0 
            ? milestones.map(m => `<li>${m}</li>`).join('')
            : '<li>No major milestones.</li>';

        // Fantasy Picks (Simple heuristic)
        let fantasyPlayers = [];
        Object.keys(batters).forEach(name => {
            let pts = batters[name].runs * 1;
            fantasyPlayers.push({name, points: pts, role: 'Batter'});
        });
        Object.keys(bowlers).forEach(name => {
            let pts = bowlers[name].wickets * 25;
            let existing = fantasyPlayers.find(f => f.name === name);
            if (existing) {
                existing.points += pts;
                existing.role = 'All-Rounder';
            } else {
                fantasyPlayers.push({name, points: pts, role: 'Bowler'});
            }
        });
        fantasyPlayers.sort((a, b) => b.points - a.points);
        const topFantasy = fantasyPlayers.slice(0, 5);
        document.getElementById('fantasy-list').innerHTML = topFantasy.map(f => `
            <li>
                <div><strong>${f.name}</strong> <span class="placeholder-text">(${f.role})</span></div>
                <div class="fantasy-score">${f.points} pts</div>
            </li>
        `).join('');

        renderCharts(teamsData);
    }

    function renderTopPlayers(id, players, formatFn) {
        document.getElementById(id).innerHTML = players.map(p => `
            <li><span>${p.name}</span> <strong>${formatFn(p)}</strong></li>
        `).join('');
    }

    function renderCharts(teamsData) {
        const teamNames = Object.keys(teamsData);
        if (teamNames.length === 0) return;

        const maxOvers = Math.max(...teamNames.map(t => teamsData[t].cumulativeRuns.length));
        const labels = Array.from({length: maxOvers}, (_, i) => `Ov ${i+1}`);

        // Destroy previous charts
        if (runsChartInstance) runsChartInstance.destroy();
        if (wicketsChartInstance) wicketsChartInstance.destroy();

        const runsCtx = document.getElementById('runsChart').getContext('2d');
        runsChartInstance = new Chart(runsCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: teamNames.map((team, idx) => ({
                    label: team,
                    data: teamsData[team].cumulativeRuns,
                    borderColor: idx === 0 ? '#10b981' : '#3b82f6',
                    tension: 0.3,
                    fill: false
                }))
            },
            options: { responsive: true, plugins: { legend: { labels: { color: '#fff' } } } }
        });

        const wicketsCtx = document.getElementById('wicketsChart').getContext('2d');
        wicketsChartInstance = new Chart(wicketsCtx, {
            type: 'scatter',
            data: {
                datasets: teamNames.map((team, idx) => ({
                    label: `${team} Wickets`,
                    data: teamsData[team].wicketsTimeline,
                    backgroundColor: idx === 0 ? '#ef4444' : '#f59e0b',
                    pointRadius: 6
                }))
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `Wicket: ${ctx.raw.label} (Score: ${ctx.raw.y})`
                        }
                    },
                    legend: { labels: { color: '#fff' } }
                },
                scales: {
                    x: { title: { display: true, text: 'Overs', color: '#fff' }, min: 0, max: 20 },
                    y: { title: { display: true, text: 'Runs', color: '#fff' }, min: 0 }
                }
            }
        });
    }

    // Phase 3: AI Insights & Live Widget
    // We will just do the Live widget mock/fetch here and AI mock/fetch
    
    // Live Widget
    const liveContent = document.getElementById('live-content');
    const refreshLiveBtn = document.getElementById('refresh-live');

    function fetchLiveScore() {
        liveContent.innerHTML = 'Fetching...';
        // Note: Replace with actual CricAPI if API key is provided
        // Since no API key is present, falling back to mock data
        setTimeout(() => {
            liveContent.innerHTML = `
                <div><strong>CSK</strong> 185/4 (18.2)</div>
                <div><strong>MI</strong> yet to bat</div>
                <div class="placeholder-text" style="margin-top:5px; font-size:0.8rem;">Status: CSK elected to bat</div>
            `;
        }, 1000);
    }
    fetchLiveScore();
    refreshLiveBtn.addEventListener('click', fetchLiveScore);

    // AI Analyst
    generateInsightsBtn.addEventListener('click', () => {
        const aiContent = document.getElementById('ai-content');
        aiContent.innerHTML = 'Analyzing match data with Gemini AI... <span class="pulse" style="display:inline-block"></span>';
        
        // Simulating AI response since no PHP/API Key is provided. 
        // In a real hackathon, we would fetch('/api/gemini.php', { method: 'POST', body: JSON.stringify(stats) })
        setTimeout(() => {
            const teamNames = Object.keys(currentMatchData.info.teams);
            aiContent.innerHTML = `
                <p><strong>💡 Key Turning Point:</strong> The flurry of early wickets put the chasing team on the backfoot, making the required run rate unmanageable in the middle overs.</p>
                <p style="margin-top:10px;"><strong>🎯 Expert Fantasy Take:</strong> Selecting the top order batters along with death-over specialists proved to be the winning combination for this match.</p>
            `;
        }, 2000);
    });

});
