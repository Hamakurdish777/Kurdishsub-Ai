const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders
    }
  });
}

export default {
  async fetch(request, env) {
    const requestUrl = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    if (requestUrl.pathname !== "/api") {
      return new Response("KurdSub AI Backend is running 🚀", {
        headers: corsHeaders
      });
    }

    const videoUrl = requestUrl.searchParams.get("url");

    if (!videoUrl) {
      return jsonResponse({
        success: false,
        error: "تکایە لینکی YouTube دابنێ"
      }, 400);
    }

    let videoId = videoUrl.trim();

    if (videoId.includes("youtube.com") || videoId.includes("youtu.be")) {
      try {
        const parsed = new URL(videoId);

        if (parsed.searchParams.get("v")) {
          videoId = parsed.searchParams.get("v");
        } else {
          videoId = parsed.pathname
            .split("/")
            .filter(Boolean)
            .pop();
        }
      } catch (e) {
        return jsonResponse({
          success: false,
          error: "لینکی YouTube دروست نییە"
        }, 400);
      }
    }

    try {
      const transcriptUrl =
        "https://youtube-transcript.ai/transcript/" +
        encodeURIComponent(videoId) +
        ".txt";

      const response = await fetch(transcriptUrl);
      const text = await response.text();

      if (!response.ok) {
        return jsonResponse({
          success: false,
          error: "Transcript بەردەست نییە",
          details: text.slice(0, 500)
        }, response.status);
      }

      return jsonResponse({
        success: true,
        videoId: videoId,
        transcript: text
      });

    } catch (error) {
      return jsonResponse({
        success: false,
        error: "کێشەیەک ڕوویدا",
        details: String(error)
      }, 500);
    }
  }
};