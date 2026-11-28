/*
  Sign-in, sign-up, forgot password, password reset and the Account panel, on Supabase Auth.
  - Email + password is the main way in; an emailed sign-in link stays as a fallback.
  - New accounts are hidden until VITE_SIGNUPS_OPEN=true and sign-ups are allowed in Supabase.
  - Messages never reveal whether an email has an account.
  Interface rules: docs/DESIGN.md.
*/
import { supabase } from "./supabase";
import { APP_NAME, TAGLINE } from "./brand";
import { logoLockupHtml, logoMarkSvg } from "./components/logo";
import { VERSION } from "./version";

const MIN_PW = 10;
const MAX_PW = 72; // the hashing Supabase uses ignores anything longer
const signupsOpen = String(import.meta.env.VITE_SIGNUPS_OPEN || "").toLowerCase() === "true";
const home = () => location.origin + location.pathname;
const content = () => document.getElementById("content");

type Mode = "signin" | "link" | "forgot" | "signup" | "reset" | "unconfigured";
type Opts = { notice?: string; error?: string; email?: string; onDone?: () => void };

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** True when the page was opened from a "reset your password" email. */
export function isResetLink() {
  return new URLSearchParams(location.search).has("reset");
}

function clearUrlExtras() {
  const q = new URLSearchParams(location.search);
  q.delete("reset");
  const qs = q.toString();
  const hash = /(^#|&)(error|access_token|error_description)=/.test(location.hash) ? "" : location.hash;
  history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "") + hash);
}

