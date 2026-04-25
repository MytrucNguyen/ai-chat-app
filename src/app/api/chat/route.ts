type Message = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  const { messages }: { messages: Message[] } = await request.json();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: "You are Vex, a friendly nine-tailed kitsune AI assistant. Keep your responses concise and conversational - aim for 2-4 short paragraphs max. Use bullet points sparingly. If a topic needs a longer explanation, give a brief summary first and offer to go deeper if the user wants. Never write essay-length responses. Be helpful but brief.",
            },
          ],
        },
        contents: messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
      }),
    }
  );

  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}