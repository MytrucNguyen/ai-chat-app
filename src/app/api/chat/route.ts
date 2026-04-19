import { NextResponse } from "next/server";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  const { messages }: { messages: Message[] } = await request.json();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
      }),
    }
  );

  const data = await response.json();
  console.log("Gemini response:", JSON.stringify(data, null, 2));

  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn't generate a response.";

  return NextResponse.json({ reply });
}