export async function streamAudioFromUrl(url: string): Promise<Response> {
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      // Some CDNs reject default browser UA; supply a neutral one.
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      "Accept":
        "*/*",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(`remote returned ${response.status}`);
  }

  // Return the raw body so the browser can pipe it into an audio element / MediaElementAudioSourceNode.
  return new Response(response.body, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Accept-Ranges": "none",
    },
  });
}
