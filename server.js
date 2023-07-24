const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const WebSocket = require('ws');

const app = express();
const PORT = 3000;
let leaderboardData = [];

const wss = new WebSocket.Server({ port: 8080 });

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

wss.on('connection', (ws) => {
    ws.send(JSON.stringify(leaderboardData));
});

function sortLeaderboard() {
    leaderboardData.sort((a, b) => {
        const scoreA = parseInt(a.skill_badge_count) + parseInt(a.trivia_quest_count) + parseInt(a.game_count);
        const scoreB = parseInt(b.skill_badge_count) + parseInt(b.trivia_quest_count) + parseInt(b.game_count);
        return scoreB - scoreA;
    });

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(leaderboardData));
        }
    });
}

app.post('/add_entry', express.json(), (req, res) => {
    const newEntry = req.body;
    leaderboardData.push(newEntry);
    sortLeaderboard(); // Sort the leaderboard data again after adding a new entry

    res.sendStatus(200);
});

app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
