const Groq = require("groq-sdk");

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: "No messages provided" });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.warn("GROQ_API_KEY is not configured on the server.");
            return res.status(500).json({ error: "GROQ_API_KEY not configured on the server" });
        }

        // Setup Groq client
        const groq = new Groq({ apiKey });

        // Request chat completion from Groq
        const chatCompletion = await groq.chat.completions.create({
            messages: messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
            })),
            model: "llama-3.1-8b-instant",
        });

        const text = chatCompletion.choices[0]?.message?.content || "No response received.";
        res.json({ text });
    } catch (error) {
        console.error("Vercel Serverless Function Error:", error);
        res.status(500).json({ error: `Failed to fetch response: ${error.message}` });
    }
};
