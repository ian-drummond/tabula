import "./appearance";
import { supabase, configured } from "./supabase";
import { installPlatform } from "./platform";
import { importZip } from "./importZip";

const content = () => document.getElementById("content");

function gate(msg = "") {
  const c = content();
  if (!c) return;
  c.innerHTML = `<div class="panel" style="max-width:420px;margin:60px auto">
    <h2 style="margin-top:0">Sign in to Tabula</h2>
    ${configured ? `<p class="mute">We'll email you a one-time sign-in link.</p>
    <form id="tab_login" class="row"><input id="tab_email" type="email" required placeholder="you@example.com" style="flex:1" autocomplete="email"><button class="pri">Send link</button></form>` :
    `<p>Supabase isn't configured. Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.</p>`}
    <p class="mute" id="tab_msg">${msg}</p></div>`;
  const f = document.getElementById("tab_login") as HTMLFormElement | null;
  f?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = (document.getElementById("tab_email") as HTMLInputElement).value.trim();
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname, shouldCreateUser: true } });
    (document.getElementById("tab_msg") as HTMLElement).textContent = error ? "Couldn't send: " + error.message + " [" + (configured ? "host " + new URL(import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL).host + ", key " + String((import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "").length) + " chars" : "NOT CONFIGURED: env vars missing from build") + "]" : "Check your email for the sign-in link.";
  });
}

let started = false;
async function start() {
  if (started) return;
  started = true;
  await installPlatform();
  const w = window as unknown as { tabulaApp: boolean; tabulaImportZip: (f: File) => Promise<void> };
  w.tabulaApp = true;
  w.tabulaImportZip = importZip;
  const s = document.createElement("script");
  s.src = "/legacy/app.js";
  document.body.appendChild(s);
}

(async () => {
  if (!configured) return gate();
  const { data } = await supabase.auth.getSession();
  if (data.session) return start();
  gate();
  supabase.auth.onAuthStateChange((_ev, session) => { if (session) start(); });
})();

// expose sign-out for the app's Data page
(window as unknown as { tabulaSignOut: () => Promise<void> }).tabulaSignOut = async () => { await supabase.auth.signOut(); location.reload(); };
