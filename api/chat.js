const { Configuration, OpenAIApi } = require("openai");
const knowledge = require("../joe-knowledge.json");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

module.exports = async (req, res) => {
  // Handle preflight (CORS) request
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");

  const { message } = req.body;

  // Check local knowledge first
  const match = knowledge.find(entry =>
    message.toLowerCase().includes(entry.question.toLowerCase())
  );

  if (match) {
    return res.status(200).json({ reply: match.answer });
  }

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are JOE, Joy of Expression, Acrylicize’s creative co-pilot. Be inspiring, playful, and helpful.",
        },
        { role: "user", content: message },
      ],
    });

    const reply = response.data.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ error: "Something went wrong with OpenAI." });
  }
};
