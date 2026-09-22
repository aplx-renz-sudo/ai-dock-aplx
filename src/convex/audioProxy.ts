const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

/**
 * Resolve a user-supplied URL to a raw audio stream.
 *
 * For YouTube watch / youtu.be / shorts links we fetch the page HTML,
 * extract the googlevideo audio stream URL from the player response and
 * stream those bytes through. For any other https URL we stream it as-is.
 */
export async function streamAudioFromUrl(rawUrl: string): Promise<Response> {
  const target = await resolveAudioUrl(rawUrl);
  if (!target) throw new Error("no audio url resolved");

  const response = await fetch(target, {
    redirect: "follow",
    headers: {
      "User-Agent": BROWSER_UA,
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "Referer": "https://www.youtube.com/",
    },
  });

  if (!response.ok) {
    throw new Error(`remote returned ${response.status}`);
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Accept-Ranges": "none",
    },
  });
}

/** Detect YouTube links and dig the real audio stream URL out of the page. */
async function resolveAudioUrl(rawUrl: string): Promise<string | null> {
  const isYouTube =
    /youtube\.com\/watch\?/i.test(rawUrl) ||
    /youtu\.be\//i.test(rawUrl) ||
    /youtube\.com\/shorts\//i.test(rawUrl);

  if (!isYouTube) return rawUrl;

  // Normalise to a canonical watch URL first.
  const idMatch =
    rawUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([\w-]{11})/) ??
    rawUrl.match(/^([\w-]{11})$/);
  if (!idMatch) return null;

  const pageRes = await fetch(`https://www.youtube.com/watch?v=${idMatch[1]}`, {
    redirect: "follow",
    headers: {
      "User-Agent": BROWSER_UA,
      "Accept": "text/html,*/*",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!pageRes.ok) throw new Error(`youtube page returned ${pageRes.status}`);
  const html = await pageRes.text();

  // The player response contains googlevideo stream URLs; audio-only ones
  // carry "mime=audio" in their query string. URLs escape "&" as "\u0026".
  const candidates: string[] = [];
  for (const m of html.matchAll(/"baseUrl":"(https:\/\/[^"\\]+googlevideo\.com[^"\\]+)"/g)) {
    candidates.push(m[1].replace(/\\u0026/g, "&").replace(/\\\//g, "/"));
  }

  return candidates.find((c) => /mime=audio/i.test(c)) ?? candidates[0] ?? null;
}
