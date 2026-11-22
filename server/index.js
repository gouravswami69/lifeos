import express from "express";
import { load } from "cheerio";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const PORT = process.env.PORT || 8787;
const OFFICIAL = "https://ggnindia.dronacharya.info/";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());

app.get("/api/college-updates", async (_req, res) => {
  try {
    const response = await fetch(OFFICIAL, {
      headers: { "User-Agent": "lifeOS student dashboard (college notice reader)" },
      signal: AbortSignal.timeout(12000)
    });
    if (!response.ok) throw new Error(`College site returned ${response.status}`);
    const html = await response.text();
    const $ = load(html);
    const matches = [];
    const seen = new Set();

    // Read only links whose visible text/nearby text resembles a dated college update.
    $("a[href]").each((_i, el) => {
      const title = $(el).text().replace(/\s+/g, " ").trim();
      const nearby = $(el).parent().text().replace(/\s+/g, " ").trim();
      const combined = `${title} ${nearby}`;
      const relevant = /(date sheet|examination|academic calendar|notice|event|workshop|placement|announcement|semester|hackathon|industrial visit|talk|competition)/i.test(combined);
      if (!title || title.length < 8 || title.length > 180 || !relevant) return;
      let href = $(el).attr("href");
      if (!href || href.startsWith("#") || href.toLowerCase().startsWith("javascript:")) return;
      try { href = new URL(href, OFFICIAL).toString(); } catch { return; }
      if (!href.startsWith("https://ggnindia.dronacharya.info/")) return;
      const key = `${title.toLowerCase()}|${href}`;
      if (seen.has(key)) return;
      seen.add(key);
      matches.push({
        id: key,
        title,
        detail: nearby === title ? "Published on the official DCE website" : nearby.slice(0, 220),
        url: href,
        source: "Dronacharya College of Engineering"
      });
    });

    res.set("Cache-Control", "public, max-age=1800");
    res.json({ ok: true, checkedAt: new Date().toISOString(), source: OFFICIAL, updates: matches.slice(0, 30) });
  } catch (error) {
    res.status(502).json({
      ok: false,
      error: "The official college website could not be checked right now.",
      detail: error.message,
      source: OFFICIAL
    });
  }
});

if (process.env.NODE_ENV === "production") {
  const dist = path.resolve(__dirname, "../dist");
  app.use(express.static(dist));
  app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
}
app.listen(PORT, () => console.log(`lifeOS server running at http://localhost:${PORT}`));
