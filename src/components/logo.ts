/*
  Logo geometry and a plain-markup builder, shared by the React component (Logo.tsx) and by the interface
  code that builds HTML strings (sign-in, Account, sidebar). One mark: a baseline and a caret.
  Colour comes from CSS in index.html: the line follows the text colour, the caret follows --accent.
  Rules for where it may appear: docs/DESIGN.md.
*/
import { APP_NAME } from "../brand";

export const LOGO_VIEWBOX = "0 0 64 64";
export const LOGO_LINE = "M10 46H54";
export const LOGO_CARET = "M23 36L32 18L41 36";

/* Stroke width in viewBox units. Thicker as the mark gets smaller so it holds at 16 px. */
export function markStroke(size: number): number {
  if (size <= 16) return 9;
  if (size <= 32) return 7;
  if (size < 48) return 5;
  return 4;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export type MarkOptions = {
  /** Rendered size in px. */
  size?: number;
  /** True when text beside it already says the name; hides the mark from screen readers. */
  decorative?: boolean;
  /** Accessible name when the mark stands alone. */
  label?: string;
};

export function logoMarkSvg({ size = 24, decorative = false, label = APP_NAME }: MarkOptions = {}): string {
  const a11y = decorative ? `aria-hidden="true" focusable="false"` : `role="img" aria-label="${esc(label)}"`;
  return `<svg class="logo-mark" viewBox="${LOGO_VIEWBOX}" width="${size}" height="${size}" fill="none" stroke-width="${markStroke(size)}" stroke-linecap="round" stroke-linejoin="round" ${a11y}><path class="logo-line" d="${LOGO_LINE}"/><path class="logo-caret" d="${LOGO_CARET}"/></svg>`;
}

/* Mark plus wordmark. The wordmark is real text, so the mark is decorative. */
export function logoLockupHtml({ size = 32 }: { size?: number } = {}): string {
  return `<span class="logo">${logoMarkSvg({ size, decorative: true })}<span class="logo-word">${esc(APP_NAME)}</span></span>`;
}
