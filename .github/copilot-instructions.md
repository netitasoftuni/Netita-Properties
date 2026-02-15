---
name: 'Netita Properties Standards'
description: 'Global coding and architecture rules for Netita Properties'
applyTo: '**/*'
---

# Netita Properties – Global Instructions

This repository follows a strict vanilla architecture.

## Frontend
- HTML5
- CSS3 (custom design system in css/style.css + page styles in css/pages.css)
- Vanilla JavaScript (modular in js/; avoid inline scripts)
- No frameworks or UI libraries
- No Tailwind/Bootstrap
- Avoid new globals; use `window.APP` as the only namespace if needed
- Follow responsive and accessibility rules

## Backend
- Node.js 18+
- Express
- ES Modules
- JSON file persistence (server/data/*.json)
- No database / ORM / heavy dependencies
- Keep route handlers thin
- Use async/await
- Validate inputs & handle errors
- Prefer non-blocking I/O (fs/promises)
- Do not expose stack traces, file paths, or sensitive data

## AI Endpoint Rules (CRITICAL)

For `POST /api/imoti/analyze`:
- Do not store raw HTML
- Do not persist scraped listing content
- Extract minimal structured numeric fields only (in-memory)
- Return computed insights JSON only

## Architecture Rules
- Keep backend logic modular
- Put business logic in server/services and helpers in server/util
- Keep frontend modular and consistent
- Follow the CSS design system
- Do not introduce frameworks
- Do not modify JSON schema without explanation

## Agent Routing
- Server/backend tasks → Follow [BackendExpertAgent](agents/BackendExpertAgent.agent.md)
- UI/frontend tasks → Follow [FrontendExpertAgent](agents/FrontendExpertAgent.agent.md)

## Always Prioritize
- Maintainability
- Performance
- Clean architecture
- Security
- Consistent naming and modular structure

## Plans
- Store project plans in `.github/plans/` (avoid scattering plans across the repo).
- One plan per file, Markdown format.
- Naming: `YYYY-MM-DD - Title.md`.
- Keep plans practical: goal, steps, verification, and any key decisions.
