export default {
  async fetch(request) {
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