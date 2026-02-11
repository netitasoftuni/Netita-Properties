# Local Setup (Windows PowerShell)

If you see this error:

> `npm.ps1 cannot be loaded because running scripts is disabled on this system`

It means PowerShell script execution is restricted.

## Option A (recommended): allow local scripts

Run PowerShell as your user and execute:

- `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

Then restart VS Code terminal and run:

- `npm install`
- `npm run dev`

## Option B: use CMD instead of PowerShell

Open **Command Prompt** and run:

- `npm install`
- `npm run dev`

## Option C: call npm via cmd from PowerShell

In PowerShell:

- `cmd /c "npm install"`
- `cmd /c "npm run dev"`

---

## Notes

- Requires Node.js 18+ (this project uses built-in `fetch`).
- The API endpoint is `POST /api/imoti/analyze`.
