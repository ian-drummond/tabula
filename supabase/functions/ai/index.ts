// Tabula AI proxy: the browser sends a prompt (and optional images); this function calls the
// Anthropic Messages API with the key kept in Supabase secrets. Only signed-in users can call it
// (Supabase verifies the JWT before this code runs).
// Secrets: ANTHROPIC_API_KEY (required); TABULA_MODEL_QUICK / TABULA_MODEL_DEFAULT (optional).
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const MODELS: Record<string, string> = {
  quick: Deno.env.get("TABULA_MODEL_QUICK") || "claude-haiku-5-5",
  default: Deno.env.get("TABULA_MODEL_DEFAULT") || "claude-sonnet-5-5",
  deep: Deno.env.get("TABULA_MODEL_DEEP") || "claude-sonnet-5-5",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const key = Deno.env.get("ANTHROPIC_API_KEY");
    if (!key) return json({ error: "ANTHROPIC_API_KEY is not set" }, 500);
    const { prompt, tier = "default", images, json: wantJson } = await req.json();
    if (typeof prompt !== "string" || !prompt) return json({ error: "prompt required" }, 400);
    if (prompt.length > 400_000) return json({ error: "prompt too long" }, 413);
    const content: unknown[] = [];
    for (const im of (Array.isArray(images) ? images : []).slice(0, 4)) {
      content.push({ type: "image", source: { type: "base64", media_type: im.media_type || "image/jpeg", data: im.data } });
    }
    content.push({ type: "text", text: prompt });
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: MODELS[tier] || MODELS.default,
        max_tokens: wantJson ? 8000 : 4000,
        system: "You are the assistant inside Tabula, a personal planner and journal app. Follow the instructions in the user message exactly." + (wantJson ? " Reply with valid JSON only, no prose and no code fences." : ""),
        messages: [{ role: "user", content }],
      }),
    });
    const out = await r.json();
    if (!r.ok) return json({ error: out?.error?.message || "Anthropic API error" }, 502);
    const text = (out.content || []).filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("");
    return json({ text, usage: out.usage });
  } catch (e) {
    return json({ error: String((e as Error).message || e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "content-type": "application/json" } });
}
