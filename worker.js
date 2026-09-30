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

    try {
      const response = await fetch(
  "https://api.freetranscriptapi.com/v1/transcript?video_url=" +
  encodeURIComponent(videoUrl)
);
          headers: {
            "Authorization": "Bearer " + env.FREETRANSCRIPT_API_KEY
          }
        }
      );

      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch (e) {
        return jsonResponse({
          success: false,
          error: "API وەڵامی JSON ـی دروستی نەدا",
          details: text.slice(0, 500)
        }, 502);
      }

      if (!response.ok) {
        return jsonResponse({
          success: false,
          error: "نەتوانرا Transcript وەربگیرێت",
          details: data
        }, response.status);
      }

      return jsonResponse({
        success: true,
        title: data.title,
        language: data.language,
        transcript: data.transcript
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