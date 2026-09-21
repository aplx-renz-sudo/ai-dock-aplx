import { httpRouter } from "convex/server";
import { streamAudioFromUrl } from "./audioProxy";

const http = httpRouter();

// Proxy remote audio so the DJ overlay can analyse real YouTube audio.
// Exposed as a public unauthenticated route — the DJ overlay fetches it
// directly from the browser and feeds the resulting stream into the analyser.
http.route({
  path: "/audio-proxy",
  method: "GET",
  handler: async (ctx: any, request: Request) => {
    const url = new URL(request.url).searchParams.get("url");
    if (!url) {
      return new Response("missing url", { status: 400 });
    }
    try {
      const upstream = await streamAudioFromUrl(url);
      const headers = new Headers(upstream.headers);
      headers.set("content-type", "audio/mpeg");
      headers.set("accept-ranges", "none");
      return new Response(upstream.body, { headers });
    } catch (err) {
      console.error("audio-proxy error:", err);
      return new Response("failed to fetch audio", { status: 502 });
    }
  },
});

export default http;
