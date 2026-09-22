import { httpActionGeneric, httpRouter } from "convex/server";
import { streamAudioFromUrl } from "./audioProxy";

const http = httpRouter();

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Preflight for cross-origin GETs from the landing page.
http.route({
  path: "/audio-proxy",
  method: "OPTIONS",
  handler: httpActionGeneric(async () => new Response(null, { status: 204, headers: corsHeaders })),
});

// Proxy remote audio (incl. YouTube) so the DJ overlay can analyse real
// audio in the browser. Public, unauthenticated, read-only.
http.route({
  path: "/audio-proxy",
  method: "GET",
  handler: httpActionGeneric(async (_ctx, request) => {
    const url = new URL(request.url).searchParams.get("url");
    if (!url || !/^https:\/\//i.test(url)) {
      return new Response("missing or invalid url", { status: 400, headers: corsHeaders });
    }
    try {
      const upstream = await streamAudioFromUrl(url);
      const headers = new Headers(corsHeaders);
      headers.set("content-type", "audio/mpeg");
      headers.set("accept-ranges", "none");
      headers.set("cache-control", "no-store");
      return new Response(upstream.body, { headers });
    } catch (err) {
      console.error("audio-proxy error:", err);
      return new Response("failed to fetch audio", { status: 502, headers: corsHeaders });
    }
  }),
});

export default http;
