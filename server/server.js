import express from "express";
import bodyParser from "body-parser";
import OpenAI from "openai";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* ---------------- COMMENT ENDPOINT ---------------- */

/**
 * INTENTIONALLY VULNERABLE ENDPOINT
 */
app.post("/comment", (req, res) => {
  const input = req.body.comment || "";

  console.log("[INPUT RECEIVED]", input);

  // LOG TO LOCAL FILE
  fs.appendFile("logs.txt", `[COMMENT] ${input}\n`, err => {
    if (err) console.error(err);
  });

  res.send(`
    <html>
      <body>
        <h2>User comment:</h2>
        ${input} 
        <script src="/xss-monitor.js"></script>
      </body>
    </html>
  `);
});

/* ---------------- XSS REPORTING ---------------- */

app.post("/xss-report", async (req, res) => {
  const event = req.body;

  console.log("[XSS EVENT]", event);

  fs.appendFile(
    "xss-events.log",
    JSON.stringify(event) + "\n",
    err => {
      if (err) console.error(err);
    }
  );

  const classification = classifyXss(event);

  const aiResponse = await analyzeWithAI({
    classification,
    event
  });

  res.json(aiResponse);
});

/* ---------------- MONITOR SCRIPT ---------------- */

app.get("/xss-monitor.js", (req, res) => {
  res.type("application/javascript").send(monitorScript);
});

/* ---------------- SERVER START ---------------- */

app.listen(port, () => {
  console.log(`XSS AI lab running at http://localhost:${port}`);
});

/* ---------------- HELPERS ---------------- */

function classifyXss(event) {
  if (event.execution?.includes("alert")) {
    return "reflected_xss";
  }
  return "unknown_xss";
}

async function analyzeWithAI(data) {
  const prompt = `
You are a web security expert.

Analyze this XSS incident and respond in JSON:
- type
- explanation
- why_it_happened
- how_it_executed
- how_to_fix
- secure_example

Incident:
${JSON.stringify(data, null, 2)}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: "Explain XSS clearly." },
      { role: "user", content: prompt }
    ]
  });

  return JSON.parse(completion.choices[0].message.content);
}

/* ---------------- CLIENT MONITOR ---------------- */

const monitorScript = `
(function () {
  function report(data) {
    fetch("/xss-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  }

  const originalAlert = window.alert;
  window.alert = function (...args) {
    report({
      execution: "alert",
      args,
      location: window.location.href,
      timestamp: Date.now()
    });
    originalAlert.apply(this, args);
  };

  document.addEventListener("DOMContentLoaded", () => {
    report({
      execution: "dom_loaded",
      location: window.location.href,
      timestamp: Date.now()
    });
  });
})();
`;

