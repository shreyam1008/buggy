import { useState, useRef, useEffect } from 'react';

// Read Cloudflare Worker API URL from environment
const API_URL = (import.meta.env.VITE_API_URL as string)?.replace(/\/$/, '') || '';

const CHAT_MODELS = [
  { id: 'meta/llama3-70b-instruct', name: 'Llama 3 70B' },
  { id: 'meta/llama3-8b-instruct', name: 'Llama 3 8B' },
  { id: 'mistralai/mixtral-8x22b-instruct-v0.1', name: 'Mixtral 8x22B' },
  { id: 'google/gemma-7b-it', name: 'Gemma 7B' },
  { id: 'snowflake/arctic', name: 'Snowflake Arctic' },
];

const IMG_MODELS = [
  { id: 'stabilityai/stable-diffusion-xl', name: 'Stable Diffusion XL' },
  { id: 'stabilityai/sdxl-turbo', name: 'SDXL Turbo' },
];

type Message = { role: 'user' | 'assistant'; content: string };

export default function AI() {
  const [activeTab, setActiveTab] = useState<'chat' | 'image'>('chat');
  
  // Chat state
  const [chatModel, setChatModel] = useState(CHAT_MODELS[0].id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Image state
  const [imgModel, setImgModel] = useState(IMG_MODELS[0].id);
  const [prompt, setPrompt] = useState('');
  const [imgResult, setImgResult] = useState('');
  const [imgLoading, setImgLoading] = useState(false);
  const [imgError, setImgError] = useState('');

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (!API_URL) {
      alert("VITE_API_URL is missing. Please check your .env file or Cloudflare Pages environment variables.");
      return;
    }
    
    const userMsg: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setChatLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: chatModel,
          messages: newMessages,
          stream: true,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      if (!res.body) throw new Error('ReadableStream not supported by browser');

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      // Add empty assistant payload to mutate
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // keep the incomplete line in buffer

        for (const line of lines) {
          if (line.trim().startsWith('data: ')) {
            const dataStr = line.trim().slice(6);
            if (dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              const token = parsed.choices?.[0]?.delta?.content;
              if (token) {
                setMessages((prev) => {
                  const copy = [...prev];
                  copy[copy.length - 1].content += token;
                  return copy;
                });
              }
            } catch (err) {
              // Ignore malformed JSON chunks during streaming
            }
          }
        }
      }
    } catch (err: any) {
      alert(`Chat Error: ${err.message}`);
    } finally {
      setChatLoading(false);
    }
  };

  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    if (!API_URL) {
      alert("VITE_API_URL is missing.");
      return;
    }

    setImgLoading(true);
    setImgError('');
    setImgResult('');

    try {
      const res = await fetch(`${API_URL}/api/ai/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: imgModel, prompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate image');

      if (data.data && data.data[0]?.b64_json) {
        setImgResult(`data:image/png;base64,${data.data[0].b64_json}`);
      } else {
        throw new Error('Invalid response from NVIDIA API');
      }
    } catch (err: any) {
      setImgError(err.message);
    } finally {
      setImgLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-2rem)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            AI Studio
          </h1>
          <p className="text-slate-400 text-sm mt-1">Accelerated by NVIDIA NIM API</p>
        </div>
        
        <div className="flex bg-slate-800 p-1 rounded-lg shadow-inner">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'chat' ? 'bg-slate-700 text-emerald-400 shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            💬 Chat
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'image' ? 'bg-slate-700 text-emerald-400 shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            🎨 Image
          </button>
        </div>
      </div>

      {activeTab === 'chat' && (
        <div className="flex flex-col flex-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-800/30">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-2">Language Model</span>
            <select
              value={chatModel}
              onChange={(e) => setChatModel(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-emerald-500 transition-colors shadow-sm cursor-pointer"
            >
              {CHAT_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3">
                <span className="text-4xl opacity-50">🤖</span>
                <p>Start a conversation with an LLM</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-md ${
                  msg.role === 'user' 
                    ? 'bg-emerald-600/90 text-white rounded-br-sm' 
                    : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700/50'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                </div>
              </div>
            ))}
            {chatLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex justify-start">
                <div className="bg-slate-800 rounded-2xl rounded-bl-sm px-5 py-4 border border-slate-700/50 shadow-md">
                  <div className="flex items-center justify-center space-x-1.5">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-.2s]"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-.4s]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleChatSubmit} className="p-4 bg-slate-800/40 border-t border-slate-800">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask the AI anything..."
                disabled={chatLoading}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-14 py-3.5 outline-none focus:border-emerald-500 transition-all disabled:opacity-50 shadow-inner"
              />
              <button
                type="submit"
                disabled={chatLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed shadow"
              >
                🚀
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'image' && (
        <div className="flex flex-col flex-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6">
          <form onSubmit={handleImageSubmit} className="space-y-5 mb-8">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Diffusion Model</label>
              <select
                value={imgModel}
                onChange={(e) => setImgModel(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-emerald-500 transition-colors cursor-pointer"
              >
                {IMG_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            
            <div className="flex gap-3">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A futuristic cyber-yeti drinking neon tea..."
                disabled={imgLoading}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 outline-none focus:border-emerald-500 transition-all text-sm shadow-inner"
              />
              <button
                type="submit"
                disabled={imgLoading || !prompt.trim()}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap shadow-md text-sm"
              >
                {imgLoading ? '⏳ Rendering...' : '✨ Generate'}
              </button>
            </div>
            {imgError && <p className="text-red-400 text-sm bg-red-950/30 p-3 rounded-lg border border-red-900/50">{imgError}</p>}
          </form>

          <div className="flex-1 border-2 border-dashed border-slate-800 hover:border-slate-700 transition-colors rounded-2xl flex items-center justify-center bg-slate-950/40 relative overflow-hidden group shadow-inner">
            {!imgResult && !imgLoading && (
              <div className="text-slate-500 flex flex-col items-center space-y-4">
                <span className="text-5xl opacity-40 group-hover:scale-110 transition-transform duration-500">🌌</span>
                <p className="text-sm tracking-wide">Enter a prompt to synthesize an image</p>
              </div>
            )}
            
            {imgLoading && (
              <div className="flex flex-col items-center justify-center absolute inset-0 bg-slate-900/80 z-10 backdrop-blur-md">
                <div className="w-12 h-12 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                <p className="text-emerald-400 animate-pulse font-medium tracking-wider text-sm shadow-emerald-500">Synthesizing Pixels...</p>
              </div>
            )}

            {imgResult && (
              <>
                <img src={imgResult} alt="Generated UI" className="w-full h-full object-contain" />
                <a
                  href={imgResult}
                  download={`buggy-gen-${Date.now()}.png`}
                  className="absolute bottom-5 right-5 bg-slate-900/90 backdrop-blur-md px-5 py-2.5 rounded-xl border border-slate-700/50 hover:bg-emerald-600 hover:border-emerald-500 transition-all text-sm flex items-center gap-2 opacity-0 group-hover:opacity-100 shadow-xl cursor-pointer"
                >
                  📥 Save Image
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
