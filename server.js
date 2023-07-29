const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 8080; // Use the default HTTP port for App Engine
let leaderboardData = [];

// Create the WebSocket server using the same HTTP server as the Express app
const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

const wss = new WebSocket.Server({ server });

app.get('/bootstrap/css', (req, res) => {
    res.redirect('https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css');
});

app.get('/bootstrap/js', (req, res) => {
    res.redirect('https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js');
});

fs.createReadStream('./data/leaderboard.csv')
    .pipe(csv({
        mapHeaders: ({ header, index }) => header.trim().toLowerCase().replace(/\W/g, '_'),
        parse: (value, context) => context.header.trim().toLowerCase() === 'time_stamp' ? new Date(value).toLocaleString() : value
    }))
    .on('data', (row) => {
        leaderboardData.push(row);
    })
    .on('end', () => {
        sortLeaderboard(); // Sort the leaderboard data in descending order based on the score
    });

function sortLeaderboard() {
    leaderboardData.sort((a, b) => {
        const scoreA = parseInt(a.skill_badge_count) + parseInt(a.trivia_quest_count) + parseInt(a.game_count);
        const scoreB = parseInt(b.skill_badge_count) + parseInt(b.trivia_quest_count) + parseInt(b.game_count);
        return scoreB - scoreA;
    });

    wss.clients.forEach(sendLeaderboardData);
}

function sendLeaderboardData(ws) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(leaderboardData));
    }
}

// Route to get the current leaderboard data in JSON format
app.get('/leaderboard', (req, res) => {
    res.json(leaderboardData);
});

// Route to add a new entry to the leaderboard
app.post('/add_entry', express.json(), (req, res) => {
    const newEntry = req.body;
    leaderboardData.push(newEntry);
    sortLeaderboard(); // Sort the leaderboard data again after adding a new entry

    res.sendStatus(200);
});

app.use(express.static('public'));
