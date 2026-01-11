import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Copy, Check, RefreshCw, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import bcrypt from 'bcryptjs';
import { Button } from '../components/shared/Button';

export default function BcryptGenerator() {
  const [inputText, setInputText] = useState('');
  const [rounds, setRounds] = useState(10);
  const [hash, setHash] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showInput, setShowInput] = useState(false);
  
  const [verifyText, setVerifyText] = useState('');
  const [verifyHashInput, setVerifyHashInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<'match' | 'no-match' | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const generateHash = async () => {
    if (!inputText) return;
    setIsGenerating(true);
    try {
      const salt = await bcrypt.genSalt(rounds);
      const hashed = await bcrypt.hash(inputText, salt);
      setHash(hashed);
    } finally {
      setIsGenerating(false);
    }
  };

  const verifyHashCheck = async () => {
    if (!verifyText || !verifyHashInput) return;
    setIsVerifying(true);
    try {
      const isMatch = await bcrypt.compare(verifyText, verifyHashInput);
      setVerifyResult(isMatch ? 'match' : 'no-match');
    } catch {
      setVerifyResult('no-match');
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = () => {
    if (hash) {
      navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <h1 className="page-title">Bcrypt Generator</h1>
        <p className="page-subtitle">Generate & verify secure password hashes</p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title"><Lock size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />Generate Hash</h3>
        </div>
        <div className="card-content">
          <div className="input-group">
            <label className="label">Text to Hash</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showInput ? 'text' : 'password'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text..."
                className="input"
              />
              <button
                onClick={() => setShowInput(!showInput)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
              >
                {showInput ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label className="label">Rounds: {rounds}</label>
            <input type="range" min="4" max="12" value={rounds} onChange={(e) => setRounds(Number(e.target.value))} style={{ width: '100%' }} />
            <p className="input-helper-text">Higher = more secure, slower. 10 recommended.</p>
          </div>

          <Button variant="primary" fullWidth onClick={generateHash} disabled={!inputText || isGenerating}>
            {isGenerating ? (
              <><RefreshCw size={18} className="icon-spin" /> Generating...</>
            ) : (
              <><Lock size={18} /> Generate Hash</>
            )}
          </Button>

          {hash && (
            <div style={{ marginTop: '1.5rem' }}>
              <label className="label">Generated Hash</label>
              <div className="hash-display">{hash}</div>
              <Button variant="ghost" size="sm" onClick={copyToClipboard} style={{ marginTop: '0.5rem' }}>
                {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy</>}
              </Button>
              <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                Rounds: {rounds} | Iterations: {Math.pow(2, rounds).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title"><ShieldCheck size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />Verify Hash</h3>
        </div>
        <div className="card-content">
          <div className="input-group">
            <label className="label">Plain Text</label>
            <input type="text" value={verifyText} onChange={(e) => { setVerifyText(e.target.value); setVerifyResult(null); }} placeholder="Enter text..." className="input" />
          </div>
          <div className="input-group">
            <label className="label">Hash</label>
            <input type="text" value={verifyHashInput} onChange={(e) => { setVerifyHashInput(e.target.value); setVerifyResult(null); }} placeholder="Enter bcrypt hash..." className="input" />
          </div>
          <Button variant="secondary" fullWidth onClick={verifyHashCheck} disabled={!verifyText || !verifyHashInput || isVerifying}>
            {isVerifying ? 'Verifying...' : 'Verify Hash'}
          </Button>
          {verifyResult && (
            <div className={`status-box ${verifyResult === 'match' ? 'status-success' : 'status-error'}`} style={{ marginTop: '1rem' }}>
              {verifyResult === 'match' ? '✓ Hash matches!' : '✗ Hash does not match'}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
