# Tabula design guide

This is the standard every interface change is checked against. It comes from the November 2026 design review
(the "Tabula, refined" artifact). If a change and this guide disagree, either the change adapts or the guide is
updated on purpose, in the same pull request, with a reason. Never quietly.

## Principles

1. **Show the next thing, hide the rest.** Each screen answers one question. Summaries come before detail.
   Rarely used controls live in one More (…) menu, not on the page.
2. **One way to do each thing.** One editor for items, one picker style, one button hierarchy, one list row.
3. **Content over chrome.** White or paper surfaces, hairline separators, no tinted panels. The data is the
   loudest thing on screen.
4. **Color means something.** Accent = you can act or this is selected. Red = overdue or destructive.
   Orange = needs attention. Sphere colors appear only as small dots. Nothing is colored to decorate.
5. **A system, not a set of choices.** Every size, gap, radius, shadow and color comes from a token in
   `index.html`. If a value isn't a token, it doesn't ship.

## Layout and navigation

- **Sidebar** has four fixed sections that don't grow with your data: Today, Inbox and Review at the top;
  Lists (Tasks, Next actions, Waiting for, Someday, saved lists); Library (Notes, People, Events, Collections,
  Images); Spheres (each opens Tasks filtered to that sphere). Individual people, events and collections belong
  on their Library pages, not in the sidebar. A Settings menu at the foot holds Appearance, Account, Data &
  export, Archived and Task report.
- **Toolbar**, in this order: back/forward, page title, Day/Week/Month/Year control on calendar pages,
  density switch, View options (lists), More (…), one primary New button. Nothing else. The More menu holds
  view toggles (key images, details in every row, raw Markdown, page width) and Export.
- **Calendar**: Day, Week, Month and Year are one control, not separate pages in the sidebar.
- **Phone**: tab bar with Today, Tasks, New, Inbox and More (More opens the sidebar). Same components, no
  separate design.

## Where things open

| Container | Used for | Nothing else |
|---|---|---|
| Full page | Notes, people, events, meetings. ⌘I shows every property beside the page. Esc goes back. | |
| Inspector (right panel; sheet on phone) | Tasks, so the list stays in view. ⌘↩ opens a task full page. | |
| Popover | Picking one value: date, person, sphere, collection, related item, filters. | |
| Sheet (dimmed, titled, ends with Done) | Focused flows with an end: Review, Import, New item. | |
| Menu | Rare or destructive actions: Migrate, Drop, Archive, Export, Convert. | |

Rows never expand inline into editors. Never add a new kind of container.

## Controls

- **Buttons:** Primary (filled accent, at most one per screen), Secondary (gray fill, no border),
  Plain (accent text), Destructive (red text, usually inside a menu). Same height everywhere. Title Case labels.
- **Icons:** one 16-pt line icon set. No emoji in the interface. Emoji in the user's own content are fine.
  An icon-only button always has a tooltip and an `aria-label`.
- **Segmented control:** one style (gray track, raised selected segment). Use for 2–4 mutually exclusive views.
- **Chips:** one style, for people, collections, filters and related items. Removable chips show ×.
- **Filters:** a search field plus a Filter button. Active filters show as removable chips. Never a wall of
  dropdowns on the page.
- **Every list row** is the same component: checkbox or type icon, title, one line of metadata, optional
  trailing date or thumbnail. Hover actions appear on hover only.

## Writing

- One Markdown editor for all text: notes, descriptions, meeting summaries, About sections, event write-ups.
  Formatting shows as you type; the stored text stays plain Markdown so export never changes.
- `/` inserts blocks, `@` links people, events, collections and items, `[ ]` makes a real task.
- No permanent toolbar. A formatting bar appears on selection (desktop) or above the keyboard (phone).
- Properties sit in one quiet line under the title, not in a form.

## Tokens

All defined at the top of the stylesheet in `index.html`. Components use tokens only.

- **Color:** `--canvas --surface --surface2 --sidebar --ink --ink2 --ink3 --sep --fill --fill2 --accent
  --accent-bg --on-accent --red --orange --green --purple --teal --brown --star`. Text on an accent fill uses
  `--on-accent`, never `#fff`.
- **Type:** UI font is the system font. Sizes: 22 title, 17 heading, 15 body, 13 secondary, 11.5 footnote
  (`--t-title --t-head --t-body --t-small --t-foot`). Weights 400, 500, 600, 700 only. No all-caps labels.
- **Writing font:** `--font-write`, `--font-title`, `--write-size` apply only to writing (editors, page titles).
  The interface never changes font.
- **Space:** 4, 8, 12, 16, 24, 32, 48 (`--s1` to `--s7`).
- **Shape and depth:** `--r1` chips, `--r2` controls, `--r3` cards and rows, `--r4` sheets; `--sh1` raised,
  `--sh2` popovers and sheets; `--edge` for outlines. These come from the Surface setting.

## Appearance settings

Settings › Appearance holds exactly these: Theme, Light/Dark/Automatic, Accent, Writing font, Text size,
Surface, Default density.

- **Themes** (`data-palette`): Classic, Codex, Dusk ship first. Harbor, Sage and Highlighter are designed and can
  be added as one token block each. A theme changes color only, plus a suggested font and surface.
- **Fonts** (`data-font`): System, New York, Literata, Newsreader, Rounded, Plex Mono, Hyperlegible.
  Default comes from the theme until the user picks one.
- **Surface** (`data-surface`): Soft, Paper, Crisp. Changes corner rounding, shadows and line weight only.
  Default comes from the theme.
- **Density:** Comfortable or Compact, switched from the toolbar, remembered per list. Changes row padding and
  whether metadata sits beside the title. Never text size, icons or control positions.
- **No appearance setting may change layout, spacing, control size, icon shapes or where controls sit.**

## Copy

Plain words from the user's side: "Overdue · Nov 24", not "overdue · was due Nov 24"; "Moved 5×", not "↪5".
Buttons say exactly what happens. Errors say what went wrong and how to fix it.

## Checklist for any UI change

Before adding or changing interface, answer these. If an answer is "no", change the design or update this guide
deliberately.

- Does it reuse an existing component and container from this guide?
- Does it add a control to a page? If so, does it replace one, or does it belong in a menu, View options or Settings?
- Does it use only tokens (no new hex colors, font sizes, radii, shadows)?
- Does it work in every theme, light and dark, every surface, both densities, and at phone width?
- Is there still at most one primary button on the screen?
- Would someone who learned the rest of Tabula find it where they expect?
