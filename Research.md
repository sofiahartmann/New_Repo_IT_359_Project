## AI Integration
<script>
    function looksSuspicious(input) {
      return /<|script|on\w+=|javascript:/i.test(input);
    }

    async function submitInput() {
      const value = document.getElementById("userInput").value;

      if (looksSuspicious(value)) {
        await fetch("/xss-alert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: value,
            url: window.location.href,
            userAgent: navigator.userAgent
          })
        });
      }

      alert("Submitted");
    }
  </script>


  ## Backend 
(js)
import express from "express";
import nodemailer from "nodemailer";

const app = express();
app.use(express.json());

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "yourgmail@gmail.com",
    pass: "YOUR_APP_PASSWORD"
  }
});

// XSS alert endpoint
app.post("/xss-alert", async (req, res) => {
  const { input, url, userAgent } = req.body;

  const mailOptions = {
    from: "yourgmail@gmail.com",
    to: "sample@gmail.com",
    subject: "Possible XSS Attempt Detected",
    text: `
Possible XSS detected!

URL: ${url}
User Agent: ${userAgent}
Payload:
${input}
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});


## How to send emails
npm install express nodemailer

