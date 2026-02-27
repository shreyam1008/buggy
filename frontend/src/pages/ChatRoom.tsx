import { useState, useEffect, useRef, memo } from 'react';
import { useLiveChat } from '../hooks/useLiveChat';
import type { ChatMessage } from '../hooks/useLiveChat';

// ──────────────────────────────────────────────────
// Isolated delete countdown
// ──────────────────────────────────────────────────
const DeletableBubble = memo(function DeletableBubble({ 
  msg, isMe, showName, showTail, onDelete 
}: { 
  msg: ChatMessage; isMe: boolean; showName: boolean; showTail: boolean; onDelete: (id: string) => void;
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

  // WhatsApp-style bubble classes
  const bubbleClasses = isMe 
    ? `bg-[#005c4b] text-white ${showTail ? 'rounded-tr-none' : ''}`
    : `bg-white dark:bg-[#1f2c34] text-slate-900 dark:text-slate-100 shadow-sm ${showTail ? 'rounded-tl-none' : ''}`;

  return (
    <div className={`flex flex-col chat-msg-enter ${isMe ? 'items-end' : 'items-start'} ${!showName ? 'mt-0.5' : 'mt-3'}`}>
      {showName && !isMe && (
        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mb-0.5 ml-1">{msg.username}</span>
      )}
      <div className={`group relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 py-1.5 sm:py-2 ${bubbleClasses}`}>
        {/* Tail SVG (Only for first message in group) */}
        {showTail && (
          <svg viewBox="0 0 8 13" width="8" height="13" className={`absolute top-0 ${isMe ? '-right-[7px] text-[#005c4b]' : '-left-[7px] text-white dark:text-[#1f2c34]'} fill-current`}>
            {isMe ? (
              <path d="M5.188 1H0v11.142c0 .873 1.056 1.31 1.673.693l3.515-3.515A2 2 0 0 0 6 7.906V2a1 1 0 0 0-1-1z" />
            ) : (
              <path d="M2.812 1H8v11.142c0 .873-1.056 1.31-1.673.693L2.812 9.32A2 2 0 0 1 2 7.906V2a1 1 0 0 1 1-1z" />
            )}
          </svg>
        )}
        
        <p className="whitespace-pre-wrap leading-relaxed text-[15px] sm:text-[15px] break-words" style={{ wordBreak: 'break-word' }}>{msg.message}</p>
        
        {isMe && remaining > 0 && (
          <button 
            onClick={() => msg.id && onDelete(msg.id)}
            className="absolute -top-3 -left-2 bg-slate-900/90 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all cursor-pointer shadow-md"
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
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Live Ashram</h1>
        <p className="text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg text-sm">VITE_API_URL is missing. Cannot connect.</p>
      </div>
    );
  }

  // Pre-calculate message groupings (WhatsApp style)
  const groupedMessages = messages.map((msg, idx) => {
    if (msg.type === 'system') return { msg, showName: false, showTail: false };
    
    const prevMsg = messages[idx - 1];
    const isFirstFromUser = !prevMsg || prevMsg.type === 'system' || prevMsg.username !== msg.username;
    
    return { msg, showName: isFirstFromUser, showTail: isFirstFromUser };
  });

  return (
    <div className="flex-1 h-[100dvh] lg:h-screen bg-[#e5ddd5] dark:bg-[#0b141a] sm:border-l border-slate-300 dark:border-slate-800 relative flex justify-center overflow-hidden w-full lg:px-4 lg:py-4">
      {/* WhatsApp style repeating background pattern */}
      <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png")', backgroundSize: '400px' }} />

      <div className="w-full max-w-4xl flex flex-col h-full bg-[#efeae2] dark:bg-[#0b141a] sm:bg-[#efeae2] sm:dark:bg-[#111b21] relative z-10 shadow-2xl sm:shadow-lg sm:rounded-2xl overflow-hidden border border-transparent sm:border-slate-300 sm:dark:border-slate-800/80">
        {/* Header */}
        <div className="flex-shrink-0 bg-slate-100 dark:bg-[#202c33] border-b border-slate-200 dark:border-slate-800/50 px-4 py-3 flex items-center justify-between shadow-sm z-20">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center text-xl shadow-sm ${connected ? 'bg-gradient-to-tr from-emerald-500 to-teal-400' : 'bg-slate-300 dark:bg-slate-700'}`}>
              🪷
            </div>
            <div className="min-w-0">
              <h1 className="text-[16px] font-semibold text-slate-900 dark:text-slate-100 truncate flex items-center gap-2">
                Live Ashram
              </h1>
              <p className="text-[12.5px] text-slate-500 dark:text-slate-400 truncate mt-0.5 max-w-[200px] sm:max-w-[400px]">
                {statusText}
              </p>
            </div>
          </div>
          <div>{statusBadge}</div>
        </div>

        {/* Messages Area */}
        <div 
          ref={scrollAreaRef}
          onScroll={onScroll}
          className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-0 relative z-10 custom-scrollbar"
        >
          {/* Load Older */}
          {hasMore && (
            <div className="flex justify-center pb-4 pt-2">
              <button 
                onClick={loadOlder}
                className="text-[11px] font-medium px-4 py-1.5 bg-slate-900/10 dark:bg-white/10 text-slate-700 dark:text-slate-300 backdrop-blur-md rounded-full hover:bg-slate-900/20 dark:hover:bg-white/20 transition-colors cursor-pointer shadow-sm"
              >
                ↑ Load older messages
              </button>
            </div>
          )}

          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm font-medium">
              Silence in the ashram…
            </div>
          )}
          
          {groupedMessages.map(({ msg, showName, showTail }, i) => {
            if (msg.type === 'system') {
              return (
                <div key={`sys-${i}`} className="flex justify-center chat-msg-enter my-3">
                  <span className="text-[11px] font-medium px-3 py-1 bg-[#d5e4d2]/80 dark:bg-[#182229]/80 text-[#54656f] dark:text-[#8696a0] rounded-lg shadow-sm backdrop-blur-sm">
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
                showName={showName}
                showTail={showTail}
                onDelete={deleteMessage}
              />
            );
          })}
          
          {/* Typing indicator */}
          {typists.size > 0 && (
            <div className="flex justify-start chat-msg-enter mt-3">
              <div className="bg-white dark:bg-[#1f2c34] rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm text-[13px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2 relative">
                <svg viewBox="0 0 8 13" width="8" height="13" className="absolute top-0 -left-[7px] text-white dark:text-[#1f2c34] fill-current">
                   <path d="M2.812 1H8v11.142c0 .873-1.056 1.31-1.673.693L2.812 9.32A2 2 0 0 1 2 7.906V2a1 1 0 0 1 1-1z" />
                </svg>
                {Array.from(typists).join(', ')} is typing...
              </div>
            </div>
          )}

          <div ref={bottomRef} className="h-4" />
        </div>

        {/* New messages pill */}
        {showNewPill && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30">
            <button
              onClick={jumpToBottom}
              className="w-10 h-10 flex items-center justify-center bg-white dark:bg-[#202c33] text-slate-800 dark:text-white rounded-full shadow-lg hover:scale-105 transition-transform cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
          </div>
        )}

        {/* Input Area */}
        <form 
          onSubmit={send} 
          className="flex-shrink-0 p-2 sm:p-3 bg-[#f0f2f5] dark:bg-[#202c33] z-20"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={handleInput}
              placeholder={connected 
                ? (canWrite ? 'Type a message' : 'Room full — observing only') 
                : 'Connecting…'}
              disabled={!connected || !canWrite}
              maxLength={500}
              className="flex-1 bg-white dark:bg-[#2a3942] rounded-full pl-5 pr-4 py-2.5 sm:py-3 outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all disabled:opacity-60 text-[15px] sm:text-[15px] text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-[#8696a0]"
            />
            <button
              type="submit"
              disabled={!input.trim() || !connected || !canWrite}
              className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 bg-[#00a884] hover:bg-[#008f6f] disabled:bg-slate-300 dark:disabled:bg-slate-700 flex flex-col items-center justify-center rounded-full transition-colors cursor-pointer disabled:cursor-not-allowed text-white shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
