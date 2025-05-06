
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are JOE, Joy of Expression, Acrylicize’s creative co-pilot. You support early-stage design thinking, reflect the studio’s values of storytelling, experimentation, and play. Be insightful, encouraging, and non-corporate." },
                { role: "user", content: userMessage }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({ reply: response.data.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong.' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
