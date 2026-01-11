import React, { useRef, useState } from 'react';
import NepaliDate from 'nepali-date-converter';
import { Copy, Calendar, Globe, ShieldCheck, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { RadhaKrishnaIcon } from '../components/Icons';

type DateObj = { year: number; month: number; day: number };
type Status = { type: 'info' | 'success' | 'error'; text: string };

export default function Home() {
  const [ad, setAd] = useState<string>('');
  const [bs, setBs] = useState<string>('');
  const [status, setStatus] = useState<Status>({ type: 'info', text: 'Ready' });
  const [copiedAd, setCopiedAd] = useState(false);
  const [copiedBs, setCopiedBs] = useState(false);
  const adRef = useRef<HTMLInputElement | null>(null);
  const bsRef = useRef<HTMLInputElement | null>(null);

  const nepaliMonths = [
    'Baishakh/बैशाख', 'Jestha/जेठ', 'Ashadh/आषाढ', 'Shrawan/श्रावण',
    'Bhadra/भदौ', 'Ashwin/आश्विन', 'Kartik/कार्तिक', 'Mangsir/मंसिर',
    'Poush/पुष', 'Magh/माघ', 'Falgun/फाल्गुन', 'Chaitra/चैत्र',
  ];

  const englishMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  function debounce<T extends (...args: any[]) => void>(fn: T, ms = 300) {
    let t: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

  function autoFormat(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (!digits) return '';
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
  }

  function isValidAdDate({ year, month, day }: DateObj): boolean {
    if (month < 1 || month > 12) return false;
    const daysInMonth = new Date(year, month, 0).getDate();
    return day >= 1 && day <= daysInMonth;
  }

  function parseAdInput(input: string): DateObj | null {
    if (!input) return null;
    const s = input.trim().replace(/[\.\/\s]/g, '-');

    const ymd = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (ymd) {
      const [, y, m, d] = ymd.map(Number);
      const date = { year: y, month: m, day: d };
      return isValidAdDate(date) ? date : null;
    }

    const dmy = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (dmy) {
      let [_, a, b, y] = dmy;
      let A = Number(a), B = Number(b), Y = Number(y);
      let d1 = { day: A, month: B, year: Y };
      if (isValidAdDate(d1)) return d1;
      let d2 = { day: B, month: A, year: Y };
      if (isValidAdDate(d2)) return d2;
      return null;
    }
    return null;
  }

  function parseBsInput(input: string): DateObj | null {
    if (!input) return null;
    const s = input.trim().replace(/[\.\/\s]/g, '-');

    const ymd = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (ymd) {
      const [, y, m, d] = ymd.map(Number);
      try {
        new NepaliDate(y, m - 1, d);
        return { year: y, month: m, day: d };
      } catch { return null; }
    }

    const dmy = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (dmy) {
      const [, d, m, y] = dmy.map(Number);
      try {
        new NepaliDate(y, m - 1, d);
        return { year: y, month: m, day: d };
      } catch { return null; }
    }
    return null;
  }

  function convertAdToBsObj({ year, month, day }: DateObj): DateObj {
    const jsDate = new Date(year, month - 1, day);
    const nd = new NepaliDate(jsDate);
    const bsObj = nd.getBS();
    return { year: bsObj.year, month: (bsObj.month ?? 0) + 1, day: bsObj.date };
  }

  function convertBsToAdObj({ year, month, day }: DateObj): DateObj {
    const nd = new NepaliDate(year, month - 1, day);
    const jsDate = nd.toJsDate();
    return {
      year: jsDate.getFullYear(),
      month: jsDate.getMonth() + 1,
      day: jsDate.getDate(),
    };
  }

  function fmt(d: DateObj | null): string {
    if (!d) return '';
    return `${String(d.day).padStart(2, '0')}-${String(d.month).padStart(2, '0')}-${d.year}`;
  }

  const onAdInput = debounce((val: string) => {
    setStatus({ type: 'info', text: 'Converting AD → BS…' });
    if (!val) {
      setBs('');
      setStatus({ type: 'info', text: 'Ready' });
      return;
    }
    const parsed = parseAdInput(val);
    if (!parsed) {
      setStatus({ type: 'error', text: 'Invalid AD format — use dd/mm/yyyy' });
      return;
    }
    try {
      const converted = convertAdToBsObj(parsed);
      setBs(fmt(converted));
      setStatus({ type: 'success', text: `${fmt(parsed)} AD → ${fmt(converted)} BS` });
    } catch (e: any) {
      setStatus({ type: 'error', text: e.message });
    }
  }, 300);

  const onBsInput = debounce((val: string) => {
    setStatus({ type: 'info', text: 'Converting BS → AD…' });
    if (!val) {
      setAd('');
      setStatus({ type: 'info', text: 'Ready' });
      return;
    }
    const parsed = parseBsInput(val);
    if (!parsed) {
      setStatus({ type: 'error', text: 'Invalid BS format — use dd/mm/yyyy' });
      return;
    }
    try {
      const converted = convertBsToAdObj(parsed);
      setAd(fmt(converted));
      setStatus({ type: 'success', text: `${fmt(parsed)} BS → ${fmt(converted)} AD` });
    } catch (e: any) {
      setStatus({ type: 'error', text: e.message });
    }
  }, 300);

  function handleAdChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = autoFormat(e.target.value);
    setAd(v);
    onAdInput(v);
  }

  function handleBsChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = autoFormat(e.target.value);
    setBs(v);
    onBsInput(v);
  }

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.article 
      className="page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      role="main"
      aria-label="Nepali Date Converter Tool"
    >
      <div className="glass-card" style={{ maxWidth: '100%' }}>
        <header style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="icon-spin" style={{ marginBottom: '1rem', filter: 'drop-shadow(0 0 10px var(--primary-color))' }} aria-hidden="true">
            <RadhaKrishnaIcon size={48} color="var(--primary-color)" />
          </div>
          <h1 className="title" style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Nepali Date Converter</h1>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
            English (AD) ↔ Nepali (BS) • Miti Pariwartan | मिति परिवर्तन
          </p>
        </header>

        <div className="input-group">
          <label className="label">AD (English Date)</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              ref={adRef}
              value={ad}
              onChange={handleAdChange}
              placeholder="dd-mm-yyyy"
              className="date-input"
            />
            <button
              onClick={() => copyToClipboard(ad, setCopiedAd)}
              className="btn-icon"
              title="Copy AD Date"
            >
              {copiedAd ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
        </div>

        <div className="input-group">
          <label className="label">BS (Nepali Date)</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              ref={bsRef}
              value={bs}
              onChange={handleBsChange}
              placeholder="dd-mm-yyyy"
              className="date-input"
            />
            <button
              onClick={() => copyToClipboard(bs, setCopiedBs)}
              className="btn-icon"
              title="Copy BS Date"
            >
              {copiedBs ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
        </div>

        <div className={`status-box ${
          status.type === 'error' ? 'status-error' : 
          status.type === 'success' ? 'status-success' : 'status-info'
        }`}>
          {status.text}
        </div>

        <section className="month-reference-container" style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }} aria-label="Month Reference Guide">
          <h2 className="month-reference-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--accent-color)' }}>
            <Calendar size={16} aria-hidden="true" /> Nepali and English Months Reference
          </h2>
          <div className="month-reference-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
            <div>
              <h3 style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>Nepali Months (BS)</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {nepaliMonths.map((m, i) => (
                  <li key={i} style={{ marginBottom: '2px' }}>{String(i + 1).padStart(2, '0')} – {m}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>English Months (AD)</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {englishMonths.map((m, i) => (
                  <li key={i} style={{ marginBottom: '2px' }}>{String(i + 1).padStart(2, '0')} – {m}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <div className="footer-seo" style={{ marginTop: '2rem' }}>
          <div className="footer-icons" style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Globe size={16} color="#6366f1" /> Universal</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldCheck size={16} color="#ec4899" /> Private</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={16} color="#8b5cf6" /> Accurate</div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
