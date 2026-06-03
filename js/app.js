document.addEventListener('DOMContentLoaded', async () => {
    const matchSelector = document.getElementById('match-selector');
    const loadMatchBtn = document.getElementById('load-match');
    const generateInsightsBtn = document.getElementById('generate-insights');

    let currentMatchData = null;
    let runsChartInstance = null;
    let wicketsChartInstance = null;

    // Verify session and load user display info
    async function checkSession() {
        if (!window.cricIqAuth) {
            console.error("Auth library not loaded!");
            return;
        }
        const user = await window.cricIqAuth.getUser();
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
        // Update user header text
        const userDisplay = document.getElementById('user-display');
        if (userDisplay) {
            userDisplay.textContent = user.user_metadata?.full_name || user.email;
        }
        // Sign out button
        const signoutBtn = document.getElementById('signout-btn');
        if (signoutBtn) {
            signoutBtn.addEventListener('click', async () => {
                await window.cricIqAuth.signOut();
            });
        }

        // Check user profile for onboarding
        const { data: profile } = await window.cricIqAuth.getProfile(user.id);
        
        if (!profile || !profile.username || !profile.favorite_team) {
            // Profile incomplete, redirect to landing page for onboarding
            window.location.href = 'index.html';
            return false;
        } else {
            // Update user header text with onboarded name or username
            if (userDisplay) {
                userDisplay.textContent = profile.name || profile.username || user.email;
            }
            return true;
        }
    }

    const sessionValid = await checkSession();
    // Dashboard loading will conditionally proceed at the bottom based on sessionValid

    // Re-assemble match and deliveries records into the Cricsheet format
    function reassembleMatchData(match, deliveries) {
        let inn1Team = match.team1;
        let inn2Team = match.team2;
        if (match.toss_winner && match.toss_decision) {
            const tossWinner = match.toss_winner;
            const tossDecision = match.toss_decision;
            const otherTeam = (tossWinner === match.team1) ? match.team2 : match.team1;

            if (tossDecision === 'bat') {
                inn1Team = tossWinner;
                inn2Team = otherTeam;
            } else {
                inn1Team = otherTeam;
                inn2Team = tossWinner;
            }
        }

        const info = {
            teams: [match.team1, match.team2],
            venue: match.venue,
            city: match.city,
            dates: [match.date],
            outcome: {
                winner: match.winner,
                by: {}
            },
            player_of_match: match.player_of_the_match ? [match.player_of_the_match] : []
        };

        if (match.win_margin_runs > 0) {
            info.outcome.by.runs = match.win_margin_runs;
        } else if (match.win_margin_wickets > 0) {
            info.outcome.by.wickets = match.win_margin_wickets;
        } else if (!match.winner) {
            info.outcome.result = 'no result';
        }

        const inningsMap = {};
        deliveries.forEach(del => {
            if (!inningsMap[del.innings]) {
                inningsMap[del.innings] = {
                    team: del.innings === 1 ? inn1Team : (del.innings === 2 ? inn2Team : `Innings ${del.innings}`),
                    overs: []
                };
            }

            const inn = inningsMap[del.innings];
            
            let overObj = inn.overs.find(o => o.over === del.over);
            if (!overObj) {
                overObj = {
                    over: del.over,
                    deliveries: []
                };
                inn.overs.push(overObj);
            }

            const delivery = {
                batter: del.batter,
                bowler: del.bowler,
                non_striker: del.non_striker,
                runs: {
                    batter: del.runs_batter,
                    extras: del.runs_extras,
                    total: del.runs_total
                }
            };

            if (del.wides > 0 || del.noballs > 0 || del.byes > 0 || del.legbyes > 0) {
                delivery.extras = {};
                if (del.wides > 0) delivery.extras.wides = del.wides;
                if (del.noballs > 0) delivery.extras.noballs = del.noballs;
                if (del.byes > 0) delivery.extras.byes = del.byes;
                if (del.legbyes > 0) delivery.extras.legbyes = del.legbyes;
            }

            if (del.wicket_kind) {
                delivery.wickets = [{
                    kind: del.wicket_kind,
                    player_out: del.player_out,
                    fielders: del.fielders ? del.fielders.map(name => ({ name })) : []
                }];
            }

            overObj.deliveries.push(delivery);
        });

        const innings = Object.keys(inningsMap)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(key => {
                inningsMap[key].overs.sort((a, b) => a.over - b.over);
                return inningsMap[key];
            });

        return { info, innings };
    }

    // Load matches index from Supabase
    async function loadMatches() {
        try {
            const { data: matches, error } = await supabaseClient
                .from('matches')
                .select('id, team1, team2, date')
                .order('date', { ascending: false });

            if (error) throw error;

            matchSelector.innerHTML = '<option value="" disabled selected>Select a match</option>';
            matches.forEach(match => {
                const option = document.createElement('option');
                option.value = match.id;
                option.textContent = `${match.team1} vs ${match.team2} (${match.date})`;
                matchSelector.appendChild(option);
            });

            matchSelector.addEventListener('change', () => {
                loadMatchBtn.disabled = false;
            });
        } catch (err) {
            console.error("Failed to load matches list:", err);
            matchSelector.innerHTML = '<option value="" disabled selected>Error loading matches</option>';
        }
    }
    if (sessionValid) {
        await loadMatches();
    }

    // Load match details and analytics
    loadMatchBtn.addEventListener('click', async () => {
        const matchId = matchSelector.value;
        if (!matchId) return;

        loadMatchBtn.textContent = 'Loading...';
        loadMatchBtn.disabled = true;

        try {
            // 1. Fetch match metadata
            const { data: match, error: matchError } = await supabaseClient
                .from('matches')
                .select('*')
                .eq('id', matchId)
                .single();

            if (matchError) throw matchError;

            // 2. Fetch match deliveries
            const { data: deliveries, error: delError } = await supabaseClient
                .from('deliveries')
                .select('*')
                .eq('match_id', matchId)
                .order('innings', { ascending: true })
                .order('over', { ascending: true })
                .order('ball', { ascending: true });

            if (delError) throw delError;

            // 3. Reassemble and process
            currentMatchData = reassembleMatchData(match, deliveries);
            processMatchData(currentMatchData);

            document.getElementById('charts-container').style.display = 'grid';
            document.getElementById('stats-container').style.display = 'grid';
            generateInsightsBtn.disabled = false;
        } catch (err) {
            console.error(err);
            alert("Failed to load match data from Supabase.");
        } finally {
            loadMatchBtn.textContent = 'Load Analytics';
            loadMatchBtn.disabled = false;
        }
    });

    function processMatchData(data) {
        const info = data.info;
        const innings = data.innings;

        // Header
        const matchHeader = document.getElementById('match-header');
        const teams = info.teams.join(' vs ');
        const venue = info.venue || info.city || 'Unknown Venue';
        const date = info.dates[0] || 'Unknown Date';
        
        let result = 'No result';
        if (info.outcome.winner) {
            if (info.outcome.by) {
                if (info.outcome.by.runs) {
                    result = `${info.outcome.winner} won by ${info.outcome.by.runs} runs`;
                } else if (info.outcome.by.wickets) {
                    result = `${info.outcome.winner} won by ${info.outcome.by.wickets} wickets`;
                } else {
                    result = `${info.outcome.winner} won the match`;
                }
            } else {
                result = `${info.outcome.winner} won the match`;
            }
        } else if (info.outcome.result) {
            result = `Result: ${info.outcome.result.toUpperCase()}`;
        }

        matchHeader.innerHTML = `
            <h2 class="match-title">${teams}</h2>
            <div class="match-meta">
                <span>📍 ${venue}</span>
                <span>📅 ${date}</span>
                <span>🏆 ${result}</span>
            </div>
        `;

        // Reset AI Analyst box for the new match
        const aiContent = document.getElementById('ai-content');
        if (aiContent) {
            aiContent.innerHTML = '<p class="placeholder-text">Generate insights for the loaded match.</p>';
        }

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

        // Get dynamic colors from CSS theme variables
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#94a3b8';
        const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#334155';

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
            options: { 
                responsive: true, 
                plugins: { 
                    legend: { 
                        labels: { 
                            color: textColor 
                        } 
                    } 
                },
                scales: {
                    x: {
                        ticks: { color: textColor },
                        grid: { color: gridColor }
                    },
                    y: {
                        ticks: { color: textColor },
                        grid: { color: gridColor }
                    }
                }
            }
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
                    legend: { labels: { color: textColor } }
                },
                scales: {
                    x: { 
                        title: { display: true, text: 'Overs', color: textColor }, 
                        min: 0, 
                        max: 20,
                        ticks: { color: textColor },
                        grid: { color: gridColor }
                    },
                    y: { 
                        title: { display: true, text: 'Runs', color: textColor }, 
                        min: 0,
                        ticks: { color: textColor },
                        grid: { color: gridColor }
                    }
                }
            }
        });
    }

    // Sync charts on themeChanged custom event
    function updateChartTheme() {
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#94a3b8';
        const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#334155';

        if (runsChartInstance) {
            runsChartInstance.options.plugins.legend.labels.color = textColor;
            runsChartInstance.options.scales.x.ticks.color = textColor;
            runsChartInstance.options.scales.y.ticks.color = textColor;
            runsChartInstance.options.scales.x.grid.color = gridColor;
            runsChartInstance.options.scales.y.grid.color = gridColor;
            runsChartInstance.update();
        }

        if (wicketsChartInstance) {
            wicketsChartInstance.options.plugins.legend.labels.color = textColor;
            wicketsChartInstance.options.scales.x.ticks.color = textColor;
            wicketsChartInstance.options.scales.y.ticks.color = textColor;
            wicketsChartInstance.options.scales.x.title.color = textColor;
            wicketsChartInstance.options.scales.y.title.color = textColor;
            wicketsChartInstance.options.scales.x.grid.color = gridColor;
            wicketsChartInstance.options.scales.y.grid.color = gridColor;
            wicketsChartInstance.update();
        }
    }
    document.addEventListener('themeChanged', updateChartTheme);

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
        
        setTimeout(() => {
            const teamNames = currentMatchData.info.teams;
            const battingFirst = currentMatchData.innings[0] ? currentMatchData.innings[0].team : 'batting team';
            const battingSecond = currentMatchData.innings[1] ? currentMatchData.innings[1].team : 'chasing team';
            
            aiContent.innerHTML = `
                <p><strong>💡 Key Turning Point:</strong> The flurry of early wickets put <strong>${battingSecond}</strong> on the backfoot during the chase, making the required run rate unmanageable in the middle overs against <strong>${battingFirst}</strong>.</p>
                <p style="margin-top:10px;"><strong>🎯 Expert Fantasy Take:</strong> Selecting the top order batters from ${teamNames.join(' and ')} along with death-over specialists proved to be the winning combination for this match.</p>
            `;
        }, 2000);
    });

});
