const { Configuration, OpenAIApi } = require("openai");
const knowledge = require("../joe-knowledge.json");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { message } = req.body;

  // Simple keyword match in the JSON knowledge base
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
        { role: "system", content: "You are JOE, Joy of Expression, Acrylicize’s creative co-pilot. Be insightful, playful, and help people explore ideas at the intersection of creativity and AI." },
        { role: "user", content: message }
      ]
    });

    const reply = response.data.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};
