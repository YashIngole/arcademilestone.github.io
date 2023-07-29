// Function to fetch leaderboard data and update the table
function fetchLeaderboardData() {
    fetch('/leaderboard')
        .then(response => response.json())
        .then(data => {
            updateLeaderboard(data);
        })
        .catch(error => {
            console.error('Error fetching leaderboard data:', error);
        });
}

// Function to update the leaderboard table with the new data
function updateLeaderboard(data) {
    const leaderboardTable = document.getElementById('leaderboard-table');
    leaderboardTable.innerHTML = ''; // Clear existing data
    data.forEach((entry, index) => {
        const row = leaderboardTable.insertRow();
        const rankCell = row.insertCell(0);
        const nameCell = row.insertCell(1);
        const scoreCell = row.insertCell(2);
        const gameCountCell = row.insertCell(3);
        const skillBadgeCell = row.insertCell(4);
        const triviaQuestCell = row.insertCell(5);
        rankCell.textContent = index + 1;
        nameCell.textContent = entry.full_name; // Use entry.full_name instead of entry['Full Name']
        scoreCell.textContent = parseInt(entry.game_count) + parseInt(entry.skill_badge_count) + parseInt(entry.trivia_quest_count); // Convert to integers and calculate the score
        gameCountCell.textContent = entry.game_count;
        skillBadgeCell.textContent = entry.skill_badge_count;
        triviaQuestCell.textContent = entry.trivia_quest_count;
    });
}

// Function to establish the WebSocket connection
function connectWebSocket() {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const socket = new WebSocket(wsProtocol + window.location.host);

    socket.addEventListener('open', () => {
        console.log('WebSocket connection established.');
        // Fetch leaderboard data when the WebSocket connection is open
        fetchLeaderboardData();
    });

    socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        updateLeaderboard(data);
    });

    socket.addEventListener('close', () => {
        console.log('WebSocket connection closed. Reconnecting...');
        // Reconnect the WebSocket when it's closed
        setTimeout(connectWebSocket, 2000);
    });
}

// Establish WebSocket connection on page load
connectWebSocket();
