# Netita Properties – Copilot Global Instructions

This repository uses a strict vanilla architecture.

Frontend:
- HTML5
- CSS3 (custom design system)
- Vanilla JavaScript (modular)
- No frameworks
- No UI libraries

Backend:
- Node.js 18+
- Express
- ES Modules
- JSON file persistence
- No database
- No ORM
- No heavy dependencies

Architecture Rules:
- Keep backend logic modular.
- Keep route handlers thin.
- Keep frontend modular and consistent.
- Follow existing design system.
- Do not introduce frameworks.
- Do not modify JSON schema without explanation.

Agent Routing:
- Server/backend tasks → Follow BackendExpertAgent.
- UI/frontend tasks → Follow FrontendExpertAgent.

Always prioritize:
- Maintainability
- Performance
- Clean architecture
- Security
