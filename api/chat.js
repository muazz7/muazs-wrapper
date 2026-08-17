const Groq = require("groq-sdk");

module.exports = async (req, res) => {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { messages } = req.body || {};
    if (!Array.isArray(messages) || !messages.length) return res.status(400).json({ error: "No messages provided" });

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "GROQ_API_KEY not configured on the server" });

    try {
        const groq = new Groq({ apiKey });
        const completion = await groq.chat.completions.create({
            messages: messages.map(({ role, content }) => ({ role, content })),
            model: "llama-3.1-8b-instant",
        });
        res.json({ text: completion.choices[0]?.message?.content || "No response received." });
    } catch (error) {
        console.error("Serverless Function Error:", error);
        res.status(500).json({ error: `Failed to fetch response: ${error.message}` });
    }
};
