// Design guardrail (docs/DESIGN.md): fails when interface code bypasses the design tokens.
//   1. In the stylesheet, a literal colour (#hex, rgb(), hsl()) may only appear as the value of a token (--name).
//   2. Font sizes use the type scale: var(--t-*), var(--write-*), calc(), 1em or inherit.
//      The one exception is 16px!important on phone form fields, which stops iOS zooming in.
//   3. Inline styles in the code may not hard-code colours or font sizes; values built from data (${...}) are fine.
// Run: npm run check:design
import { readFileSync } from "node:fs";
import { readdirSync } from "node:fs";

const problems = [];
const html = readFileSync("index.html", "utf8");
const css = html.slice(html.indexOf("<style>"), html.indexOf("</style>"));
const lineOf = (text, idx) => text.slice(0, idx).split("\n").length;
const styleStart = lineOf(html, html.indexOf("<style>"));

const COLOR = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/;
for (const m of css.matchAll(/([^{};]+)\{([^{}]*)\}/g)) {
  const sel = m[1].trim().split("\n").pop().trim();
  for (const decl of m[2].split(";")) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim(), val = decl.slice(i + 1).trim();
    const line = styleStart + lineOf(css, m.index) - 1;
    if (!prop.startsWith("--") && COLOR.test(val)) problems.push(`index.html:${line} ${sel} { ${prop}: ${val} } uses a literal colour; use a token`);
    if (prop === "font-size" && !/^(var\(--(t|write)-|calc\(|1em$|inherit$)/.test(val) && val !== "16px!important")
      problems.push(`index.html:${line} ${sel} { font-size: ${val} } is off the type scale; use var(--t-…)`);
    if (prop === "font" && /\b\d+(\.\d+)?(px|rem|em)\b/.test(val.split("/")[0]))
      problems.push(`index.html:${line} ${sel} { font: ${val} } is off the type scale; use var(--t-…)`);
  }
}

const files = ["public/legacy/app.js", ...readdirSync("src").filter((f) => f.endsWith(".ts")).map((f) => "src/" + f)];
for (const f of files) {
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(/style=(["'])(.*?)\1/g)) {
    const v = m[2]; // values computed from data, like hsl(${hue(name)} …) or ${size}px, start with $ and are allowed
    if (/(^|;)\s*(color|background|border-color)\s*:\s*(#[0-9a-fA-F]|rgba?\(\s*\d|hsla?\(\s*\d)/.test(v) || /font-size\s*:\s*[\d.]/.test(v) || /--tc\s*:\s*#/.test(v))
      problems.push(`${f}:${lineOf(src, m.index)} inline style "${m[2].slice(0, 70)}" hard-codes a colour or size; use a class or token`);
  }
}

if (problems.length) {
  console.error(`Design check: ${problems.length} problem${problems.length > 1 ? "s" : ""} (see docs/DESIGN.md)\n` + problems.map((p) => "  " + p).join("\n"));
  process.exit(1);
}
console.log("Design check passed: colours and type sizes all come from tokens.");