/** Supabase puts link errors (expired, already used) in the URL hash. */
function linkError(): string {
  const h = new URLSearchParams(location.hash.replace(/^#/, ""));
  const code = h.get("error_code") || "";
  if (!h.get("error")) return "";
  if (code === "otp_expired") return "That link has expired or was already used. Request a new one below.";
  return h.get("error_description")?.replace(/\+/g, " ") || "That link didn't work. Request a new one below.";
}

function friendly(e: { code?: string; message?: string; status?: number } | null): string {
  if (!e) return "";
  switch (e.code) {
    case "invalid_credentials": return "That email and password don't match. Try again, or reset your password.";
    case "email_not_confirmed": return "Confirm your email first. The link is in your inbox.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit": return "Too many tries. Wait a minute, then try again.";
    case "weak_password": return `Choose a stronger password: at least ${MIN_PW} characters, ideally a short phrase.`;
    case "same_password": return "That's your current password. Choose a new one.";
    case "signup_disabled": return "New accounts aren't open yet.";
    case "user_already_exists":
    case "email_exists": return "There's already an account for that email. Sign in or reset your password.";
    case "reauthentication_not_valid": return "That code didn't match. Check the latest email and try again.";
  }
  if (e.status === 429) return "Too many tries. Wait a minute, then try again.";
  if (/fetch|network/i.test(e.message || "")) return "Couldn't reach the sign-in server. Check your connection and try again.";
  return e.message || "Something went wrong. Try again.";
}

function checkNewPassword(pw: string, again: string): string {
  if (pw.length < MIN_PW) return `Use at least ${MIN_PW} characters. A short phrase is easy to remember.`;
  if (pw.length > MAX_PW) return `Use ${MAX_PW} characters or fewer.`;
  if (pw !== again) return "The two passwords don't match.";
  return "";
}

const field = (id: string, label: string, type: string, autocomplete: string, value = "", extra = "") =>
  `<label class="af" for="${id}"><span class="afl">${label}${type === "password" ? `<button type="button" class="lnk afs" data-show="${id}" aria-controls="${id}">Show</button>` : ""}</span>
   <input id="${id}" name="${id}" type="${type}" autocomplete="${autocomplete}" value="${esc(value)}" ${type === "email" ? 'inputmode="email" autocapitalize="off" spellcheck="false"' : ""} required ${extra}></label>`;

const brand = `<div class="auth-brand">${logoLockupHtml()}<p class="auth-tag">${esc(TAGLINE)}</p></div>`;

function wireShowButtons(root: HTMLElement) {
  root.querySelectorAll<HTMLButtonElement>("[data-show]").forEach((b) =>
    b.addEventListener("click", () => {
      const i = document.getElementById(b.dataset.show!) as HTMLInputElement;
      const show = i.type === "password";
      i.type = show ? "text" : "password";
      b.textContent = show ? "Hide" : "Show";
    }),
  );
}

/** Sign-in screens, shown in place of the app until there is a session. */
export function showGate(mode: Mode, o: Opts = {}) {
  const c = content();
  if (!c) return;
  document.body.classList.add("gate");
  const err = o.error ?? (mode === "signin" || mode === "forgot" ? linkError() : "");
  const email = o.email || "";
  const msg = `<p class="auth-msg ${err ? "bad" : ""}" role="status" aria-live="polite">${esc(err || o.notice || "")}</p>`;
  const swap = (m: Mode, label: string) => `<button type="button" class="lnk" data-mode="${m}">${label}</button>`;
  let body = "";
  if (mode === "unconfigured") {
    body = `<h1>${esc(APP_NAME)} isn't set up yet</h1><p class="auth-sub">The build is missing <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>. Add them in Vercel → Settings → Environment Variables, then redeploy.</p>`;
  } else if (mode === "signin") {
    body = `<h1>Sign in</h1><form id="af" novalidate>${field("a_email", "Email", "email", "username", email)}${field("a_pw", "Password", "password", "current-password")}${msg}
      <button class="pri auth-go">Sign In</button></form>
      <div class="auth-alt">${swap("forgot", "Forgot password?")}${swap("link", "Email me a sign-in link instead")}${signupsOpen ? swap("signup", "Create an account") : ""}</div>`;
  } else if (mode === "link") {
    body = `<h1>Get a sign-in link</h1><p class="auth-sub">We'll email you a link that signs you in on this device.</p><form id="af" novalidate>${field("a_email", "Email", "email", "username", email)}${msg}
      <button class="pri auth-go">Email Me a Link</button></form><div class="auth-alt">${swap("signin", "Sign in with a password")}</div>`;
  } else if (mode === "forgot") {
    body = `<h1>Reset your password</h1><p class="auth-sub">Enter your email and we'll send a link to choose a new password.</p><form id="af" novalidate>${field("a_email", "Email", "email", "username", email)}${msg}
      <button class="pri auth-go">Send Reset Link</button></form><div class="auth-alt">${swap("signin", "Back to sign in")}</div>`;
  } else if (mode === "signup") {
    body = `<h1>Create an account</h1><form id="af" novalidate>${field("a_email", "Email", "email", "username", email)}${field("a_pw", "Password", "password", "new-password", "", `minlength="${MIN_PW}" maxlength="${MAX_PW}"`)}${field("a_pw2", "Confirm password", "password", "new-password", "", `minlength="${MIN_PW}" maxlength="${MAX_PW}"`)}
      <p class="auth-hint">At least ${MIN_PW} characters. A short phrase is easiest to remember.</p>${msg}
      <button class="pri auth-go">Create Account</button></form><div class="auth-alt">${swap("signin", "I already have an account")}</div>`;
  } else if (mode === "reset") {
    body = `<h1>Choose a new password</h1><form id="af" novalidate><input type="email" autocomplete="username" value="${esc(email)}" hidden>${field("a_pw", "New password", "password", "new-password", "", `minlength="${MIN_PW}" maxlength="${MAX_PW}"`)}${field("a_pw2", "Confirm new password", "password", "new-password", "", `minlength="${MIN_PW}" maxlength="${MAX_PW}"`)}
      <p class="auth-hint">At least ${MIN_PW} characters. A short phrase is easiest to remember.</p>${msg}
      <button class="pri auth-go">Save Password</button></form>`;
  }
  c.innerHTML = `<div class="auth">${brand}${body}</div>`;
  if (err) clearUrlExtras();
  wireShowButtons(c);
  c.querySelectorAll<HTMLButtonElement>("[data-mode]").forEach((b) =>
    b.addEventListener("click", () => showGate(b.dataset.mode as Mode, { email: (document.getElementById("a_email") as HTMLInputElement | null)?.value || email, onDone: o.onDone })),
  );
  const form = document.getElementById("af") as HTMLFormElement | null;
  if (!form) return;
  (form.querySelector("input:not([hidden]):not([value]), input:not([hidden])") as HTMLInputElement | null)?.focus();
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const go = form.querySelector<HTMLButtonElement>(".auth-go")!;
    const val = (id: string) => (document.getElementById(id) as HTMLInputElement | null)?.value || "";
    const em = val("a_email").trim().toLowerCase();
    const say = (text: string, bad = true) => {
      const p = form.querySelector<HTMLElement>(".auth-msg")!;
      p.textContent = text;
      p.classList.toggle("bad", bad);
    };
    if (mode !== "reset" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return say("Enter your email address.");
    go.disabled = true;
    try {
      if (mode === "signin") {
        if (!val("a_pw")) return say("Enter your password.");
        const { error } = await supabase.auth.signInWithPassword({ email: em, password: val("a_pw") });
        if (error) return say(friendly(error));
        say("Signing in…", false);
      } else if (mode === "link") {
        const { error } = await supabase.auth.signInWithOtp({ email: em, options: { emailRedirectTo: home(), shouldCreateUser: signupsOpen } });
        if (error && (error.status === 429 || /rate/i.test(error.code || ""))) return say(friendly(error));
        say("If there's an account for that email, a sign-in link is on its way.", false);
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(em, { redirectTo: home() + "?reset=1" });
        if (error && (error.status === 429 || /rate/i.test(error.code || ""))) return say(friendly(error));
        say("If there's an account for that email, a reset link is on its way. It works once and expires soon.", false);
      } else if (mode === "signup") {
        const bad = checkNewPassword(val("a_pw"), val("a_pw2"));
        if (bad) return say(bad);
        const { data, error } = await supabase.auth.signUp({ email: em, password: val("a_pw"), options: { emailRedirectTo: home() } });
        if (error) return say(friendly(error));
        if (!data.session) say("Check your email to confirm your account, then sign in.", false);
      } else if (mode === "reset") {
        const bad = checkNewPassword(val("a_pw"), val("a_pw2"));
        if (bad) return say(bad);
        const { error } = await supabase.auth.updateUser({ password: val("a_pw") });
        if (error) return say(friendly(error));
        clearUrlExtras();
        say("Password saved.", false);
        o.onDone?.();
      }
    } finally {
      go.disabled = false;
    }
  });
}

/* ---------- Account panel (signed in) ---------- */
let dialog: HTMLDialogElement | null = null;

export async function openAccount() {
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email || "";
  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.className = "sheet";
    dialog.setAttribute("aria-label", "Account");
    document.body.appendChild(dialog);
    dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog!.close(); });
  }
  dialog.innerHTML = `<div class="apx">
    <header class="apx-h"><h2>Account</h2><button type="button" data-close>Done</button></header>
    <p class="apx-note acct-who">Signed in as <b>${esc(email)}</b></p>
    <form id="acct_pw" class="acct" novalidate><h3>Change password</h3>
      <input type="email" autocomplete="username" value="${esc(email)}" hidden>
      ${field("c_pw", "New password", "password", "new-password", "", `minlength="${MIN_PW}" maxlength="${MAX_PW}"`)}
      ${field("c_pw2", "Confirm new password", "password", "new-password", "", `minlength="${MIN_PW}" maxlength="${MAX_PW}"`)}
      <div class="af acct-code" hidden><span class="afl">Code from your email</span><input id="c_code" inputmode="numeric" autocomplete="one-time-code"></div>
      <p class="auth-hint">At least ${MIN_PW} characters. A short phrase is easiest to remember.</p>
      <p class="auth-msg" role="status" aria-live="polite"></p>
      <button class="pri">Change Password</button></form>
    <section><h3>Sign out</h3><div class="acct-out"><button type="button" class="warn" data-out="local">Sign Out</button><button type="button" class="warn" data-out="global">Sign Out Everywhere</button></div>
      <p class="apx-note">Sign Out Everywhere also signs out your other devices and browsers.</p></section>
    <p class="acct-app">${logoMarkSvg({ size: 24, decorative: true })}<span>${esc(APP_NAME)} · Version ${esc(VERSION)}</span></p>
  </div>`;
  wireShowButtons(dialog);
  dialog.querySelector("[data-close]")!.addEventListener("click", () => dialog!.close());
  dialog.querySelectorAll<HTMLButtonElement>("[data-out]").forEach((b) =>
    b.addEventListener("click", async () => {
      await supabase.auth.signOut({ scope: b.dataset.out === "global" ? "global" : "local" });
      location.reload();
    }),
  );
  const form = dialog.querySelector<HTMLFormElement>("#acct_pw")!;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const val = (id: string) => (dialog!.querySelector<HTMLInputElement>("#" + id)?.value || "");
    const msg = form.querySelector<HTMLElement>(".auth-msg")!;
    const say = (t: string, bad = true) => { msg.textContent = t; msg.classList.toggle("bad", bad); };
    const bad = checkNewPassword(val("c_pw"), val("c_pw2"));
    if (bad) return say(bad);
    const codeBox = form.querySelector<HTMLElement>(".acct-code")!;
    const nonce = codeBox.hidden ? undefined : val("c_code").trim();
    const { error } = await supabase.auth.updateUser(nonce ? { password: val("c_pw"), nonce } : { password: val("c_pw") });
    if (error && error.code === "reauthentication_needed") {
      // Supabase's "secure password change" wants a fresh code when the last sign-in is old
      const r = await supabase.auth.reauthenticate();
      if (r.error) return say(friendly(r.error));
      codeBox.hidden = false;
      dialog!.querySelector<HTMLInputElement>("#c_code")?.focus();
      return say("To confirm it's you, we emailed you a code. Enter it, then press Change Password again.", false);
    }
    if (error) return say(friendly(error));
    form.reset();
    codeBox.hidden = true;
    say("Password changed. Use it next time you sign in.", false);
  });
  dialog.showModal();
}

(window as unknown as { tabulaAccount: unknown }).tabulaAccount = { open: openAccount };
