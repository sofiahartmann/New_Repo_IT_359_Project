# XSS AI Lab

Run the standalone lab with:

```powershell
node lab-server.js
```

Then open:

```text
http://localhost:3000/lab
```

Dashboard:

```text
http://localhost:3000/dashboard
```

What it does:

- the vulnerable page reflects the submitted input unsafely inside a sandboxed iframe preview
- the server sends the same input to an AI analyzer
- a separate dashboard page stores and displays the analysis log

Notes:

- the preview is intentionally vulnerable for local training use
- the AI analyzer falls back to a built-in local explanation if the OpenAI API is unavailable
