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

function byteLength(text) {
  return new TextEncoder().encode(text).length;
}

function makeChunks(items, maxBytes = 430) {
  const chunks = [];
  let current = "";

  for (const item of items) {
    const text = item.text.trim();
    if (!text) continue;

    const candidate = current ? current + " " + text : text;

    if (byteLength(candidate) > maxBytes && current) {
      chunks.push(current);
      current = text;
    } else {
      current = candidate;
    }
  }

  if (current) chunks.push(current);

  return chunks;
}

async function translateChunk(text) {
  const url =
    "https://api.mymemory.translated.net/get?q=" +
    encodeURIComponent(text) +
    "&langpair=en|ckb-IQ";

  const response = await fetch(url);
  const raw = await response.text();

  let data;

  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("MyMemory وەڵامی JSON ـی دروستی نەدا");
  }

  if (!response.ok) {
  throw new Error(
    "MyMemory API error (" +
    response.status +
    "): " +
    raw.slice(0, 500)
  );
}

  if (!data.responseData || !data.responseData.translatedText) {
    throw new Error("وەرگێڕان بەردەست نییە");
  }

  return data.responseData.translatedText;
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
      return new Response(
        "KurdSub AI Backend is running 🚀",
        { headers: corsHeaders }
      );
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

      const transcriptRaw = await transcriptResponse.text();

      let transcriptData;

      try {
        transcriptData = JSON.parse(transcriptRaw);
      } catch {
        return jsonResponse({
          success: false,
          error: "FreeTranscriptAPI وەڵامی دروستی نەدا",
          details: transcriptRaw.slice(0, 300)
        }, 502);
      }

      if (!transcriptResponse.ok) {
        return jsonResponse({
          success: false,
          error: "نەتوانرا Transcript وەربگیرێت",
          details: transcriptData
        }, transcriptResponse.status);
      }

      if (!transcriptData.transcript?.length) {
        return jsonResponse({
          success: false,
          error: "هیچ Transcript ـێک بۆ ئەم ڤیدیۆیە نییە"
        }, 404);
      }

      // 2. دابەشکردنی دەق بۆ پارچەی بچووک
      const chunks = makeChunks(transcriptData.transcript);

      // 3. وەرگێڕان بۆ کوردی سۆرانی
      const translations = [];

      for (const chunk of chunks) {
        const translated = await translateChunk(chunk);
        translations.push(translated);
      }

      // 4. ئەنجام
      return jsonResponse({
        success: true,
        title: transcriptData.title,
        language: transcriptData.language,
        translation: translations.join("\n\n")
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