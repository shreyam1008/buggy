import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const API_URL = (import.meta.env.VITE_API_URL as string)?.replace(/\/$/, '') || '';
const WS_URL = API_URL ? API_URL.replace(/^http/, 'ws') + '/api/chat' : '';

export interface ChatMessage {
  type: 'chat' | 'system';
  id?: string;
  username?: string;
  message: string;
  createdAt?: number;
  count?: number;
  writers?: number;
}

export function useLiveChat() {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [myName, setMyName] = useState('');
  const [canWrite, setCanWrite] = useState(false);
  const [connected, setConnected] = useState(false);
  const [typists, setTypists] = useState<Set<string>>(new Set());

  // Use a query to cleanly expose connection health if needed elsewhere globally
  queryClient.setQueryData(['chatConnection'], { connected, canWrite, myName });

  const connect = useCallback(() => {
    if (!WS_URL) return;
    const ws = new WebSocket(WS_URL);
    
    ws.onopen = () => setConnected(true);
    
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'welcome') {
        setMyName(data.username);
        setCanWrite(data.canWrite);
      } else if (data.type === 'history') {
        const history = data.messages.map((m: any) => ({ type: 'chat', ...m }));
        setMessages((prev) => [...history, ...prev].slice(-150));
      } else if (data.type === 'chat' || data.type === 'system') {
        setMessages((prev) => [...prev, data].slice(-150));
        if (data.type === 'chat') {
          setTypists(prev => {
            const next = new Set(prev);
            next.delete(data.username);
            return next;
          });
        }
      } else if (data.type === 'typing') {
        setTypists(prev => {
          const next = new Set(prev);
          if (data.isTyping) next.add(data.username);
          else next.delete(data.username);
          return next;
        });
      } else if (data.type === 'delete') {
        setMessages((prev) => prev.filter(m => m.id !== data.id));
      }
    };
    
    ws.onclose = () => {
      setConnected(false);
      setCanWrite(false);
      setTimeout(connect, 3000); // Reconnect loop
    };
    
    setSocket(ws);
    return ws;
  }, []);

  useEffect(() => {
    const ws = connect();
    return () => ws?.close();
  }, [connect]);

  const sendMessage = useCallback((message: string) => {
    if (!socket || !canWrite) return;
    socket.send(JSON.stringify({ type: 'chat', message }));
    socket.send(JSON.stringify({ type: 'typing', isTyping: false }));
  }, [socket, canWrite]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (!socket || !canWrite) return;
    socket.send(JSON.stringify({ type: 'typing', isTyping }));
  }, [socket, canWrite]);

  const deleteMessage = useCallback((id: string) => {
    if (!socket || !canWrite) return;
    socket.send(JSON.stringify({ type: 'delete', id }));
  }, [socket, canWrite]);

  return {
    socketExists: !!WS_URL,
    messages,
    myName,
    canWrite,
    connected,
    typists,
    sendMessage,
    sendTyping,
    deleteMessage
  };
}
