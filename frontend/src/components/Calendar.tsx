import { useState } from 'react';
import {
  bsMonthNames, bsMonthNamesEn, bsDayNames, dayNamesEn,
  toNepaliNumeral, BS_MIN_YEAR, BS_MAX_YEAR,
} from '../data/nepaliCalendar';
import {
  bsToAd, getTodayBs, getDaysInBsMonth, getStartDayOfWeek,
  getPrevMonth, getNextMonth,
} from '../utils/dateConverter';

export default function Calendar() {
  const today = getTodayBs();
  const [year, setYear] = useState(today.year);
  const [month, setMonth] = useState(today.month);
  const [selectedDay, setSelectedDay] = useState<number | null>(today.day);

  const daysInMonth = getDaysInBsMonth(year, month);
  const startDow = getStartDayOfWeek(year, month);

  const prev = () => {
    const p = getPrevMonth(year, month);
    setYear(p.year); setMonth(p.month); setSelectedDay(null);
  };
  const next = () => {
    const n = getNextMonth(year, month);
    setYear(n.year); setMonth(n.month); setSelectedDay(null);
  };
  const goToday = () => {
    setYear(today.year); setMonth(today.month); setSelectedDay(today.day);
  };

  const isToday = (d: number) => d === today.day && month === today.month && year === today.year;

  const getAdOverlay = (d: number) => {
    const ad = bsToAd(year, month, d);
    return `${ad.getDate()}`;
  };

  const selectedAd = selectedDay ? bsToAd(year, month, selectedDay) : null;

  return (
    <div className="max-w-md mx-auto pt-12 lg:pt-0">
      <h1 className="text-2xl font-bold mb-1 text-slate-900 dark:text-white transition-colors">🗓️ नेपाली पात्रो</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 transition-colors">Nepali Calendar · BS ↔ AD</p>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm transition-colors">
        <button onClick={prev} disabled={year <= BS_MIN_YEAR && month === 0}
          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-30 cursor-pointer text-slate-700 dark:text-slate-300">←</button>
        <div className="text-center">
          <div className="font-bold text-sm text-slate-900 dark:text-white">{bsMonthNames[month]} {toNepaliNumeral(year)}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">{bsMonthNamesEn[month]} {year} BS</div>
        </div>
        <button onClick={next} disabled={year >= BS_MAX_YEAR && month === 11}
          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-30 cursor-pointer text-slate-700 dark:text-slate-300">→</button>
      </div>

      <button onClick={goToday}
        className="w-full mb-3 py-1.5 bg-red-50 dark:bg-red-600/10 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-600/20 transition cursor-pointer">
        Today: {bsMonthNamesEn[today.month]} {today.day}, {today.year}
      </button>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-0.5">
        {dayNamesEn.map((d, i) => (
          <div key={d} className={`text-center text-[10px] font-semibold py-1 ${i === 6 ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {bsDayNames[i]}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {/* Empty cells */}
        {Array.from({ length: startDow }, (_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {/* Day cells */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = i + 1;
          const dow = (startDow + i) % 7;
          const isSat = dow === 6;
          const sel = d === selectedDay;
          return (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`aspect-square rounded-lg text-center relative flex flex-col items-center justify-center transition cursor-pointer
                ${isToday(d) ? 'ring-2 ring-red-600 bg-red-50 dark:bg-red-600/10' : ''}
                ${sel && !isToday(d) ? 'bg-slate-200 dark:bg-slate-700' : ''}
                ${!sel && !isToday(d) ? 'hover:bg-slate-100 dark:hover:bg-slate-800' : ''}
                ${isSat ? 'text-red-500 dark:text-red-400' : 'text-slate-900 dark:text-slate-200'}`}
            >
              <span className="text-sm font-semibold leading-none">{toNepaliNumeral(d)}</span>
              <span className="text-[8px] text-slate-400 dark:text-slate-500 leading-none mt-0.5">{getAdOverlay(d)}</span>
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      {selectedDay && selectedAd && (
        <div className="mt-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center shadow-sm transition-colors">
          <p className="font-bold text-lg text-slate-900 dark:text-white">
            {bsMonthNames[month]} {toNepaliNumeral(selectedDay)}, {toNepaliNumeral(year)}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {bsMonthNamesEn[month]} {selectedDay}, {year} BS
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {selectedAd.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      )}
    </div>
  );
}
