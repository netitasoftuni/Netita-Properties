---
name: 'Netita Properties – JavaScript Guidelines'
description: 'JavaScript documentation and conventions for /js (vanilla, modular)'
applyTo: 'js/**/*.js'
---

# JavaScript Guidelines - Netita Properties

## Purpose
Keep the frontend codebase easy to maintain and safe to extend by using consistent **JSDoc** for public and non-trivial functions, while staying aligned with the repo’s strict vanilla JS architecture.

## Scope
Applies to JavaScript files under `/js/`.

Practical rule:
- **New or modified** non-trivial functions should be documented.
- Tiny one-liners and obvious callbacks do not need ceremony.

## Architecture reminders
- Vanilla JS only (no frameworks / UI libraries).
- Avoid new globals; use `window.APP` as the single namespace if a global is needed.
- Keep logic modular (prefer small modules and helpers over monolith scripts).

## JSDoc expectations

Document functions that are:
- exported / reused across modules, OR
- complex (non-obvious behavior, edge cases), OR
- take multiple parameters, OR
- return structured objects, OR
- have side effects (DOM writes, network calls, storage).

When documenting a function, include:
- A short summary sentence (first line)
- `@param` for each parameter (type + meaning)
- `@returns` when it returns a value
- Optional `@example` for tricky usage

Avoid requiring `@function` and `@description` everywhere; the function name is already present in code, and a good summary line is typically enough.

## Example

```js
/**
 * Formats a numeric amount into a currency string.
 * @param {number} value - Amount to format.
 * @returns {string} Formatted currency string.
 * @example
 * formatCurrency(1234); // "€1,234.00" (depends on locale)
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' }).format(value);
}
```
