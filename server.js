import express from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { analyzeInput } from "./ai.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ensure logs folder exists
if (!fs.existsSync("./logs")) {
  fs.mkdirSync("./logs");
}

app.get("/", async (req, res) => {
  const input = req.query.input;

  if (input) {
    console.log("==================================");
    console.log("📥 INPUT RECEIVED:", input);

    fs.appendFileSync(
      "./logs/requests.log",
      `[INPUT] ${new Date().toISOString()} ${input}\n`
    );

    try {
      const analysis = await analyzeInput(input);

      console.log("\n🧠 AI ANALYSIS:\n");
      console.log(analysis);

      fs.appendFileSync(
        "./logs/requests.log",
        `\n[ANALYSIS] ${new Date().toISOString()}\n${analysis}\n\n`
      );
    } catch (err) {
      console.error("❌ AI ERROR:", err.message);
    }

    console.log("==================================");
  }

  res.sendFile(path.resolve("public/index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
