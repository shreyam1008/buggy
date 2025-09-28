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
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  }

  function parseAdInput(input: string): DateObj | null {
    if (!input) return null;
    const s = input.trim().replace(/[\.\-\s]/g, "/");

    const ymd = s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
    if (ymd) {
      const [, y, m, d] = ymd.map(Number);
      return { year: y, month: m, day: d };
    }

    const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dmy) {
      let [_, a, b, y] = dmy;
      let A = Number(a),
        B = Number(b),
        Y = Number(y);
      if (A > 12) return { day: A, month: B, year: Y };
      if (B > 12) return { day: B, month: A, year: Y };
      return { day: A, month: B, year: Y };
    }

    return null;
  }

  function parseBsInput(input: string): DateObj | null {
    if (!input) return null;
    const s = input.trim().replace(/[\.\-\s]/g, "/");

    const ymd = s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
    if (ymd) {
      const [, y, m, d] = ymd.map(Number);
      return { year: y, month: m, day: d };
    }

    const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dmy) {
      const [, d, m, y] = dmy.map(Number);
      return { year: y, month: m, day: d };
    }

    return null;
  }

  function convertAdToBsObj({ year, month, day }: DateObj): DateObj {
    try {
      const jsDate = new Date(year, month - 1, day);
      const nd = new NepaliDate(jsDate);
      const bsObj = nd.getBS();
      return {
        year: bsObj.year,
        month: (bsObj.month ?? 0) + 1,
        day: bsObj.date,
      };
    } catch {
      throw new Error("Conversion failed — date may be out of supported range");
    }
  }

  function convertBsToAdObj({ year, month, day }: DateObj): DateObj {
    try {
      const nd = new NepaliDate(year, month - 1, day);
      const jsDate = nd.toJsDate();
      return {
        year: jsDate.getFullYear(),
        month: jsDate.getMonth() + 1,
        day: jsDate.getDate(),
      };
    } catch {
      throw new Error("Conversion failed — date may be out of supported range");
    }
  }

  function fmt(d: DateObj | null): string {
    if (!d) return "";
    return `${String(d.day).padStart(2, "0")}/${String(d.month).padStart(
      2,
      "0"
    )}/${d.year}`;
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
      setStatus({
        type: "error",
        text: "Invalid AD format — use DD/MM/YYYY or YYYY-MM-DD",
      });
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
      setStatus({
        type: "error",
        text: "Invalid BS format — use DD/MM/YYYY or YYYY-MM-DD",
      });
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
          🗓️ English ↔ Nepali
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Type a date and conversion happens instantly
        </p>
      </header>

      <label className="block text-sm font-semibold text-slate-700">
        📅 AD (English date)
      </label>
      <input
        ref={adRef}
        value={ad}
        onChange={handleAdChange}
        placeholder="14/04/1943 or 1943-04-14"
        aria-label="AD date input"
        className="w-full mt-2 p-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:shadow-md"
      />
      <p className="text-xs text-slate-400 italic mt-1">
        Supports DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
      </p>

      <label className="block text-sm font-semibold text-slate-700 mt-4">
        🏔️ BS (Nepali date)
      </label>
      <input
        ref={bsRef}
        value={bs}
        onChange={handleBsChange}
        placeholder="01/01/2058 or 2058-01-01"
        aria-label="BS date input"
        className="w-full mt-2 p-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:shadow-md"
      />
      <p className="text-xs text-slate-400 italic mt-1">
        Supports DD/MM/YYYY, YYYY-MM-DD
      </p>

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
        inputs • Make sure you installed{" "}
        <code className="text-xs">nepali-date-converter</code>
      </footer>
    </div>
  );
}
