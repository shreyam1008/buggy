import { useState, useEffect, useRef } from 'react';
import { useLiveChat } from '../hooks/useLiveChat';

export default function ChatRoom() {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [now, setNow] = useState(Date.now());

  const { socketExists, messages, myName, canWrite, connected, typists, sendMessage, sendTyping, deleteMessage } = useLiveChat();

  // Update "now" for the 30-second delete window calculation
  useEffect(() => {
    const int = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(int);
  }, []);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !canWrite) return;
    sendMessage(input);
    setInput('');
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!canWrite) return;
    
    sendTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 2000);
  };

  if (!socketExists) {
    return (
      <div className="max-w-3xl mx-auto pt-12 lg:pt-0">
        <h1 className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">Live Ashram</h1>
        <p className="text-red-500 mt-4">VITE_API_URL is missing. Cannot connect to chat.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-2rem)] pt-12 lg:pt-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent flex items-center gap-2">
            Live Ashram
            <span className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 transition-colors">
            {connected ? (canWrite ? `Connected as ${myName}` : `Observing as ${myName} (Room Full)`) : 'Connecting...'}
          </p>
        </div>
      </div>

      <div className="flex flex-col flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors duration-300">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
              Silence in the ashram...
            </div>
          )}
          
          {messages.map((msg, i) => {
            if (msg.type === 'system') {
              return (
                <div key={i} className="flex justify-center animate-in fade-in duration-300">
                  <span className="text-[10px] sm:text-xs font-medium px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full transition-colors">
                    {msg.message}
                  </span>
                </div>
              );
            }

            const me = msg.username === myName;
            const age = msg.createdAt ? now - msg.createdAt : 99999;
            const canDelete = me && age <= 30000;

            return (
              <div key={msg.id || i} className={`flex flex-col animate-in fade-in slide-in-from-bottom-2 ${me ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mb-1 px-1">{msg.username}</span>
                <div className={`group relative max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm transition-colors ${
                  me 
                    ? 'bg-orange-600 text-white rounded-br-sm' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-700/50 rounded-bl-sm'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-[15px]">{msg.message}</p>
                  
                  {canDelete && (
                    <button 
                      onClick={() => msg.id && deleteMessage(msg.id)}
                      className="absolute -top-3 -right-2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all cursor-pointer shadow-md"
                    >
                      Delete ({30 - Math.floor(age/1000)}s)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          
          {typists.size > 0 && (
            <div className="flex justify-start animate-in fade-in">
              <span className="text-[10px] italic text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1.5">
                {Array.from(typists).join(', ')} {typists.size === 1 ? 'is' : 'are'} writing...
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" />
                  <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </span>
              </span>
            </div>
          )}
          <div ref={bottomRef} className="h-1" />
        </div>

        <form onSubmit={send} className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 transition-colors">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={handleInput}
              placeholder={connected ? (canWrite ? 'Speak your mind...' : 'Room is currently full (10 max). Observing...') : 'Connecting...'}
              disabled={!connected || !canWrite}
              maxLength={500}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-4 pr-12 py-3 outline-none focus:border-orange-500 transition-all disabled:opacity-60 shadow-inner text-sm text-slate-900 dark:text-white dark:placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || !connected || !canWrite}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed shadow text-white"
            >
              🚀
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
