document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', filterScores);

    const leagues = [
        { name: 'MLB', apiUrl: 'http://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard', events: [] },
        { name: 'NBA', apiUrl: 'http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard', events: [] },
        { name: 'NCAA Men\'s Basketball', apiUrl: 'http://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard', events: [] },
        { name: 'NCAA Women\'s Basketball', apiUrl: 'http://site.api.espn.com/apis/site/v2/sports/basketball/womens-college-basketball/scoreboard', events: [] },
        { name: 'NFL', apiUrl: 'http://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard', events: [] }
    ];

    leagues.forEach(league => fetchScores(league));

    function fetchScores(league) {
        fetch(league.apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.events) {
                    league.events = data.events;
                    league.events.forEach(event => {
                        event.league = league.name; // Adding league name to event object
                    });
                    displayScores(league.name, league.events);
                }
            })
            .catch(error => console.error('Error fetching ' + league.name + ' scores:', error));
    }

    function displayScores(leagueName, events) {
        const scoresContainer = document.getElementById('scores-container');
        scoresContainer.innerHTML += `<h2 class="league-name">${leagueName} Live Scores</h2>`;
        events.forEach(event => {
            const homeTeam = event.competitions[0].competitors[0];
            const awayTeam = event.competitions[0].competitors[1];
            const gameStatus = getGameStatus(event);

            let scoreDisplay = '';
            let statusDisplay = '';

            if (gameStatus === 'Final') {
                scoreDisplay = `${awayTeam.team.name} ${awayTeam.score !== null ? awayTeam.score : ''} - ${homeTeam.team.name} ${homeTeam.score !== null ? homeTeam.score : ''}`;
                statusDisplay = 'FINAL';
            } else if (gameStatus === 'In Progress') {
                scoreDisplay = `${awayTeam.team.name} ${awayTeam.score !== null ? awayTeam.score : ''} - ${homeTeam.team.name} ${homeTeam.score !== null ? homeTeam.score : ''}`;
                if (event.league === 'MLB') {
                    statusDisplay = `Inning: ${event.status.period}`;
                } else if (event.league === 'NBA') {
                    statusDisplay = `Quarter: ${event.status.period}`;
                    // Check if there is time remaining
                    if (event.status.type.detail === 'Quarter' && event.status.displayClock) {
                        statusDisplay += ` - Time Remaining: ${event.status.displayClock}`;
                    }
                } else {
                    statusDisplay = `Quarter: ${event.status.period}`;
                }
            } else if (gameStatus === 'Scheduled') {
                const scheduledDate = new Date(event.date);
                const formattedTime = getLocalTime(scheduledDate, 'America/New_York');
                statusDisplay = `Start Time: ${formattedTime}`;
            }

            const scoreHTML = `
                <div class="score">
                    <p class="team-name">
                        <img class="team-logo" src="${awayTeam.team.logo}" alt="${awayTeam.team.name}">
                        ${awayTeam.team.name} ${scoreDisplay !== '' ? awayTeam.score !== null ? awayTeam.score : '' : ''}
                    </p>
                    <p class="team-name">
                        <img class="team-logo" src="${homeTeam.team.logo}" alt="${homeTeam.team.name}">
                        ${homeTeam.team.name} ${scoreDisplay !== '' ? homeTeam.score !== null ? homeTeam.score : '' : ''}
                    </p>
                    <p class="game-status">${statusDisplay}</p>
                </div>`;
            scoresContainer.innerHTML += scoreHTML;
        });
    }

    function getGameStatus(event) {
        const status = event.status;
        if (status.type.state === 'post') {
            return 'Final';
        } else if (status.type.state === 'pre') {
            return 'Scheduled';
        } else if (status.type.state === 'in') {
            return 'In Progress';
        }
    }

    function filterScores() {
        const searchTerm = this.value.trim().toLowerCase();
        const filteredEvents = [];
        leagues.forEach(league => {
            league.events.forEach(event => {
                const homeTeamName = event.competitions[0].competitors[0].team.name.toLowerCase();
                const awayTeamName = event.competitions[0].competitors[1].team.name.toLowerCase();
                if (homeTeamName.includes(searchTerm) || awayTeamName.includes(searchTerm)) {
                    filteredEvents.push(event);
                }
            });
        });
        displayFilteredScores(filteredEvents);
    }

    function displayFilteredScores(events) {
        const scoresContainer = document.getElementById('scores-container');
        scoresContainer.innerHTML = ''; // Clear previous scores
        events.forEach(event => {
            const homeTeam = event.competitions[0].competitors[0];
            const awayTeam = event.competitions[0].competitors[1];
            const gameStatus = getGameStatus(event);

            let scoreDisplay = '';
            let statusDisplay = '';

            if (gameStatus === 'Final') {
                scoreDisplay = `${awayTeam.team.name} ${awayTeam.score !== null ? awayTeam.score : ''} - ${homeTeam.team.name} ${homeTeam.score !== null ? homeTeam.score : ''}`;
                statusDisplay = 'FINAL';
            } else if (gameStatus === 'In Progress') {
                scoreDisplay = `${awayTeam.team.name} ${awayTeam.score !== null ? awayTeam.score : ''} - ${homeTeam.team.name} ${homeTeam.score !== null ? homeTeam.score : ''}`;
                if (event.league === 'MLB') {
                    statusDisplay = `Inning: ${event.status.period}`;
                } else if (event.league === 'NBA') {
                    statusDisplay = `Quarter: ${event.status.period}`;

                } else {
                    statusDisplay = `Quarter: ${event.status.period}`;
                }
            } else if (gameStatus === 'Scheduled') {
                const scheduledDate = new Date(event.date);
                const formattedTime = getLocalTime(scheduledDate, 'America/New_York');
                statusDisplay = `Start Time: ${formattedTime}`;
            }

            const scoreHTML = `
                <div class="score">
                    <p class="team-name">
                        <img class="team-logo" src="${awayTeam.team.logo}" alt="${awayTeam.team.name}">
                        ${awayTeam.team.name} ${scoreDisplay !== '' ? awayTeam.score !== null ? awayTeam.score : '' : ''}
                    </p>
                    <p class="team-name">
                        <img class="team-logo" src="${homeTeam.team.logo}" alt="${homeTeam.team.name}">
                        ${homeTeam.team.name} ${scoreDisplay !== '' ? homeTeam.score !== null ? homeTeam.score : '' : ''}
                    </p>
                    <p class="game-status">${statusDisplay}</p>
                </div>`;
            scoresContainer.innerHTML += scoreHTML;
        });
    }

    function getLocalTime(date, timeZone) {
        return date.toLocaleString('en-US', { timeZone: timeZone, hour12: true, hour: 'numeric', minute: 'numeric' });
    } 
});