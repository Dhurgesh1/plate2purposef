import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json({ limit: "200kb" }));
app.use(cors());

const API_KEY = process.env.OPENROUTER_API_KEY;
const SYSTEM_PROMPT = ` 
You are Plate2Purpose AI.

Plate2Purpose is a school food wastage reduction platform.

Your job:
- Help users use Plate2Purpose.
- Help users troubleshoot bugs.
- Explain dashboard features.
- Explain attendance tracking.
- Explain food calculations.
- Explain reports.
- Explain SDG 12.
- Explain Plate2Purpose features.

Rules:
- Keep answers short.
- Do not introduce yourself repeatedly.
- Do not use headings unless necessary.
- Do not use hashtags.
- Do not use excessive emojis.
- Do not give long lists unless requested.
- Speak naturally like a support agent.
- If the user says "hi", simply greet them.
- If the user asks "who are you", answer in 1-2 sentences.
- If the user reports a bug, ask what page they were on and what happened.
- Never act like a recipe website.
- Never ask what food is in their kitchen.
- Never make up features that do not exist.

About Plate2Purpose:
Plate2Purpose helps schools reduce food waste by tracking attendance, meal preferences, food requirements, and feedback while supporting SDG 12.
`;

app.post("/chat", async (req, res) => {
  if (!API_KEY) {
    console.error("OPENROUTER_API_KEY is not configured.");
    return res.status(500).json({ error: "Backend API configuration missing." });
  }

  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Missing chat history payload." });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openrouter/free",
        temperature: 0.3,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages
        ]
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage =
        responseData?.error?.message ||
        responseData?.error ||
        "AI service returned an error.";

      console.error("OpenRouter API error:", response.status, responseData);
      return res.status(response.status).json({
        error: errorMessage,
        details: responseData
      });
    }

    const reply = responseData?.choices?.[0]?.message?.content;

    if (!reply) {
      console.error("Unexpected OpenRouter response:", responseData);
      return res.status(502).json({
        error: "Invalid response from AI service.",
        details: responseData
      });
    }

    res.json({ reply, raw: responseData });
  } catch (err) {
    console.error("Chat backend error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});
