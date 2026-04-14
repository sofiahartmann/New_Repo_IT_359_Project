import express from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { analyzePayload } from "./lab-ai.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);
const logsDir = path.resolve("logs");
const logFile = path.join(logsDir, "lab-requests.log");
const entriesFile = path.join(logsDir, "lab-entries.json");

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

if (!fs.existsSync(entriesFile)) {
  fs.writeFileSync(entriesFile, "[]\n");
}

function readEntries() {
  try {
    const raw = fs.readFileSync(entriesFile, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeEntries(entries) {
  fs.writeFileSync(entriesFile, `${JSON.stringify(entries, null, 2)}\n`);
}

app.use(express.json());
app.use("/lab", express.static(path.resolve("lab-public")));
app.use("/dashboard", express.static(path.resolve("dashboard-public")));

app.get("/", (_req, res) => {
  res.redirect("/lab");
});

app.post("/lab/analyze", async (req, res) => {
  const input = String(req.body?.input || "").trim();

  if (!input) {
    return res.status(400).json({ error: "Input is required." });
  }

  fs.appendFileSync(logFile, `[INPUT] ${new Date().toISOString()} ${input}\n`);

  try {
    const analysis = await analyzePayload(input);
    const entry = {
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      input,
      analysis
    };

    const existingEntries = readEntries();
    existingEntries.unshift(entry);
    writeEntries(existingEntries.slice(0, 100));

    fs.appendFileSync(
      logFile,
      `[ANALYSIS] ${new Date().toISOString()}\n${analysis}\n\n`
    );

    return res.json({ input, analysis, dashboardUrl: "/dashboard" });
  } catch (error) {
    return res.status(500).json({
      error: "The analyzer could not process this input right now."
    });
  }
});

app.get("/dashboard/api/entries", (_req, res) => {
  return res.json({ entries: readEntries() });
});

app.listen(port, () => {
  console.log(`XSS AI lab running at http://localhost:${port}/lab`);
  console.log(`Dashboard available at http://localhost:${port}/dashboard`);
});
