import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: "KEY:", process.env.OPENAI_API_KEY
});

export async function analyzeInput(input) {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a cybersecurity assistant that analyzes XSS attacks safely."
      },
      {
        role: "user",
        content: `
Analyze this input for XSS risk:

INPUT:
${input}

Return:
- Is it malicious or not
- Type of XSS (if any)
- What it would affect in a browser
- How to fix it in code
`
      }
    ]
  });

  return response.choices[0].message.content;
}
