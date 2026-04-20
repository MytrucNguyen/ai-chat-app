"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Sun, Moon, Trash2 } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("chat-messages");
    if (saved) setMessages(JSON.parse(saved));
    const savedTheme = localStorage.getItem("chat-theme");
    if (savedTheme === "dark") setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("chat-messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("chat-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("chat-theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages([...newMessages, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.startsWith("data: "));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.replace("data: ", ""));
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
            assistantContent += text;
            setMessages([
              ...newMessages,
              { role: "assistant", content: assistantContent },
            ]);
          } catch {
            // ignore malformed chunks
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  return (
    <main className="flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      <div className="flex flex-1 flex-col max-w-3xl w-full mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">AI Chat</h1>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 rounded-full border border-gray-300 dark:border-gray-600 px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <Trash2 size={14} />
                Clear Chat
              </button>
            )}
            <button
              onClick={() => setDarkMode(!darkMode)}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              className="flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
          {messages.length === 0 && !isLoading && (
            <div className="flex h-full flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500 py-20">
              <h2 className="text-xl font-medium mb-2">Start a conversation</h2>
              <p className="text-sm">Ask me anything. I&apos;m here to help.</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  message.role === "user"
                    ? "bg-gray-800 text-white dark:bg-gray-700"
                    : "bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                }`}
              >
                {message.role === "assistant" ? (
                  <div className="space-y-2 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_strong]:font-semibold">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="max-w-[75%] rounded-2xl bg-gray-200 dark:bg-gray-800 px-4 py-2 text-gray-500 dark:text-gray-400">
                Thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-end gap-2 rounded-3xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 shadow-sm">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-transparent outline-none resize-none max-h-32 py-1 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="rounded-full bg-gray-800 dark:bg-gray-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-gray-700 dark:hover:bg-gray-500 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}