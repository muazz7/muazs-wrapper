module.exports = async (req, res) => {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { messages, model } = req.body || {};
    if (!Array.isArray(messages) || !messages.length) return res.status(400).json({ error: "No messages provided" });

    const apiKey = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "API Key is not configured on the server" });

    try {
        const isGroq = apiKey.startsWith("gsk_");
        if (isGroq) {
            const Groq = require("groq-sdk");
            const groq = new Groq({ apiKey });
            const completion = await groq.chat.completions.create({
                messages: messages.map(({ role, content }) => ({ role, content })),
                model: model || "openai/gpt-oss-20b",
            });
            return res.json({ text: completion.choices[0]?.message?.content || "No response received." });
        }

        // Default: Google Gemini API
        const geminiModels = [model, "gemini-3.7-flash", "gemini-3.6-flash", "gemini-flash-latest"].filter(Boolean);
        const contents = messages.map(({ role, content }) => ({
            role: role === "assistant" ? "model" : "user",
            parts: [{ text: content }]
        }));

        let lastErr = null;
        for (const m of geminiModels) {
            const cleanModel = m.startsWith("models/") ? m.slice(7) : m;
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;
            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents })
                });
                const data = await response.json();
                if (!response.ok) {
                    lastErr = new Error(data.error?.message || `Gemini Error: ${response.status}`);
                    continue;
                }
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) return res.json({ text });
            } catch (err) {
                lastErr = err;
            }
        }
        throw lastErr || new Error("No response received from Gemini.");
    } catch (error) {
        console.error("Chat API Error:", error);
        res.status(500).json({ error: `Failed to fetch response: ${error.message}` });
    }
};
