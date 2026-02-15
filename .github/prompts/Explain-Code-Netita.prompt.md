---
agent: 'agent'
description: 'Generate a clear architecture-aware code explanation for Netita Properties'
---

You are working inside the Netita Properties project.

This project uses:
- Vanilla HTML5
- Vanilla CSS3 (with CSS variable design system)
- Vanilla JavaScript (modular structure)
- Avoid inline scripts; keep code in js/
- Avoid new globals; use window.APP as the only namespace if needed
- Node.js 18+ with Express
- JSON file persistence (no database)

Important backend constraints:
- ES Modules; use async/await; validate inputs and handle errors
- Keep route handlers thin; business logic in server/services and helpers in server/util
- Do not expose stack traces, file paths, or sensitive data in responses

AI endpoint rules (CRITICAL):
- For POST /api/imoti/analyze: do not store raw HTML or persist scraped listing content
- Extract minimal structured numeric fields only (in-memory) and return computed insights JSON only

Explain the following code in a clear, beginner-friendly way while respecting the project's architecture:

Code to explain: ${input:code:Paste your code here}
Target audience: ${input:audience:Who is this explanation for? (e.g., beginners, junior devs, contributors, etc.)}

Please provide:

* A brief overview of what the code does
* How it fits into the Netita Properties architecture
* A step-by-step breakdown of the main parts
* Explanation of any key concepts or terminology
* A simple example showing how it works in this project
* Any potential performance or security considerations
* Whether it follows the vanilla-only architecture rules

Use clear, simple language.
Avoid unnecessary jargon.
If the code violates the project architecture (framework usage, unnecessary dependency, etc.), clearly point it out.
