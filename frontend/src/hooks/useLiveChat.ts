import { useEffect, useState, useRef } from 'react';

const API_URL = (import.meta.env.VITE_API_URL as string)?.replace(/\/$/, '') || '';
const WS_URL = API_URL ? API_URL.replace(/^http/, 'ws') + '/api/chat' : '';

const STORAGE_KEY = 'buggy-chat-username';

export interface ChatMessage {
  type: 'chat' | 'system';
  id?: string;
  username?: string;
  message: string;
  createdAt?: number;
}

export function useLiveChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [myName, setMyName] = useState('');
  const [canWrite, setCanWrite] = useState(false);
  const [connected, setConnected] = useState(false);
  const [typists, setTypists] = useState<Set<string>>(new Set());
  const [hasMore, setHasMore] = useState(false);

  // Use refs to avoid stale closures in WebSocket callbacks
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempt = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isSubscribed = true;

    const connect = () => {
      if (!WS_URL) return;

      // Grab stored identity for persistence across refreshes
      const storedName = localStorage.getItem(STORAGE_KEY) || '';
      const wsUrl = storedName ? `${WS_URL}?name=${encodeURIComponent(storedName)}` : WS_URL;
      const ws = new WebSocket(wsUrl);

      // Mobile safety: if WS doesn't open in 10s, force-close and trigger reconnect
      const connectTimeout = setTimeout(() => {
        if (ws.readyState !== 1) ws.close();
      }, 10000);

      ws.onopen = () => {
        if (!isSubscribed) {
          ws.close();
          return;
        }
        clearTimeout(connectTimeout);
        setConnected(true);
        reconnectAttempt.current = 0; // Reset backoff on successful connect
      };
      
      ws.onmessage = (e) => {
        if (!isSubscribed) return;
        const data = JSON.parse(e.data);

        switch (data.type) {
          case 'welcome':
            setMyName(data.username);
            setCanWrite(data.canWrite);
            // *** Persist identity so refresh keeps the same name ***
            localStorage.setItem(STORAGE_KEY, data.username);
            break;

          case 'history': {
            const history: ChatMessage[] = data.messages.map((m: any) => ({ type: 'chat' as const, ...m }));
            setMessages(prev => [...history, ...prev]);
            setHasMore(!!data.hasMore);
            break;
          }

          case 'chat':
          case 'system':
            setMessages(prev => [...prev, data].slice(-200));
            if (data.type === 'chat' && data.username) {
              setTypists(prev => {
                if (!prev.has(data.username)) return prev; // no-op = no re-render
                const next = new Set(prev);
                next.delete(data.username);
                return next;
              });
            }
            break;

          case 'typing':
            setTypists(prev => {
              const has = prev.has(data.username);
              if (data.isTyping && has) return prev;
              if (!data.isTyping && !has) return prev;
              const next = new Set(prev);
              if (data.isTyping) next.add(data.username);
              else next.delete(data.username);
              return next;
            });
            break;

          case 'delete':
            setMessages(prev => prev.filter(m => m.id !== data.id));
            break;
        }
      };
      
      ws.onclose = () => {
        if (!isSubscribed) return;
        setConnected(false);
        setCanWrite(false);
        wsRef.current = null;

        // Exponential backoff: 1s, 2s, 4s, 8s ... max 30s + jitter
        const attempt = reconnectAttempt.current;
        const baseDelay = Math.min(1000 * Math.pow(2, attempt), 30000);
        const jitter = Math.random() * 1000;
        reconnectAttempt.current = attempt + 1;

        reconnectTimer.current = setTimeout(connect, baseDelay + jitter);
      };
      
      wsRef.current = ws;
    };

    connect();

    return () => {
      isSubscribed = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, []);

  // --- Actions (stable via refs, no stale closure) ---

  const sendMessage = (message: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== 1) return;
    ws.send(JSON.stringify({ type: 'chat', message }));
    ws.send(JSON.stringify({ type: 'typing', isTyping: false }));
  };

  const sendTyping = (isTyping: boolean) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== 1) return;
    ws.send(JSON.stringify({ type: 'typing', isTyping }));
  };

  const deleteMessage = (id: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== 1) return;
    ws.send(JSON.stringify({ type: 'delete', id }));
  };

  const loadOlder = () => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== 1) return;
    // Find earliest message timestamp in current list
    setMessages(prev => {
      let oldest = Infinity;
      for (const m of prev) {
        if (m.createdAt && m.createdAt < oldest) oldest = m.createdAt;
      }
      if (oldest === Infinity) return prev;
      ws.send(JSON.stringify({ type: 'loadMore', before: oldest }));
      return prev; // Don't mutate — server response will prepend
    });
  };

  return {
    socketExists: !!WS_URL,
    messages,
    myName,
    canWrite,
    connected,
    typists,
    hasMore,
    sendMessage,
    sendTyping,
    deleteMessage,
    loadOlder,
  };
}
