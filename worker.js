export default {
  async fetch(request) {
    const url = new URL(request.url);

    // API endpoint
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
            error: "ئەمە لینکی دروستی YouTube نییە"
          }),
          {
            headers: {
              "Content-Type": "application/json; charset=utf-8"
            }
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "لینکی YouTube وەرگیرا ✅",
          videoId: match[1]
        }),
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8"
          }
        }
      );
    }

    return new Response(
      "KurdSub AI Backend is running 🚀",
      {
        headers: {
          "Content-Type": "text/plain; charset=utf-8"
        }
      }
    );
  }
};