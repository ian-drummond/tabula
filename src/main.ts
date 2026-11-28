import "./appearance";
import { supabase, configured } from "./supabase";
import { installPlatform } from "./platform";
import { importZip } from "./importZip";
import { showGate, isResetLink } from "./auth";
import { logoMarkSvg } from "./components/logo";

let started = false;
async function start() {
  if (started) return;
  started = true;
  document.body.classList.remove("gate");
  const c = document.getElementById("content");
  if (c) c.innerHTML = `<p class="mute">Loading journal…</p>`;
  await installPlatform();
  const w = window as unknown as { tabulaApp: boolean; tabulaImportZip: (f: File) => Promise<void> };
  w.tabulaApp = true;
  (window as unknown as { tabulaBrand: unknown }).tabulaBrand = { mark: (size: number) => logoMarkSvg({ size }) };
  w.tabulaImportZip = importZip;
  const s = document.createElement("script");
  s.src = "/legacy/app.js";
  document.body.appendChild(s);
}

(async () => {
  if (!configured) return showGate("unconfigured");
  const resetting = isResetLink();
  const { data } = await supabase.auth.getSession();
  if (data.session && resetting) return showGate("reset", { email: data.session.user.email || "", onDone: start });
  if (data.session) return start();
  showGate(resetting ? "forgot" : "signin");
  supabase.auth.onAuthStateChange((ev, session) => {
    if (ev === "PASSWORD_RECOVERY") return showGate("reset", { email: session?.user.email || "", onDone: start });
    if (session && ev === "SIGNED_IN" && !isResetLink()) start();
  });
})();

// sign-out for the app's Data page
(window as unknown as { tabulaSignOut: () => Promise<void> }).tabulaSignOut = async () => { await supabase.auth.signOut(); location.reload(); };
