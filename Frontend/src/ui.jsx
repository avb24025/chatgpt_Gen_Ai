import React, { useState, useRef, useEffect } from "react";


const sid = Date.now().toString(36) + Math.random().toString(36).slice(2, 9);

export default function ChatGPTUI() {
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const idCounter = useRef(1);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // helper to generate ids
  const nextId = () => {
    idCounter.current += 1;
    return idCounter.current;
  };

  // Sends message: adds user message at top and then appends bot response below it (after API)
  async function handleSend(e) {
    e && e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    // create user message and add to state at the top
    const userMsg = { id: nextId(), role: "user", text: trimmed };

    // We're placing newest user messages at index 0 so they appear on top when rendered.
    setMessages(prev => [userMsg, ...prev]);
    setInput("");
    inputRef.current?.focus();

    // show loading state for bot reply
    setIsLoading(true);

    try {
      
      
      // e.g. VITE_BACKEND_URL = "https://chatgpt-gen-backend.vercel.app/" 
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: trimmed, sid }),
      mode: 'cors' // optional; browser uses CORS automatically
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const botText = await res.json();




      // create bot message and insert just BELOW the associated user message.
      // We will insert bot message right after the newest user message so it visually appears below it.
      const botMsg = { id: nextId(), role: "bot", text: botText.reply, parentId: userMsg.id };

      // Insert bot message right after the user message (index 0 => bot at index 1)
      setMessages(prev => {
        const copy = [...prev];
        // find index of userMsg (should be 0 if no intervening messages)
        const userIndex = copy.findIndex(m => m.id === userMsg.id);
        if (userIndex === -1) return [userMsg, botMsg, ...copy];
        copy.splice(userIndex + 1, 0, botMsg);
        return copy;
      });
    } catch (err) {
      console.error(err);
      // push error bot message
      const errMsg = { id: nextId(), role: "bot", text: "Sorry — something went wrong." };
      setMessages(prev => {
        const copy = [...prev];
        const userIndex = copy.findIndex(m => m.id === userMsg.id);
        if (userIndex === -1) return [userMsg, errMsg, ...copy];
        copy.splice(userIndex + 1, 0, errMsg);
        return copy;
      });
    } finally {
      setIsLoading(false);
    }
  }



  // convenience: send message on Enter (Shift+Enter for newline)
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Render message item (user or bot)
  function Message({ msg }) {
    const isUser = msg.role === "user";
    return (
      <div className={`py-2`}>
        {isUser ? (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-xl bg-sky-600 text-white px-4 py-2 shadow-md">
              <div className="text-sm font-medium">You</div>
              <div className="mt-1 whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ) : (
          <div className="flex justify-start ml-6">
            <div className="max-w-[85%] rounded-xl bg-gray-100 text-gray-900 px-4 py-2 border">
              <div className="text-xs font-semibold text-gray-600">Bot</div>
              <div className="mt-1 whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      <header className="p-4 border-b">
        <h1 className="text-xl font-bold">GPT-lite</h1>
        <p className="text-sm text-gray-500">Web Search Support and Chat Context support.</p>
      </header>

      {/* messages area */}
      <main className="flex-1 overflow-auto p-4">
        {/* We'll render messages in array order. Our state keeps newest user messages at start (index 0) */}
        <div className="space-y-4">
          {messages.map(msg => (
            <Message key={msg.id} msg={msg} />
          ))}
        </div>
      </main>

      {/* input area */}
      <form onSubmit={handleSend} className="p-4 border-t bg-white">
        <div className="max-w-3xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question... (Enter to send, Shift+Enter for newline)"
            className="w-full rounded-lg border p-3 resize-none h-24 focus:outline-none focus:ring"
          />

          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-gray-500">Press Enter to send</div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white disabled:opacity-50"
              >
                {isLoading ? "Loading..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
