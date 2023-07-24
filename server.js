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
        leaderboardData.sort((a, b) => b.skill_badge_count + b.trivia_quest_count + b.game_count - a.skill_badge_count - a.trivia_quest_count - a.game_count);
    });

wss.on('connection', (ws) => {
    ws.send(JSON.stringify(leaderboardData));
});

app.post('/add_entry', express.json(), (req, res) => {
    const newEntry = req.body;
    leaderboardData.push(newEntry);
    leaderboardData.sort((a, b) => b.skill_badge_count + b.trivia_quest_count + b.game_count - a.skill_badge_count - a.trivia_quest_count - a.game_count);

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(leaderboardData));
        }
    });

    res.sendStatus(200);
});

app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
