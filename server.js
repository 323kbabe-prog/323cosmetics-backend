// server.js — 323cosmetics backend

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());

// serve index.html
app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// API stubs
app.get("/api/trend", (req, res) => {
  res.json({
    brand: "323cosmetics",
    product: "Peptide Lip Tint",
    gender: "female",
    description: "Example description...",
    hashtags: ["#TikTokMadeMeBuyIt", "#BeautyTok", "#NowTrending"]
  });
});

app.get("/health", (_req, res) => res.json({ ok: true, time: Date.now() }));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("323cosmetics backend on port", PORT));
