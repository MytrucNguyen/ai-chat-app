# AI Chat App

A minimalist AI chat application built with Next.js, TypeScript, and Tailwind CSS. Powered by Google's Gemini API with real-time streaming responses.

![AI Chat App Screenshot](./public/screenshot.png)

## Features

- Real-time streaming responses from Google Gemini 2.5 Flash-Lite (text appears word-by-word)
- Markdown rendering in assistant responses (bullets, bold, headings)
- Dark mode toggle with persistent theme preference
- Conversation history saved to localStorage (survives page refresh)
- Auto-scroll to latest message
- Clear chat button with confirmation via icon
- Empty state welcome message for new conversations
- Multi-line textarea input (Enter to send, Shift+Enter for new line)
- Loading state with "Thinking..." indicator
- Fully typed with TypeScript
- Responsive, Claude-inspired chat UI with aligned message bubbles
- Secure API key handling via environment variables (server-side only)
- Accessible icon-only buttons with ARIA labels

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Markdown:** react-markdown
- **Icons:** lucide-react
- **LLM:** Google Gemini API (gemini-2.5-flash-lite)

## Architecture

The app uses Next.js API routes to keep the Gemini API key secure on the server. The frontend never sees the API key. All requests flow through the server, where the key is injected from environment variables.

**Flow:** Browser (page.tsx) → Next.js API Route (/api/chat) → Gemini Streaming API

The backend uses Gemini's `streamGenerateContent` endpoint and forwards the ReadableStream directly to the frontend. The frontend reads chunks as they arrive and appends to the assistant message in real time, giving users immediate visual feedback.

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- A Google AI Studio API key (get one at https://aistudio.google.com/app/apikey)

### Installation

1. Clone the repository:

       git clone https://github.com/MytrucNguyen/ai-chat-app.git
       cd ai-chat-app

2. Install dependencies:

       npm install

3. Create a `.env.local` file in the project root and add your API key:

       GEMINI_API_KEY=your_key_here

4. Run the development server:

       npm run dev

5. Open http://localhost:3000 in your browser.

## Project Structure

- `src/app/api/chat/route.ts` — Backend endpoint that streams Gemini responses
- `src/app/page.tsx` — Main chat UI with state management
- `src/app/globals.css` — Tailwind imports, dark mode variant, and global styles
- `src/app/layout.tsx` — Root layout
- `public/screenshot.png` — Demo screenshot

## Key Technical Decisions

- **Streaming over polling:** Chose Server-Sent Events (SSE) via ReadableStream for real-time responses, providing better perceived performance than waiting for the full response
- **localStorage for persistence:** Chose client-side storage over a database for simplicity; conversations are user-specific and don't need server-side sync for this scope
- **Class-based dark mode:** Configured Tailwind v4 with a custom variant for dark mode toggling via a `dark` class on the HTML element, allowing user preference over OS preference
- **Icon-only theme toggle with ARIA label:** Kept the UI minimal while maintaining accessibility for screen readers

## Roadmap

- Streaming response improvements (error handling for network interruptions)
- Conversation export (download as markdown)
- Message editing and regeneration
- Multi-conversation support with sidebar
- Model switcher (choose between Gemini models)