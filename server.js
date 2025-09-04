const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files

// In-memory storage (for demo purposes)
let messages = [];

// Routes
app.get('/messages', (req, res) => {
    res.json(messages);
});

app.post('/messages', (req, res) => {
    const { text } = req.body;
    if (text && text.trim()) {
        const message = {
            id: Date.now(),
            text: text.trim(),
            timestamp: new Date().toISOString()
        };
        messages.push(message);
        res.status(201).json(message);
    } else {
        res.status(400).json({ error: 'Message text is required' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
