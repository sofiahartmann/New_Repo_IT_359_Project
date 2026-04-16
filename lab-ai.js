// Imports & Configuration
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// Setup
const apiKey = process.env.OPENAI_API_KEY;

const client = apiKey
  ? new OpenAI({
      apiKey
    })
  : null;

// Classification
function classifyPayload(input) {
  const value = String(input || "");
  const lower = value.toLowerCase();

  const hasTag = /<[^>]+>/.test(value);
  const hasScriptTag = /<\s*script\b/.test(lower);
  const hasEventHandler = /\bon\w+\s*=/.test(lower);
  const hasJsUri = /javascript\s*:/.test(lower);

  let type = "No obvious XSS pattern detected";
  if (hasScriptTag) {
    type = "Reflected XSS using a script tag";
  } else if (hasEventHandler) {
    type = "Reflected XSS using an inline event handler";
  } else if (hasJsUri) {
    type = "Reflected XSS using a javascript: URL";
  } else if (hasTag) {
    type = "HTML injection that may become XSS in an unsafe sink";
  }

  return {
    isLikelyUnsafe: hasTag || hasScriptTag || hasEventHandler || hasJsUri,
    type
  };
}
// Fallback analysis 
function localFallback(input) {
  const result = classifyPayload(input);

  return [
    `Verdict: ${result.isLikelyUnsafe ? "Likely unsafe if reflected into HTML." : "No strong XSS signature detected."}`,
    `Likely XSS Type: ${result.type}.`,
    "What This Input Would Do: If a page inserts this input into the DOM with an unsafe sink such as innerHTML, the browser may interpret it as executable markup or script. That can let attacker-controlled JavaScript run in the victim browser, read visible page data, modify the UI, or trigger actions as that user.",
    "How To Fix It: Do not render untrusted input as HTML. Use textContent or safe templating by default, apply contextual output encoding, sanitize any intentionally allowed HTML, and add a Content-Security-Policy that blocks inline script execution where possible."
  ].join("\n\n");
}
// Main analysis function
export async function analyzePayload(input) {
  const payload = String(input || "").slice(0, 4000);
// If no API client, use local fallback
  if (!client) {
    return localFallback(payload);
  }

  try {
    // API Request
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are a defensive web security assistant. Analyze a possible XSS payload for a local training lab. Explain why it is dangerous, what it would do in a browser, and how to fix the vulnerable code. Do not provide attack expansion steps."
        },
        {
          role: "user",
          content: [
            "Analyze this payload for a reflected XSS lab.",
            "",
            "Payload:",
            payload,
            "",
            "Return exactly these sections in plain English:",
            "1. Verdict",
            "2. Likely XSS Type",
            "3. What This Input Would Do",
            "4. How To Fix It"
          ].join("\n")
        }
      ]
    });
// Response Handling
    return response.choices[0]?.message?.content?.trim() || localFallback(payload);
  } catch {
    // Error Handling
    return localFallback(payload);
  }
}
