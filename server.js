const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.use("/api/chat", require("./api/chat"));

app.get("*", (req, res, next) => {
    if (req.path.includes(".")) return next();
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

module.exports = app;
