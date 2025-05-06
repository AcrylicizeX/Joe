const OpenAI = require("openai");
const knowledge = require("../joe-knowledge.json");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { message } = req.body;

  // Match against predefined answers
  const match = knowledge.find((entry) =>
    message.toLowerCase().includes(entry.question.toLowerCase())
  );

  if (match) {
    return res.status(200).json({ reply: match.answer });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are JOE, Joy of Expression, Acrylicize’s creative co-pilot. Be insightful, helpful, and witty.",
        },
        { role: "user", content: message },
      ],
    });

    const reply = response.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ message: "Error generating response" });
  }
};
