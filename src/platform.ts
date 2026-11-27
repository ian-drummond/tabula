/*
  Platform adapter: gives the Tabula app the same capabilities it had as a claude.ai artifact
  (window.claude.use("db" | "sample" | "assets" | "downloads" | "dictation" | "mcp")),
  backed by Supabase (database, storage, an Edge Function for AI) and the browser.
*/
import { supabase } from "./supabase";

type Data = Record<string, unknown>;
type Doc = { id: string; exists: boolean; data: () => Data };
type Snap = { docs: Doc[] };

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
const splitPath = (p: string): [string, string] => {
  const i = p.indexOf("/");
  return [p.slice(0, i), p.slice(i + 1)];
};

/* ---------- db ---------- */
const cache = new Map<string, Map<string, Data>>();
const listeners = new Map<string, Set<(s: Snap) => void>>();
const emitTimers = new Map<string, number>();

function snapshot(coll: string): Snap {
  const m = cache.get(coll) || new Map();
  return { docs: [...m.entries()].map(([id, d]) => ({ id, exists: true, data: () => clone(d) })) };
}
function emit(coll: string) {
  clearTimeout(emitTimers.get(coll));
  emitTimers.set(coll, window.setTimeout(() => {
    const s = snapshot(coll);
    (listeners.get(coll) || new Set()).forEach((cb) => cb(s));
  }, 40));
}
async function loadColl(coll: string) {
  const m = new Map<string, Data>();
  const page = 1000;
  for (let from = 0; ; from += page) {
    const { data, error } = await supabase
      .from("records").select("id,data").eq("coll", coll).is("deleted_at", null)
      .order("id").range(from, from + page - 1);
    if (error) throw error;
    (data || []).forEach((r) => m.set(r.id as string, r.data as Data));
    if (!data || data.length < page) break;
  }
  cache.set(coll, m);
}
let channelStarted = false;
function startRealtime() {
  if (channelStarted) return;
  channelStarted = true;
  supabase.channel("records-all")
    .on("postgres_changes", { event: "*", schema: "public", table: "records" }, (p) => {
      const row = (p.new && Object.keys(p.new).length ? p.new : p.old) as { coll?: string; id?: string; data?: Data; deleted_at?: string | null };
      if (!row || !row.coll || !row.id) return;
      const m = cache.get(row.coll);
      if (!m) return;
      if (p.eventType === "DELETE" || (p.new as { deleted_at?: string | null }).deleted_at) m.delete(row.id);
      else if (row.data) m.set(row.id, row.data);
      emit(row.coll);
    })
    .subscribe();
}

const db = {
  collection(coll: string) {
    return {
      onSnapshot(cb: (s: Snap) => void, onErr?: (e: { code?: string; message?: string }) => void) {
        if (!listeners.has(coll)) listeners.set(coll, new Set());
        listeners.get(coll)!.add(cb);
        (cache.has(coll) ? Promise.resolve() : loadColl(coll))
          .then(() => { cb(snapshot(coll)); startRealtime(); })
          .catch((e) => onErr && onErr({ code: e.code, message: e.message }));
        return () => listeners.get(coll)!.delete(cb);
      },
    };
  },
  doc(path: string) {
    const [coll, id] = splitPath(path);
    return {
      async get(): Promise<Doc> {
        const { data, error } = await supabase.from("records").select("data").eq("coll", coll).eq("id", id).is("deleted_at", null).maybeSingle();
        if (error) throw error;
        return { id, exists: !!data, data: () => clone((data?.data as Data) || {}) };
      },
      async set(obj: Data) {
        const d = clone(obj);
        if (!cache.has(coll)) cache.set(coll, new Map());
        cache.get(coll)!.set(id, d);
        const { error } = await supabase.from("records").upsert({ owner: uid, coll, id, data: d, deleted_at: null }, { onConflict: "owner,coll,id" });
        if (error) { console.error("save failed", coll, id, error); throw error; }
      },
      async delete() {
        cache.get(coll)?.delete(id);
        const { error } = await supabase.from("records").delete().eq("coll", coll).eq("id", id);
        if (error) throw error;
        emit(coll);
      },
    };
  },
};

