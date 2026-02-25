import { useState } from 'react';
import bcrypt from 'bcryptjs';

export default function BcryptGenerator() {
  const [input, setInput] = useState('');
  const [rounds, setRounds] = useState(10);
  const [hash, setHash] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const [verifyText, setVerifyText] = useState('');
  const [verifyHash, setVerifyHash] = useState('');
  const [verifyResult, setVerifyResult] = useState<'match' | 'no-match' | null>(null);
  const [verifying, setVerifying] = useState(false);

  const generate = async () => {
    if (!input) return;
    setGenerating(true);
    try {
      const salt = await bcrypt.genSalt(rounds);
      setHash(await bcrypt.hash(input, salt));
    } finally { setGenerating(false); }
  };

  const verify = async () => {
    if (!verifyText || !verifyHash) return;
    setVerifying(true);
    try {
      setVerifyResult((await bcrypt.compare(verifyText, verifyHash)) ? 'match' : 'no-match');
    } catch { setVerifyResult('no-match'); }
    finally { setVerifying(false); }
  };

  const copyHash = async () => {
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const inputClass = "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-red-600 transition";

  return (
    <div className="max-w-3xl mx-auto pt-12 lg:pt-0">
      <h1 className="text-2xl font-bold mb-1">Bcrypt Generator</h1>
      <p className="text-sm text-slate-400 mb-6">Generate and verify bcrypt password hashes</p>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Generate */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="font-semibold">🔒 Generate Hash</h3>
          <div className="flex gap-2">
            <input type={showInput ? 'text' : 'password'} value={input}
              onChange={(e) => setInput(e.target.value)} placeholder="Text to hash…"
              className={`${inputClass} flex-1`} />
            <button onClick={() => setShowInput(!showInput)}
              className="px-3 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700 transition cursor-pointer">
              {showInput ? '🙈' : '👁️'}
            </button>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Rounds: <strong className="text-white">{rounds}</strong></label>
            <input type="range" min={4} max={16} value={rounds}
              onChange={(e) => setRounds(+e.target.value)} className="w-full accent-red-600" />
          </div>
          <button onClick={generate} disabled={!input || generating}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition cursor-pointer">
            {generating ? '⏳ Generating…' : '⚡ Generate'}
          </button>
          {hash && (
            <div className="flex items-start gap-2 bg-slate-800/50 rounded-lg p-3">
              <code className="text-xs text-emerald-400 break-all flex-1">{hash}</code>
              <button onClick={copyHash}
                className="text-slate-400 hover:text-white text-sm shrink-0 cursor-pointer">
                {copied ? '✓' : '📋'}
              </button>
            </div>
          )}
        </div>

        {/* Verify */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="font-semibold">✅ Verify Hash</h3>
          <input type="text" value={verifyText}
            onChange={(e) => { setVerifyText(e.target.value); setVerifyResult(null); }}
            placeholder="Plain text…" className={inputClass} />
          <input type="text" value={verifyHash}
            onChange={(e) => { setVerifyHash(e.target.value); setVerifyResult(null); }}
            placeholder="Bcrypt hash ($2a$…)" className={inputClass} />
          <button onClick={verify} disabled={!verifyText || !verifyHash || verifying}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition cursor-pointer">
            {verifying ? '⏳ Verifying…' : '🔍 Verify'}
          </button>
          {verifyResult && (
            <div className={`text-center py-2 rounded-lg font-semibold text-sm ${
              verifyResult === 'match' ? 'bg-emerald-950/30 text-emerald-400' : 'bg-red-950/30 text-red-400'
            }`}>
              {verifyResult === 'match' ? '✅ Match!' : '❌ No match'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
