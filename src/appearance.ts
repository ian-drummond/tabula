/*
  Appearance settings: theme, light/dark, accent, writing font, text size, surface, density.
  Saved per device in localStorage. A small inline script in index.html applies the same keys before
  first paint; keep THEME_DEFAULTS in step with it. Rules for what these may change: docs/DESIGN.md.
*/

type Palette = "classic" | "codex" | "dusk";
type Mode = "auto" | "light" | "dark";
type Accent = "theme" | "blue" | "purple" | "pink" | "red" | "orange" | "yellow" | "green" | "graphite";
type Font = "theme" | "system" | "newyork" | "literata" | "newsreader" | "rounded" | "mono" | "hyper";
type Size = "s" | "m" | "l" | "xl";
type Surface = "theme" | "soft" | "paper" | "crisp";
type Density = "comfy" | "compact";

export type Settings = { palette: Palette; mode: Mode; accent: Accent; font: Font; size: Size; surface: Surface; density: Density };

const KEY = "tabula-appearance";
const DENS_KEY = "tabula-density";
const DEFAULTS: Settings = { palette: "classic", mode: "auto", accent: "theme", font: "theme", size: "m", surface: "theme", density: "comfy" };

const THEMES: Record<Palette, { name: string; desc: string; font: Exclude<Font, "theme">; surface: Exclude<Surface, "theme">; swatch: string[] }> = {
  classic: { name: "Classic", desc: "System grays and blue", font: "system", surface: "soft", swatch: ["#f5f5f7", "#1d1d1f", "#0a66e8", "#d93025"] },
  codex: { name: "Codex", desc: "Vellum, lapis and gold", font: "newyork", surface: "paper", swatch: ["#f1ece2", "#2a2118", "#2f4fa2", "#b08d2e"] },
  dusk: { name: "Dusk", desc: "Plum by day, amber by night", font: "newsreader", surface: "soft", swatch: ["#f3f0f5", "#221b2b", "#6b3fa0", "#f2b25c"] },
};

const ACCENTS: { id: Accent; name: string; color: string }[] = [
  { id: "theme", name: "Theme", color: "" },
  { id: "blue", name: "Blue", color: "#0a66e8" },
  { id: "purple", name: "Purple", color: "#8746d8" },
  { id: "pink", name: "Pink", color: "#c8357a" },
  { id: "red", name: "Red", color: "#d1332b" },
  { id: "orange", name: "Orange", color: "#c35f00" },
  { id: "yellow", name: "Yellow", color: "#d9a400" },
  { id: "green", name: "Green", color: "#23874a" },
  { id: "graphite", name: "Graphite", color: "#55555b" },
];

const FONTS: { id: Exclude<Font, "theme">; name: string; stack: string; google?: string }[] = [
  { id: "system", name: "System", stack: "-apple-system,BlinkMacSystemFont,sans-serif" },
  { id: "newyork", name: "New York", stack: 'ui-serif,"New York","Iowan Old Style",Georgia,serif' },
  { id: "literata", name: "Literata", stack: '"Literata",ui-serif,Georgia,serif', google: "Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;1,7..72,400" },
  { id: "newsreader", name: "Newsreader", stack: '"Newsreader",ui-serif,Georgia,serif', google: "Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400" },
  { id: "rounded", name: "Rounded", stack: 'ui-rounded,"SF Pro Rounded","Nunito",sans-serif', google: "Nunito:ital,wght@0,400;0,700;1,400" },
  { id: "mono", name: "Plex Mono", stack: '"IBM Plex Mono",ui-monospace,monospace', google: "IBM+Plex+Mono:ital,wght@0,400;0,600;1,400" },
  { id: "hyper", name: "Hyperlegible", stack: '"Atkinson Hyperlegible",sans-serif', google: "Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400" },
];

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode: settings last for this visit only */ }
}

let settings: Settings = read(KEY, DEFAULTS);
if (!THEMES[settings.palette]) settings.palette = "classic";
let perView: Record<string, Density> = read(DENS_KEY, {} as Record<string, Density>);

const resolvedFont = () => (settings.font === "theme" ? THEMES[settings.palette].font : settings.font);
const resolvedSurface = () => (settings.surface === "theme" ? THEMES[settings.palette].surface : settings.surface);

function loadFont(id: string) {
  const f = FONTS.find((x) => x.id === id);
  if (!f?.google || document.getElementById("gf-" + id)) return;
  const l = document.createElement("link");
  l.id = "gf-" + id;
  l.rel = "stylesheet";
  l.href = `https://fonts.googleapis.com/css2?family=${f.google}&display=swap`;
  document.head.appendChild(l);
}

function setAttr(name: string, value: string | null) {
  const r = document.documentElement;
  if (value === null) r.removeAttribute(name);
  else r.setAttribute(name, value);
}

export function apply() {
  setAttr("data-palette", settings.palette);
  setAttr("data-theme", settings.mode === "auto" ? null : settings.mode);
  setAttr("data-accent", settings.accent === "theme" ? null : settings.accent);
  const font = resolvedFont();
  setAttr("data-font", font === "system" ? null : font);
  loadFont(font);
  setAttr("data-surface", resolvedSurface());
  setAttr("data-size", settings.size === "m" ? null : settings.size);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", getComputedStyle(document.documentElement).getPropertyValue("--surface").trim() || "#ffffff");
}

export function update(patch: Partial<Settings>) {
  settings = { ...settings, ...patch };
  write(KEY, settings);
  apply();
  if (dialog?.open) paintDialog();
}