/* ---------- AI (Edge Function "ai" holds the Anthropic key) ---------- */
async function blobToB64(b: Blob): Promise<{ media_type: string; data: string }> {
  const buf = new Uint8Array(await b.arrayBuffer());
  let s = "";
  for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return { media_type: b.type || "image/jpeg", data: btoa(s) };
}
type SampleOpts = { modelTier?: "quick" | "default" | "deep"; images?: Blob[]; cache?: boolean; json?: boolean };
async function callAI(prompt: string, o: SampleOpts = {}) {
  const images = o.images ? await Promise.all(o.images.map(blobToB64)) : undefined;
  const { data, error } = await supabase.functions.invoke("ai", { body: { prompt, tier: o.modelTier || "default", images, json: !!o.json } });
  if (error) { const e = new Error(error.message || "AI call failed") as Error & { code?: string }; e.code = "ai_error"; throw e; }
  return { text: String((data as { text?: string })?.text || "") };
}
function firstJson(t: string): unknown {
  const s = t.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  const a = s.search(/[[{]/);
  if (a < 0) return null;
  const open = s[a], close = open === "{" ? "}" : "]";
  let depth = 0, inStr = false, esc = false;
  for (let i = a; i < s.length; i++) {
    const c = s[i];
    if (inStr) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === open) depth++;
    else if (c === close && --depth === 0) { try { return JSON.parse(s.slice(a, i + 1)); } catch { return null; } }
  }
  return null;
}
const sample = Object.assign(
  (prompt: string, o?: SampleOpts) => callAI(prompt, o),
  {
    json: async (prompt: string, o?: SampleOpts) => firstJson((await callAI(prompt + "\n\nReply with the JSON only.", { ...o, json: true })).text),
    limits: async () => ({ images: true }),
  },
);

/* ---------- assets (Supabase Storage, private bucket "images") ---------- */
const signed = new Map<string, string>();
let uid = "";
const assetPath = (id: string) => `${uid}/${id}`;
async function signMany(ids: string[]) {
  const need = ids.filter((id) => id && !signed.has(id));
  for (let i = 0; i < need.length; i += 100) {
    const chunk = need.slice(i, i + 100);
    const { data } = await supabase.storage.from("images").createSignedUrls(chunk.map(assetPath), 60 * 60 * 24 * 7);
    (data || []).forEach((r, k) => { if (r.signedUrl) signed.set(chunk[k], r.signedUrl); });
  }
}
(window as unknown as { tabulaAssetUrl: (id: string) => string }).tabulaAssetUrl = (id: string) => {
  if (!id) return "";
  const u = signed.get(id);
  if (u) return u;
  signMany([id]).then(() => {
    if (signed.has(id)) document.querySelectorAll<HTMLImageElement>(`img[data-aid="${CSS.escape(id)}"]`).forEach((im) => (im.src = signed.get(id)!));
    const w = window as unknown as { paintContent?: () => void };
    clearTimeout((window as unknown as { _tabSign?: number })._tabSign);
    (window as unknown as { _tabSign?: number })._tabSign = window.setTimeout(() => w.paintContent && w.paintContent(), 300);
  });
  return "data:image/gif;base64,R0lGODlhAQABAAAAACw=";
};
const assets = {
  async upload(blob: Blob) {
    const id = crypto.randomUUID() + (blob.type === "image/png" ? ".png" : ".jpg");
    const { error } = await supabase.storage.from("images").upload(assetPath(id), blob, { contentType: blob.type || "image/jpeg", upsert: false });
    if (error) throw error;
    await signMany([id]);
    return { id };
  },
  async delete(id: string) { await supabase.storage.from("images").remove([assetPath(id)]); signed.delete(id); },
};

/* ---------- downloads ---------- */
const downloads = {
  async save({ filename, data }: { filename: string; data: string | Blob | ArrayBuffer | ArrayBufferView }) {
    const blob = data instanceof Blob ? data : new Blob([data as BlobPart]);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
    return { status: "saved" as const };
  },
};

/* ---------- dictation (browser speech recognition) ---------- */
function makeDictation() {
  const W = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
  const Ctor = W.SpeechRecognition || W.webkitSpeechRecognition;
  if (!Ctor) return null;
  type Res = { isFinal: boolean; 0: { transcript: string } };
  type SpeechRec = { continuous: boolean; interimResults: boolean; lang: string; start(): void; stop(): void;
    onresult: ((e: { resultIndex: number; results: ArrayLike<Res> }) => void) | null; onend: (() => void) | null; onerror: ((e: { error: string }) => void) | null };
  let rec: SpeechRec | null = null, want = false;
  const cbs = { partial: [] as ((x: { text: string }) => void)[], final: [] as ((x: { text: string }) => void)[], state: [] as ((x: { state: string }) => void)[] };
  const setState = (state: string) => cbs.state.forEach((f) => f({ state }));
  return {
    onPartial(f: (x: { text: string }) => void) { cbs.partial.push(f); return () => {}; },
    onFinal(f: (x: { text: string }) => void) { cbs.final.push(f); return () => {}; },
    onState(f: (x: { state: string }) => void) { cbs.state.push(f); return () => {}; },
    async start() {
      want = true;
      rec = new Ctor();
      rec.continuous = true; rec.interimResults = true; rec.lang = navigator.language || "en-US";
      rec.onresult = (e) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) cbs.final.forEach((f) => f({ text: r[0].transcript.trim() }));
          else interim += r[0].transcript;
        }
        if (interim) cbs.partial.forEach((f) => f({ text: interim }));
      };
      rec.onerror = (e) => { if (e.error === "not-allowed") { want = false; setState("idle"); } };
      rec.onend = () => { if (want && rec) { try { rec.start(); } catch { setState("idle"); } } else setState("idle"); };
      rec.start();
      setState("listening");
    },
    async stop() { want = false; try { rec?.stop(); } catch { /* ignore */ } setState("idle"); },
  };
}

/* ---------- install ---------- */
export async function installPlatform() {
  const { data } = await supabase.auth.getUser();
  uid = data.user?.id || "";
  const caps: Record<string, unknown> = {
    db, sample, assets, downloads,
    dictation: makeDictation(),
    mcp: null, // Google Calendar / Evernote: to come through OAuth in an Edge Function
  };
  (window as unknown as { claude: { use: (n: string) => Promise<unknown> } }).claude = {
    use: async (n: string) => caps[n] ?? null,
  };
  // pre-sign image URLs once the images collection is known
  db.collection("imgs").onSnapshot((s) => {
    const ids = s.docs.map((d) => (d.data() as { aid?: string }).aid).filter(Boolean) as string[];
    signMany(ids).then(() => { const w = window as unknown as { paintContent?: () => void; S?: { ready?: boolean } }; if (w.S?.ready && w.paintContent) w.paintContent(); });
  });
}
