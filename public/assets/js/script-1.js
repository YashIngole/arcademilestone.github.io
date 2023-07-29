fetch('/leaderboard')
    .then(response => response.json())
    .then(data => {
        updateLeaderboard(data);
    });

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

// Simulated function to add a new entry
function addNewEntry() {
    const newEntry = {
        'Full Name': 'New Player',
        'Game Count': 5,
        'Skill Badge Count': 3,
        'Trivia Quest Count': 10
    };

    fetch('/add_entry', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newEntry)
    })
    .then(() => {
        console.log('New entry added to the leaderboard.');
    })
    .catch((error) => {
        console.error('Error adding new entry:', error);
    });
}

const addButton = document.getElementById('add-button');
addButton.addEventListener('click', addNewEntry);

// Establish WebSocket connection to receive real-time updates
const socket = new WebSocket('ws://localhost:8080');
socket.addEventListener('message', function (event) {
    const data = JSON.parse(event.data);
    updateLeaderboard(data);
});