/* ---------- density, remembered per list ---------- */
export function density(view: string): Density {
  return perView[view] || settings.density;
}
export function setDensity(view: string, d: Density) {
  perView = { ...perView, [view]: d };
  write(DENS_KEY, perView);
}

/* ---------- Settings › Appearance ---------- */
let dialog: HTMLDialogElement | null = null;

const seg = (name: keyof Settings, opts: [string, string][], cur: string) =>
  `<span class="seg apx-seg" role="radiogroup">${opts
    .map(([v, l]) => `<button type="button" role="radio" aria-checked="${v === cur}" class="${v === cur ? "on" : ""}" data-set="${name}" data-v="${v}">${l}</button>`)
    .join("")}</span>`;

function paintDialog() {
  if (!dialog) return;
  const s = settings;
  const themeCards = (Object.keys(THEMES) as Palette[])
    .map((k) => {
      const t = THEMES[k];
      return `<button type="button" role="radio" aria-checked="${s.palette === k}" class="apx-theme ${s.palette === k ? "on" : ""}" data-set="palette" data-v="${k}">
        <span class="apx-sw">${t.swatch.map((c) => `<i style="background:${c}"></i>`).join("")}</span>
        <b>${t.name}</b><small>${t.desc}</small></button>`;
    })
    .join("");
  const accents = ACCENTS.map(
    (a) => `<button type="button" role="radio" aria-checked="${s.accent === a.id}" title="${a.name}" aria-label="${a.name}" class="apx-acc ${s.accent === a.id ? "on" : ""} ${a.id === "theme" ? "th" : ""}" data-set="accent" data-v="${a.id}" style="${a.color ? "--c:" + a.color : ""}"></button>`,
  ).join("");
  const themeFont = FONTS.find((f) => f.id === THEMES[s.palette].font)!;
  const fonts = [{ id: "theme", name: "Theme", stack: themeFont.stack } as { id: string; name: string; stack: string }, ...FONTS]
    .map(
      (f) => `<button type="button" role="radio" aria-checked="${s.font === f.id}" class="apx-font ${s.font === f.id ? "on" : ""}" data-set="font" data-v="${f.id}">
        <span style="font-family:${f.stack.replace(/"/g, "&quot;")}">Aa</span><small>${f.id === "theme" ? "Theme (" + themeFont.name + ")" : f.name}</small></button>`,
    )
    .join("");
  FONTS.forEach((f) => loadFont(f.id));
  const surfName = THEMES[s.palette].surface;
  dialog.innerHTML = `<form method="dialog" class="apx">
    <header class="apx-h"><h2>Appearance</h2><button class="pri" value="done">Done</button></header>
    <div class="apx-prev" aria-hidden="true"><div class="apx-pt">Survey question ideas</div>
      <p>Picking up from the <span class="apx-mn">AI Check-In</span> with <span class="apx-mn">@Joanna</span>. Most of last year's questions stay <em>exactly</em> as they are.</p>
      <div class="apx-row"><span class="apx-chk"></span>Ask Joanna whether the Qualtrics link still works <span class="pill">Mon</span><span class="apx-late">Overdue</span></div>
      <div class="apx-btns"><span class="apx-b pri">Review</span><span class="apx-b">Move All to Today</span></div></div>
    <section><h3>Theme</h3><div class="apx-themes" role="radiogroup" aria-label="Theme">${themeCards}</div></section>
    <section class="apx-line"><h3>Appearance</h3>${seg("mode", [["auto", "Automatic"], ["light", "Light"], ["dark", "Dark"]], s.mode)}</section>
    <section class="apx-line"><h3>Accent</h3><div class="apx-accs" role="radiogroup" aria-label="Accent">${accents}</div></section>
    <section><h3>Writing font</h3><p class="apx-note">Titles, notes and other writing. Lists and buttons stay in the system font.</p><div class="apx-fonts" role="radiogroup" aria-label="Writing font">${fonts}</div></section>
    <section class="apx-line"><h3>Text size</h3>${seg("size", [["s", "S"], ["m", "M"], ["l", "L"], ["xl", "XL"]], s.size)}</section>
    <section class="apx-line"><h3>Surface</h3>${seg("surface", [["theme", "Theme (" + surfName[0].toUpperCase() + surfName.slice(1) + ")"], ["soft", "Soft"], ["paper", "Paper"], ["crisp", "Crisp"]], s.surface)}</section>
    <section class="apx-line"><h3>Density for new lists</h3>${seg("density", [["comfy", "Comfortable"], ["compact", "Compact"]], s.density)}</section>
    <p class="apx-note">Saved on this device. Switch density for a single list from its toolbar.</p>
  </form>`;
}

export function open() {
  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.id = "appearance";
    dialog.className = "sheet";
    dialog.setAttribute("aria-label", "Appearance");
    document.body.appendChild(dialog);
    dialog.addEventListener("click", (e) => {
      const t = e.target as HTMLElement;
      if (t === dialog) { dialog!.close(); return; }
      const b = t.closest<HTMLElement>("[data-set]");
      if (!b) return;
      e.preventDefault();
      const key = b.dataset.set as keyof Settings;
      update({ [key]: b.dataset.v } as Partial<Settings>);
      (dialog!.querySelector(`[data-set="${key}"][data-v="${b.dataset.v}"]`) as HTMLElement | null)?.focus();
    });
  }
  paintDialog();
  dialog.showModal();
}

apply();
(window as unknown as { tabulaAppearance: unknown }).tabulaAppearance = { open, update, density, setDensity, get: () => ({ ...settings }) };
