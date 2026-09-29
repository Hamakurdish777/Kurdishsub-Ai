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
      return new Response(
        "KurdSub AI Backend is running 🚀",
        { headers: corsHeaders }
      );
    }

    const videoUrl = url.searchParams.get("url");

    if (!videoUrl) {
      return jsonResponse({
        success: false,
        error: "تکایە لینکی YouTube دابنێ"
      }, 400);
    }

    try {
      // 1. وەرگرتنی Transcript
      const transcriptResponse = await fetch(
        "https://api.freetranscriptapi.com/v1/transcript?video_url=" +
        encodeURIComponent(videoUrl)
      );

      const transcriptData = await transcriptResponse.json();

      if (!transcriptResponse.ok) {
        return jsonResponse({
          success: false,
          error: "نەتوانرا Transcript وەربگیرێت",
          details: transcriptData
        }, transcriptResponse.status);
      }

      // 2. کۆکردنەوەی دەق
      const text = transcriptData.transcript
        .map(item => item.text)
        .join(" ");

      if (!text.trim()) {
        return jsonResponse({
          success: false,
          error: "Transcript بەتاڵە"
        }, 400);
      }

      // 3. وەرگێڕان بۆ کوردی سۆرانی
      const translationResponse = await fetch(
        "https://api.zimanox.com/v1/translate",
        {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + env.ZIMANOX_API_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            text: text,
            source: "eng_latn",
            target: "ckb_Arab"
          })
        }
      );

      const translationData = await translationResponse.json();

      if (!translationResponse.ok) {
        return jsonResponse({
          success: false,
          error: "وەرگێڕان سەرکەوتوو نەبوو",
          details: translationData
        }, translationResponse.status);
      }

      // 4. ناردنەوەی ئەنجام
      return jsonResponse({
        success: true,
        title: transcriptData.title,
        translation: translationData.translation
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