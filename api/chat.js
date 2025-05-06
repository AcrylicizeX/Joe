// /api/chat.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { message } = req.body;
  const knowledge = require('../joe-knowledge.json');

  const { Configuration, OpenAIApi } = await import('openai');
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const context = Object.entries(knowledge)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

  const prompt = `You are JOE, the Joy of Expression, Acrylicize’s creative co-pilot.\n\nKnowledge:\n${context}\n\nUser: ${message}\nJOE:`;

  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 150,
    });

    const reply = response.data.choices[0].text.trim();
    res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong with OpenAI' });
  }
}
