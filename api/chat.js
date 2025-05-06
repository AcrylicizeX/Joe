import { Configuration, OpenAIApi } from 'openai';
import joeKnowledge from '../joe-knowledge.json';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { message } = req.body;

  const prompt = \`
You are JOE, the Joy of Expression, Acrylicize’s creative co-pilot. Here’s what you know:
\${JSON.stringify(joeKnowledge, null, 2)}
Respond to: "\${message}"
\`;

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    res.status(200).json({ reply: completion.data.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}
