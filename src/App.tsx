import React, { useEffect, useRef, useState } from "react";
import NepaliDate from "nepali-date-converter";

type DateObj = { year: number; month: number; day: number };
type Status = { type: "info" | "success" | "error"; text: string };

export default function NepaliDateConverter() {
  const [ad, setAd] = useState<string>("");
  const [bs, setBs] = useState<string>("");
  const [status, setStatus] = useState<Status>({ type: "info", text: "Ready" });
  const adRef = useRef<HTMLInputElement | null>(null);
  const bsRef = useRef<HTMLInputElement | null>(null);

  //add nepali in nepali also
  const nepaliMonths = [
    "Baishakh/बैशाख",
    "Jestha/जेठ",
    "Ashadh/आषाढ",
    "Shrawan/श्रावण",
    "Bhadra/भदौ",
    "Ashwin/आश्विन",
    "Kartik/कार्तिक",
    "Mangsir/मंसिर",
    "Poush/पुष",
    "Magh/माघ",
    "Falgun/फाल्गुन",
    "Chaitra/चैत्र",
  ];

  const englishMonths = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  function debounce<T extends (...args: any[]) => void>(fn: T, ms = 300) {
    let t: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

function autoFormat(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (!digits) return "";
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
    const s = input.trim().replace(/[\./\s]/g, "-");


    const ymd = s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
    if (ymd) {
      const [, y, m, d] = ymd.map(Number);
      const date = { year: y, month: m, day: d };
      return isValidAdDate(date) ? date : null;
    }

    const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dmy) {
      let [_, a, b, y] = dmy;
      let A = Number(a),
        B = Number(b),
        Y = Number(y);

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
    const s = input.trim().replace(/[\./\s]/g, "-");


    const ymd = s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
    if (ymd) {
      const [, y, m, d] = ymd.map(Number);
      try {
        new NepaliDate(y, m - 1, d);
        return { year: y, month: m, day: d };
      } catch {
        return null;
      }
    }

    const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dmy) {
      const [, d, m, y] = dmy.map(Number);
      try {
        new NepaliDate(y, m - 1, d);
        return { year: y, month: m, day: d };
      } catch {
        return null;
      }
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
  if (!d) return "";
  return `${String(d.day).padStart(2, "0")}-${String(d.month).padStart(
    2,
    "0"
  )}-${d.year}`;
}


  const onAdInput = debounce((val: string) => {
    setStatus({ type: "info", text: "Converting AD → BS…" });
    if (!val) {
      setBs("");
      setStatus({ type: "info", text: "Ready" });
      return;
    }
    const parsed = parseAdInput(val);
    if (!parsed) {
      setStatus({ type: "error", text: "Invalid AD format — use dd/mm/yyyy" });
      return;
    }
    try {
      const converted = convertAdToBsObj(parsed);
      setBs(fmt(converted));
      setStatus({
        type: "success",
        text: `${fmt(parsed)} AD → ${fmt(converted)} BS`,
      });
    } catch (e: any) {
      setStatus({ type: "error", text: e.message });
    }
  }, 300);

  const onBsInput = debounce((val: string) => {
    setStatus({ type: "info", text: "Converting BS → AD…" });
    if (!val) {
      setAd("");
      setStatus({ type: "info", text: "Ready" });
      return;
    }
    const parsed = parseBsInput(val);
    if (!parsed) {
      setStatus({ type: "error", text: "Invalid BS format — use dd/mm/yyyy" });
      return;
    }
    try {
      const converted = convertBsToAdObj(parsed);
      setAd(fmt(converted));
      setStatus({
        type: "success",
        text: `${fmt(parsed)} BS → ${fmt(converted)} AD`,
      });
    } catch (e: any) {
      setStatus({ type: "error", text: e.message });
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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAd("");
        setBs("");
        setStatus({ type: "info", text: "Cleared" });
        adRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="max-w-md mx-auto p-6 bg-white/90 rounded-2xl shadow-lg border border-white/20">
      <header className="text-center mb-4">
        <h2 className="text-2xl font-bold text-slate-800">
          English ↔ Nepali Date Converter
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Type a date and conversion happens instantly
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Supported ranges: AD ≈ 1943 onwards • BS ≈ 2000 onwards
        </p>
      </header>

    
      <label className="block text-sm font-semibold text-slate-700">
  AD (English date)
</label>
<div className="flex gap-2 mt-2">
  <input
    ref={adRef}
    value={ad}
    onChange={handleAdChange}
    placeholder="dd-mm-yyyy"
    aria-label="AD date input"
    className="flex-1 p-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:shadow-md"
  />
  <button
    onClick={() => {
      if (ad) {
        navigator.clipboard.writeText(ad);
        setStatus({ type: "success", text: "Copied AD date!" });
      }
    }}
    className="px-3 py-2 bg-slate-200 rounded-lg hover:bg-slate-300 text-sm"
  >
    📋
  </button>
</div>


    
      <label className="block text-sm font-semibold text-slate-700 mt-4">
  BS (Nepali date)
</label>
<div className="flex gap-2 mt-2">
  <input
    ref={bsRef}
    value={bs}
    onChange={handleBsChange}
    placeholder="dd-mm-yyyy"
    aria-label="BS date input"
    className="flex-1 p-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:shadow-md"
  />
  <button
    onClick={() => {
      if (bs) {
        navigator.clipboard.writeText(bs);
        setStatus({ type: "success", text: "Copied BS date!" });
      }
    }}
    className="px-3 py-2 bg-slate-200 rounded-lg hover:bg-slate-300 text-sm"
  >
    📋
  </button>
</div>


      <div className="mt-4 h-12 flex items-center">
        <div
          className={`w-full rounded-lg px-3 py-2 text-sm font-medium ${
            status.type === "error" ? "bg-red-500 text-white" : ""
          } ${status.type === "success" ? "bg-emerald-500 text-white" : ""} ${
            status.type === "info" ? "bg-sky-400 text-white" : ""
          }`}
        >
          {status.text}
        </div>
      </div>

      <footer className="mt-4 text-xs text-slate-500">
        Tip: Press <kbd className="bg-slate-100 px-2 rounded">Esc</kbd> to clear
        inputs
        <p className="text-xs text-slate-400 italic mt-1">
          Supported from ranges: AD ≈ 1943 onwards • BS ≈ 2000 onwards
        </p>
        <p className="text-xs text-slate-400 italic mt-1">
          Supported: dd/mm/yyyy, dd.mm.yyyy, dd-mm-yyyy, ddmmyyyy • Not
          supported: yyyymmdd
        </p>
      </footer>

      {/* Month Info Box */}
      <div className="mt-6 p-4 bg-slate-100 rounded-xl shadow-inner">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">
          Month Reference
        </h3>
        <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
          <div>
            <p className="font-semibold mb-1">Nepali (BS)</p>
            {nepaliMonths.map((m, i) => (
              <div key={i}>
                {String(i + 1).padStart(2, "0")} – {m}
              </div>
            ))}
          </div>
          <div>
            <p className="font-semibold mb-1">English (AD)</p>
            {englishMonths.map((m, i) => (
              <div key={i}>
                {String(i + 1).padStart(2, "0")} – {m}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
