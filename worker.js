export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/api") {
      const videoUrl = url.searchParams.get("url");

      if (!videoUrl) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "YouTube URL پێویستە"
          }),
          {
            headers: {
              "Content-Type": "application/json; charset=utf-8"
            }
          }
        );
      }

      const match = videoUrl.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&?/]+)/
      );

      if (!match) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "لینکی YouTube دروست نییە"
          }),
          {
            headers: {
              "Content-Type": "application/json; charset=utf-8"
            }
          }
        );
      }

      const videoId = match[1];

      try {
        const transcriptResponse = await fetch(
          `https://youtube-transcript.ai/transcript/${videoId}.txt?lang=en`
        );

        if (!transcriptResponse.ok) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Subtitle بۆ ئەم ڤیدیۆیە بەردەست نییە"
            }),
            {
              headers: {
                "Content-Type": "application/json; charset=utf-8"
              }
            }
          );
        }

        const transcript = await transcriptResponse.text();

        return new Response(
          JSON.stringify({
            success: true,
            videoId: videoId,
            transcript: transcript
          }),
          {
            headers: {
              "Content-Type": "application/json; charset=utf-8"
            }
          }
        );

      } catch (error) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "کێشەیەک لە وەرگرتنی Subtitle ڕوویدا"
          }),
          {
            headers: {
              "Content-Type": "application/json; charset=utf-8"
            }
          }
        );
      }
    }

    return new Response("KurdSub AI Backend is running 🚀");
  }
};