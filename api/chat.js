module.exports = async function handler(req, res) {
  // Allow CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  // Only allow POST for actual processing
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");

  const { message } = req.body;

  const match = knowledge.find(entry =>
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
          content: "You are JOE, Joy of Expression, Acrylicize’s creative co-pilot..."
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    const reply = response.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ error: "Something went wrong with OpenAI." });
  }
};
