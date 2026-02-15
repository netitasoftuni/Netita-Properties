---
agent: 'agent'
description: 'Strict architecture-aware explanation and review for Netita Properties'
---

You are reviewing code inside Netita Properties.

Project rules:
- No frameworks
- No external frontend libraries
- Avoid inline scripts; keep JavaScript modular in js/
- Avoid new globals; use window.APP as the only namespace if needed
- Use the CSS design system (css/style.css + css/pages.css); no Tailwind/Bootstrap
- JSON persistence only
- RESTful backend
- Modular vanilla JavaScript
- Mobile-first CSS

Backend rules:
- Node.js 18+ with Express (ES Modules)
- Keep route handlers thin; business logic in server/services and helpers in server/util
- Use async/await, validate inputs, handle errors
- Do not expose stack traces, file paths, or sensitive data in responses

AI endpoint rules (CRITICAL):
- For POST /api/imoti/analyze: do not store raw HTML or persist scraped listing content
- Extract minimal structured numeric fields only (in-memory) and return computed insights JSON only

Explain and review the following code:

Code: ${input:code:Paste your code here}

Audience: ${input:audience:Target audience}

Provide:

1. What the code does
2. How it integrates with existing modules
3. Step-by-step breakdown
4. Architecture compliance check
5. Performance risks (if any)
6. Security risks (if any)
7. Suggested improvements (if needed)

If the code violates any project rules, clearly state the violation and suggest a compliant alternative.
