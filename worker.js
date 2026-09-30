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
      const transcriptResponse = await fetch(const dnsTest = await fetch("https://api.freetranscriptapi.com/");
return new Response(await dnsTest.text(), {
  status: dnsTest.status,
  headers: corsHeaders
});
        "https://api.freetranscriptapi.com/v1/transcript?video_url=" +
        encodeURIComponent(videoUrl)
      );

      const transcriptText = await transcriptResponse.text();

let transcriptData;

try {
  transcriptData = JSON.parse(transcriptText);
} catch {
  return jsonResponse({
    success: false,
    error: "FreeTranscriptAPI وەڵامێکی دروست نەدا",
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
      const videoId = new URL(videoUrl).searchParams.get("v") || videoUrl.split("/").pop().split("?")[0];

const transcriptResponse = await fetch(
  "https://youtube-transcript.ai/transcript/" + encodeURIComponent(videoId) + ".txt"
);

const transcriptText = await transcriptResponse.text();

if (!transcriptResponse.ok) {
  return jsonResponse({
    success: false,
    error: "نەتوانرا Transcript وەربگیرێت",
    details: transcriptText.slice(0, 500)
  }, transcriptResponse.status);
}

const transcriptData = {
  title: "",
  transcript: transcriptText
    .split("\n")
    .filter(line => line.trim())
    .map(line => ({
      text: line.replace(/^\[\d+:\d+\]\s*/, "").trim()
    }))
};
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