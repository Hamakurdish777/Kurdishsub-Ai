import { Innertube } from "youtubei.js";

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
      const youtube = await Innertube.create();

      const info = await youtube.getInfo(videoId);

      const transcript = await info.getTranscript();

      const text = transcript.transcript.content
        .body
        .initial_segments
        .map(segment => segment.snippet.text)
        .join(" ");

      return new Response(
        JSON.stringify({
          success: true,
          videoId: videoId,
          transcript: text
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
          error: "نەتوانرا Subtitle ـی ئەم ڤیدیۆیە وەربگیرێت",
          details: error.message
        }),
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8"
          }
        }
      );
    }
  }
};