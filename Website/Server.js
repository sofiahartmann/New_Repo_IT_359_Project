import express from "express";
import bodyParser from "body-parser";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * INTENTIONALLY VULNERABLE ENDPOINT
 * Reflects user input directly into HTML
 */
app.post("/comment", (req, res) => {
  const input = req.body.comment;

  // Log raw input
  console.log("[INPUT RECEIVED]", input);

  res.send(`
    <html>
      <body>
        <h2>User comment:</h2>
        ${input} <!-- vulnerable -->
        <script src="/xss-monitor.js"></script>
      </body>
    </html>
  `);
});
if (input.includes("<img src=x onerror=alert('XSS')>")) {
    const event = {
      execution: "detected_payload",
      payload: input,
      location: "/comment",
      timestamp: Date.now()
    };
if (input.includes(""<h1 style="color:red">Hacked</h1>"")) {
    const event = {
      execution: "detected_payload",
      payload: input,
      location: "/comment",
      timestamp: Date.now()
    };
if (input.includes("<a href="javascript:alert('XSS')">Click me</a>")) {
    const event = {
      execution: "detected_payload",
      payload: input,
      location: "/comment",
      timestamp: Date.now()
    };
if (input.includes("<input autofocus onfocus=alert('XSS')>")) {
    const event = {
      execution: "detected_payload",
      payload: input,
      location: "/comment",
      timestamp: Date.now()
    };
/**
 * Client-side XSS execution reports arrive here
 */
app.post("/xss-report", async (req, res) => {
  const event = req.body;

  console.log("[XSS EVENT]", JSON.stringify(event, null, 2));

  const classification = classifyXss(event);

  const aiResponse = await analyzeWithAI({
    classification,
    event
  });

  res.json(aiResponse);
});

/**
 * Serve monitoring script
 */
app.get("/xss-monitor.js", (req, res) => {
  res.type("application/javascript").send(monitorScript);
});

app.listen(port, () => {
  console.log(`XSS AI lab running at http://localhost:${port}`);
});
const fs = require('fs');

fs.appendFile('log.txt', '\nNew line added!', (err) => {
  if (err) throw err;
  console.log('Content appended');
});

/* ----------------- Helpers ----------------- */

function classifyXss(event) {
  if (event.execution?.includes("alert")) {
    return "reflected_xss";
  }
  return "unknown_xss";
}

async function analyzeWithAI(data) {
  const prompt = `
You are a web security expert.

Analyze the following XSS incident and respond in JSON with:
- type
- explanation
- why_it_happened
- how_it_executed
- how_to_fix
- secure_example

Incident data:
${JSON.stringify(data, null, 2)}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: "You explain XSS clearly to developers." },
      { role: "user", content: prompt }
    ]
  });

  return JSON.parse(completion.choices[0].message.content);
}

/* ----------------- Client Script ----------------- */

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
      stack: new Error().stack,
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
;
