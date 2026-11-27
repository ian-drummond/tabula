/* Import a "Download all" zip from the original Tabula: restores every record from
   data/tabula-backup.json and uploads the images in assets/images/ to Supabase Storage. */
import { supabase } from "./supabase";

type Entry = { name: string; method: number; csize: number; offset: number };

function readEntries(buf: DataView): Entry[] {
  let eocd = -1;
  for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 66000); i--) {
    if (buf.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("Not a zip file");
  const n = buf.getUint16(eocd + 10, true);
  let p = buf.getUint32(eocd + 16, true);
  const dec = new TextDecoder();
  const out: Entry[] = [];
  for (let k = 0; k < n; k++) {
    if (buf.getUint32(p, true) !== 0x02014b50) throw new Error("Bad zip directory");
    const method = buf.getUint16(p + 10, true), csize = buf.getUint32(p + 20, true);
    const nl = buf.getUint16(p + 28, true), xl = buf.getUint16(p + 30, true), cl = buf.getUint16(p + 32, true);
    const offset = buf.getUint32(p + 42, true);
    const name = dec.decode(new Uint8Array(buf.buffer, buf.byteOffset + p + 46, nl));
    out.push({ name, method, csize, offset });
    p += 46 + nl + xl + cl;
  }
  return out;
}
async function readFile(buf: DataView, e: Entry): Promise<Uint8Array> {
  const nl = buf.getUint16(e.offset + 26, true), xl = buf.getUint16(e.offset + 28, true);
  const start = e.offset + 30 + nl + xl;
  const raw = new Uint8Array(buf.buffer, buf.byteOffset + start, e.csize);
  if (e.method === 0) return raw.slice();
  if (e.method === 8) {
    const ds = new Blob([raw as BlobPart]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    return new Uint8Array(await new Response(ds).arrayBuffer());
  }
  throw new Error("Unsupported zip compression in " + e.name);
}

type W = { importBundle?: (b: unknown, msg: string) => Promise<void>; toast?: (m: string, ms?: number) => void; S?: { busy?: string }; render?: () => void };

export async function importZip(file: File) {
  const w = window as unknown as W;
  const say = (m: string) => { if (w.S && w.render) { w.S.busy = m; w.render(); } };
  try {
    say("Reading the zip…");
    const buf = new DataView(await file.arrayBuffer());
    const entries = readEntries(buf);
    const bk = entries.find((e) => /(^|\/)data\/tabula-backup\.json$/.test(e.name));
    if (!bk) throw new Error("No data/tabula-backup.json in this zip");
    const bundle = JSON.parse(new TextDecoder().decode(await readFile(buf, bk)));
    const files = new Map(entries.filter((e) => /assets\/images\//.test(e.name)).map((e) => [e.name.split("/").pop()!.replace(/\.\w+$/, ""), e]));
    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id;
    if (!uid) throw new Error("Not signed in");
    const imgs: { id: string; aid?: string; data?: string }[] = bundle.imgs || [];
    let up = 0, missing = 0;
    for (let i = 0; i < imgs.length; i++) {
      const m = imgs[i];
      if (m.data) continue; // stored inline already
      const e = files.get(m.id);
      if (!e) { missing++; continue; }
      say(`Uploading images ${i + 1} of ${imgs.length}…`);
      const bytes = await readFile(buf, e);
      const ext = /\.png$/i.test(e.name) ? "png" : "jpg";
      const aid = `${m.id}.${ext}`;
      const { error } = await supabase.storage.from("images").upload(`${uid}/${aid}`, new Blob([bytes as BlobPart], { type: ext === "png" ? "image/png" : "image/jpeg" }), { upsert: true });
      if (error) { missing++; continue; }
      m.aid = aid;
      up++;
    }
    if (w.S) w.S.busy = "";
    if (!w.importBundle) throw new Error("App not ready");
    await w.importBundle(bundle, `Imported (${up} images${missing ? `, ${missing} missing` : ""})`);
  } catch (e) {
    if (w.S && w.render) { w.S.busy = ""; w.render(); }
    w.toast ? w.toast("Import failed: " + (e as Error).message, 8000) : alert("Import failed: " + (e as Error).message);
  }
}
