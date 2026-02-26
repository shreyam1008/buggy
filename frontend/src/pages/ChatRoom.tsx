import { useState, useEffect, useRef, memo } from 'react';
import { useLiveChat } from '../hooks/useLiveChat';
import type { ChatMessage } from '../hooks/useLiveChat';

// ──────────────────────────────────────────────────
// Isolated delete countdown — only THIS bubble re-renders every second
// ──────────────────────────────────────────────────
const DeletableBubble = memo(function DeletableBubble({ 
  msg, isMe, onDelete 
}: { 
  msg: ChatMessage; isMe: boolean; onDelete: (id: string) => void;
}) {
  const [remaining, setRemaining] = useState(() => {
    if (!msg.createdAt) return 0;
    return Math.max(0, 30 - Math.floor((Date.now() - msg.createdAt) / 1000));
  });

  useEffect(() => {
    if (remaining <= 0) return;
    const t = setInterval(() => {
      if (!msg.createdAt) return;
      const left = Math.max(0, 30 - Math.floor((Date.now() - msg.createdAt) / 1000));
      setRemaining(left);
      if (left <= 0) clearInterval(t);
    }, 1000);
    return () => clearInterval(t);
  }, [msg.createdAt, remaining]);

  return (
    <div className={`flex flex-col chat-msg-enter ${isMe ? 'items-end' : 'items-start'}`}>
      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mb-0.5 px-1">{msg.username}</span>
      <div className={`group relative max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${
        isMe 
          ? 'bg-orange-600 text-white rounded-br-sm' 
          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-700/50 rounded-bl-sm'
      }`}>
        <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-[15px]">{msg.message}</p>
        
        {isMe && remaining > 0 && (
          <button 
            onClick={() => msg.id && onDelete(msg.id)}
            className="absolute -top-3 -right-2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all cursor-pointer shadow-md"
          >
            Delete ({remaining}s)
          </button>
        )}
      </div>
    </div>
  );
});

// ──────────────────────────────────────────────────
// Main ChatRoom component
// ──────────────────────────────────────────────────
export default function ChatRoom() {
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showNewPill, setShowNewPill] = useState(false);

  const { 
    socketExists, messages, myName, canWrite, connected, 
    typists, hasMore, sendMessage, sendTyping, deleteMessage, loadOlder 
  } = useLiveChat();

  const isNearBottom = () => {
    const el = scrollAreaRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  useEffect(() => {
    if (isNearBottom()) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setShowNewPill(false);
    } else {
      if (messages.length > 0) setShowNewPill(true);
    }
  }, [messages]);

  const onScroll = () => {
    if (isNearBottom()) setShowNewPill(false);
  };

  const jumpToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowNewPill(false);
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !canWrite) return;
    sendMessage(input);
    setInput('');
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!canWrite) return;
    sendTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => sendTyping(false), 2000);
  };

  // ── Status bar content ──
  const statusDot = connected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse';
  const statusText = connected
    ? canWrite ? `${myName}` : `${myName} · Observing`
    : 'Connecting…';
  const statusBadge = connected
    ? canWrite 
      ? <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded">Live</span>
      : <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded">Full (10/10)</span>
    : <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-500/15 text-slate-500 rounded animate-pulse">Connecting</span>;

  if (!socketExists) {
    return (
      <div className="max-w-3xl mx-auto pt-12 lg:pt-0">
        <h1 className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">Live Ashram</h1>
        <p className="text-red-500 mt-4">VITE_API_URL is missing. Cannot connect to chat.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[100dvh] lg:h-[calc(100vh-2rem)] pt-12 lg:pt-0 overflow-hidden">
      {/* Header — compact, clear status */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0 px-1">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent flex items-center gap-2">
            Live Ashram
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot}`} />
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
              {statusText}
            </p>
            {statusBadge}
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors duration-300 relative">
        
        {/* Messages Area */}
        <div 
          ref={scrollAreaRef}
          onScroll={onScroll}
          className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-3"
        >
          {/* Load Older */}
          {hasMore && (
            <div className="flex justify-center pb-2">
              <button 
                onClick={loadOlder}
                className="text-[10px] sm:text-xs font-medium px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                ↑ Load older
              </button>
            </div>
          )}

          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
              Silence in the ashram…
            </div>
          )}
          
          {messages.map((msg, i) => {
            if (msg.type === 'system') {
              return (
                <div key={`sys-${i}`} className="flex justify-center chat-msg-enter">
                  <span className="text-[10px] sm:text-xs font-medium px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full transition-colors">
                    {msg.message}
                  </span>
                </div>
              );
            }

            return (
              <DeletableBubble
                key={msg.id || `msg-${i}`}
                msg={msg}
                isMe={msg.username === myName}
                onDelete={deleteMessage}
              />
            );
          })}
          
          {/* Typing indicator */}
          {typists.size > 0 && (
            <div className="flex justify-start chat-msg-enter">
              <span className="text-[10px] italic text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1.5">
                {Array.from(typists).join(', ')} {typists.size === 1 ? 'is' : 'are'} writing
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" />
                  <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                </span>
              </span>
            </div>
          )}

          <div ref={bottomRef} className="h-px" />
        </div>

        {/* New messages pill */}
        {showNewPill && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
            <button
              onClick={jumpToBottom}
              className="px-4 py-1.5 bg-orange-600 text-white text-xs font-semibold rounded-full shadow-lg hover:bg-orange-500 transition-all cursor-pointer animate-bounce"
            >
              ↓ New messages
            </button>
          </div>
        )}

        {/* Input Area */}
        <form 
          onSubmit={send} 
          className="flex-shrink-0 p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 transition-colors"
        >
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={handleInput}
              placeholder={connected 
                ? (canWrite ? 'Speak your mind…' : 'Room full — observing only') 
                : 'Connecting…'}
              disabled={!connected || !canWrite}
              maxLength={500}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-4 pr-12 py-2.5 sm:py-3 outline-none focus:border-orange-500 transition-all disabled:opacity-50 text-sm text-slate-900 dark:text-white dark:placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || !connected || !canWrite}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
