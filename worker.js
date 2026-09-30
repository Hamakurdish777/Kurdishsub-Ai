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
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    if (url.pathname !== "/api") {
      return new Response("KurdSub AI Backend is running 🚀", {
        headers: corsHeaders
      });
    }

    const videoUrl = url.searchParams.get("url");

    if (!videoUrl) {
      return jsonResponse({
        success: false,
        error: "تکایە لینکی YouTube دابنێ"
      }, 400);
    }

    try {
      const videoId =
        new URL(videoUrl).searchParams.get("v") ||
        videoUrl.split("/").pop().split("?")[0];

      const transcriptResponse = await fetch(
        "https://youtube-transcript.ai/transcript/" +
        encodeURIComponent(videoId) +
        ".txt"
      );

      const transcriptText = await transcriptResponse.text();

      if (!transcriptResponse.ok) {
        return jsonResponse({
          success: false,
          error: "نەتوانرا Transcript وەربگیرێت",
          details: transcriptText.slice(0, 500)
        }, transcriptResponse.status);
      }

      return jsonResponse({
        success: true,
        videoId: videoId,
        transcript: transcriptText
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