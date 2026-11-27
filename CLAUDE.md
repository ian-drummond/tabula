# Tabula

Personal planner and journal (GTD + bullet journal + commonplace book). Vite + TypeScript shell in `src/`,
the original app in `public/legacy/app.js`, Supabase for data. See `README.md` for setup.

## Design guide is binding

`docs/DESIGN.md` is the style and design guide. Every interface change must follow it.

- Read `docs/DESIGN.md` before any change to markup, CSS or interface code.
- When a request would break the guide (another button on a page, a new kind of popup, a one-off color or size,
  emoji in the interface, a control that changes layout per theme), say so before building it. Name the rule,
  explain the cost, and propose a version that fits: a menu item, View options, Settings, or reusing an
  existing component. Build the off-guide version only if the user still wants it after hearing that, and then
  update `docs/DESIGN.md` in the same change so the guide stays true.
- Run the guide's "Checklist for any UI change" on your own changes before calling them done.
- Use only the tokens at the top of the stylesheet in `index.html`. Text on an accent fill uses `--on-accent`.

## Commands

- `npm ci` then `npm run build` (type-check and build). `npm run dev` for local work.
- `npm run lint` currently reports known false positives in `public/legacy/app.js` (a function named `use`).

## Code

- Appearance settings (theme, mode, accent, font, text size, surface, density) live in `src/appearance.ts`,
  with a small inline script in `index.html` that applies them before first paint.
- Sign-in, password reset and the Account panel live in `src/auth.ts`. Messages there must never reveal whether
  an email has an account.
- Over time, parts of `public/legacy/app.js` move into typed modules in `src/`.
