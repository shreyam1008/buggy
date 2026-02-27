import { useState, useRef } from 'react';
import {
  bsMonthNamesEn, bsMonthNames, adMonthNames,
} from '../data/nepaliCalendar';
import { bsToAd, adToBs, getDaysInBsMonth, type BsDate } from '../utils/dateConverter';

export default function DateConverter() {
  const [bsInput, setBsInput] = useState('');
  const [adResult, setAdResult] = useState<[string, string] | null>(null);
  const [adInput, setAdInput] = useState('');
  const [bsResult, setBsResult] = useState<[string, string] | null>(null);
  const [status, setStatus] = useState<{ type: 'info' | 'success' | 'error'; text: string }>({ type: 'info', text: 'Ready' });
  const [copiedField, setCopiedField] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function getOrdinal(n: number) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  function autoFormat(val: string): string {
    const d = val.replace(/\D/g, '').slice(0, 8);
    if (!d) return '';
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0, 2)}-${d.slice(2)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 4)}-${d.slice(4)}`;
  }

  function parse(s: string): { day: number; month: number; year: number } | null {
    const parts = s.replace(/\D/g, '');
    if (parts.length < 8) return null;
    const day = parseInt(parts.slice(0, 2));
    const month = parseInt(parts.slice(2, 4));
    const year = parseInt(parts.slice(4, 8));
    if (!day || !month || !year) return null;
    return { day, month, year };
  }

  const debouncedConvert = (fn: () => void) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fn, 200);
  };

  function handleBsChange(raw: string) {
    const val = autoFormat(raw);
    setBsInput(val);
    setAdResult(null);
    debouncedConvert(() => {
      const p = parse(val);
      if (!p) { setStatus({ type: 'info', text: 'Ready' }); return; }
      if (p.month < 1 || p.month > 12) { setStatus({ type: 'error', text: 'Invalid BS month' }); return; }
      const max = getDaysInBsMonth(p.year, p.month - 1);
      if (p.day < 1 || p.day > max) { setStatus({ type: 'error', text: `${bsMonthNamesEn[p.month - 1]} ${p.year} has ${max} days` }); return; }
      const ad = bsToAd(p.year, p.month - 1, p.day);
      const weekday = ad.toLocaleDateString('en-US', { weekday: 'long' });
      
      const adDay = ad.getDate();
      const adMonth = ad.getMonth();
      const adYear = ad.getFullYear();
      
      const primary = `${String(adDay).padStart(2, '0')}/${String(adMonth + 1).padStart(2, '0')}/${adYear} AD`;
      const secondary = `${getOrdinal(adDay)} ${adMonthNames[adMonth]}, ${adYear} AD (${weekday})`;
      
      setAdResult([primary, secondary]);
      setStatus({ type: 'success', text: `${val} BS → AD` });
    });
  }

  function handleAdChange(raw: string) {
    const val = autoFormat(raw);
    setAdInput(val);
    setBsResult(null);
    debouncedConvert(() => {
      const p = parse(val);
      if (!p) { setStatus({ type: 'info', text: 'Ready' }); return; }
      if (p.month < 1 || p.month > 12) { setStatus({ type: 'error', text: 'Invalid AD month' }); return; }
      const max = new Date(p.year, p.month, 0).getDate();
      if (p.day < 1 || p.day > max) { setStatus({ type: 'error', text: `Invalid day for ${adMonthNames[p.month - 1]}` }); return; }
      const bs: BsDate = adToBs(new Date(p.year, p.month - 1, p.day));
      
      const primary = `${String(bs.day).padStart(2, '0')}/${String(bs.month + 1).padStart(2, '0')}/${bs.year} BS`;
      const secondary = `${getOrdinal(bs.day)} ${bsMonthNamesEn[bs.month]}, ${bs.year} BS`;
      
      setBsResult([primary, secondary]);
      setStatus({ type: 'success', text: `${val} AD → BS` });
    });
  }

  async function copy(text: string, field: string) {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 1500);
  }

  return (
    <div className="max-w-3xl mx-auto pt-12 lg:pt-0">
      <h1 className="text-2xl font-bold mb-1 text-slate-900 dark:text-white transition-colors duration-300">Date Converter</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 transition-colors duration-300">Convert between Nepali (BS) and English (AD) dates · मिति परिवर्तन</p>

      <div className="grid md:grid-cols-2 gap-4">
        {/* BS → AD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300">
          <h3 className="font-semibold mb-1 text-slate-900 dark:text-white">🇳🇵 BS → AD</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Nepali date (DD-MM-YYYY)</p>
          <input
            type="text"
            value={bsInput}
            onChange={(e) => handleBsChange(e.target.value)}
            placeholder="DD-MM-YYYY"
            maxLength={10}
            inputMode="numeric"
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-red-600 transition-colors duration-200"
          />
          {adResult && (
            <div className="mt-3 flex items-center justify-between gap-2 bg-slate-100 dark:bg-slate-800/50 rounded-lg px-4 py-3 transition-colors duration-300 animate-in fade-in slide-in-from-top-2">
              <div className="flex flex-col">
                <strong className="text-base text-emerald-600 dark:text-emerald-400 leading-tight">{adResult[0]}</strong>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{adResult[1]}</span>
              </div>
              <button
                onClick={() => copy(`${adResult[0]} \n${adResult[1]}`, 'ad')}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm cursor-pointer p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                title="Copy date"
              >
                {copiedField === 'ad' ? '✓' : '📋'}
              </button>
            </div>
          )}
        </div>

        {/* AD → BS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300">
          <h3 className="font-semibold mb-1 text-slate-900 dark:text-white">🌍 AD → BS</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">English date (DD-MM-YYYY)</p>
          <input
            type="text"
            value={adInput}
            onChange={(e) => handleAdChange(e.target.value)}
            placeholder="DD-MM-YYYY"
            maxLength={10}
            inputMode="numeric"
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-red-600 transition-colors duration-200"
          />
          {bsResult && (
            <div className="mt-3 flex items-center justify-between gap-2 bg-slate-100 dark:bg-slate-800/50 rounded-lg px-4 py-3 transition-colors duration-300 animate-in fade-in slide-in-from-top-2">
              <div className="flex flex-col">
                <strong className="text-base text-emerald-600 dark:text-emerald-400 leading-tight">{bsResult[0]}</strong>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{bsResult[1]}</span>
              </div>
              <button
                onClick={() => copy(`${bsResult[0]} \n${bsResult[1]}`, 'bs')}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm cursor-pointer p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                title="Copy date"
              >
                {copiedField === 'bs' ? '✓' : '📋'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <div className={`mt-4 text-center text-sm py-2 rounded-lg transition-colors duration-300 ${
        status.type === 'success' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' :
        status.type === 'error' ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30' :
        'text-slate-500 dark:text-slate-500'
      }`}>
        {status.text}
      </div>

      {/* Month Reference */}
      <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors duration-300">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-300 mb-4 transition-colors">📅 Month Reference</h2>
        <div className="grid grid-cols-2 gap-6 text-xs text-slate-600 dark:text-slate-400">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 transition-colors">Nepali Months (BS)</h3>
            <ul className="space-y-0.5">
              {bsMonthNamesEn.map((en, i) => (
                <li key={en}><span className="text-slate-400 dark:text-slate-500">{String(i + 1).padStart(2, '0')}</span> – {en} / {bsMonthNames[i]}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 transition-colors">English Months (AD)</h3>
            <ul className="space-y-0.5">
              {adMonthNames.map((m, i) => (
                <li key={m}><span className="text-slate-400 dark:text-slate-500">{String(i + 1).padStart(2, '0')}</span> – {m}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
