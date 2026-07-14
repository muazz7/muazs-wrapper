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

// API endpoint for Chat completion proxy (loads modular Vercel handler)
const chatApiHandler = require("./api/chat");
app.post("/api/chat", chatApiHandler);

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
