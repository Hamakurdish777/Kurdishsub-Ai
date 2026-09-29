export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname !== "/api") {
      return new Response("KurdSub AI Backend is running 🚀");
    }

    const videoUrl = url.searchParams.get("url");

    if (!videoUrl) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "تکایە لینکی YouTube دابنێ"
        }),
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8"
          }
        }
      );
    }

    try {
      const response = await fetch(
        "https://api.freetranscriptapi.com/v1/transcript?video_url=" +
        encodeURIComponent(videoUrl)
      );

      const data = await response.json();

      if (!response.ok) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "نەتوانرا Transcript وەربگیرێت",
            details: data
          }),
          {
            status: response.status,
            headers: {
              "Content-Type": "application/json; charset=utf-8"
            }
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          title: data.title,
          language: data.language,
          transcript: data.transcript
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
          error: "کێشەیەک لە وەرگرتنی Transcript ڕوویدا",
          details: String(error)
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json; charset=utf-8"
          }
        }
      );
    }
  }
};