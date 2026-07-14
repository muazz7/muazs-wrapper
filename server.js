const express = require("express");
const path = require("path");
const Groq = require("groq-sdk");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config({ path: path.join(__dirname, "../.env") }); // Load from parent directory if present
require("dotenv").config({ path: path.join(__dirname, "../.env.local") }); // Load from parent .env.local if present

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON request bodies
app.use(express.json());

// Serve static files from the current directory (for index.html, pricing.html, style.css, script.js)
app.use(express.static(__dirname));

// Serve static files from public directory inside Muaz_Wrapped
app.use("/public", express.static(path.join(__dirname, "public")));
// Fallback: also serve from parent public directory if assets are there
app.use("/public", express.static(path.join(__dirname, "../public")));

// API endpoint for Chat completion proxy
app.post("/api/chat", async (req, res) => {
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
        console.error("Server API Error:", error);
        res.status(500).json({ error: `Failed to fetch response: ${error.message}` });
    }
});

// For any other routes, default to index.html to allow client side routing behavior
app.get("*", (req, res, next) => {
    // If asking for a file with extension, don't fallback to index.html (let express.static handle or 404)
    if (req.path.includes(".")) {
        return next();
    }
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` Muaz Wrapped It - Server is running!`);
    console.log(` Local URL: http://localhost:${PORT}`);
    console.log(`==================================================`);
});

module.exports = app;
