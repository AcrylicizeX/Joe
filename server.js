
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// Load local JSON knowledge file
const knowledgeBase = JSON.parse(fs.readFileSync('joe-knowledge.json', 'utf-8'));

// Basic keyword match (can upgrade later)
function findAnswerFromKnowledge(userMessage) {
  const lowerInput = userMessage.toLowerCase();
  for (const item of knowledgeBase) {
    if (lowerInput.includes(item.question.toLowerCase())) {
      return item.answer;
    }
  }
  return null;
}

app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;

  // Try to find a hardcoded answer first
  const matchedAnswer = findAnswerFromKnowledge(userMessage);
  if (matchedAnswer) {
    return res.json({ reply: matchedAnswer });
  }

  // Fallback to GPT-3.5
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are JOE – Joy of Expression – a friendly, playful, and insightful creative co-pilot at Acrylicize. You support design thinking, celebrate storytelling and experimentation, and avoid corporate speak. You speak with clarity and warmth."
        },
        {
          role: "user",
          content: userMessage
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const reply = response.data.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
    console.error("Error from OpenAI:", error.message);
    res.status(500).json({ error: 'Something went wrong with the AI reply.' });
  }
});

app.listen(port, () => {
  console.log(`JOE server is running on port ${port}`);
});
