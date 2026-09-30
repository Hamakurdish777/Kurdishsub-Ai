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
      // 1. وەرگرتنی Transcript
      const transcriptResponse = await fetch(
        "https://api.freetranscriptapi.com/v1/transcript?video_url=" +
        encodeURIComponent(videoUrl)
      );

      const transcriptText = await transcriptResponse.text();

      let transcriptData;

      try {
        transcriptData = JSON.parse(transcriptText);
      } catch (e) {
        return jsonResponse({
          success: false,
          error: "FreeTranscriptAPI وەڵامی دروستی نەدا",
          details: transcriptText.slice(0, 500)
        }, 502);
      }

      if (!transcriptResponse.ok) {
        return jsonResponse({
          success: false,
          error: "نەتوانرا Transcript وەربگیرێت",
          details: transcriptData
        }, transcriptResponse.status);
      }

      if (!transcriptData.transcript || !transcriptData.transcript.length) {
        return jsonResponse({
          success: false,
          error: "هیچ Transcript ـێک بۆ ئەم ڤیدیۆیە نییە"
        }, 404);
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
            source: "en",
            target: "ckb"
          })
        }
      );

      const translationText = await translationResponse.text();

      let translationData;

      try {
        translationData = JSON.parse(translationText);
      } catch (e) {
        return jsonResponse({
          success: false,
          error: "Zimanox وەڵامی دروستی نەدا",
          details: translationText.slice(0, 500)
        }, 502);
      }

      if (!translationResponse.ok) {
        return jsonResponse({
          success: false,
          error: "وەرگێڕان سەرکەوتوو نەبوو",
          details: translationData
        }, translationResponse.status);
      }

      // 4. ناردنی ئەنجام
      return jsonResponse({
        success: true,
        title: transcriptData.title,
        language: transcriptData.language,
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