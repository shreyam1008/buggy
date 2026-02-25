import { useState } from 'react';
import { Link, useLocation } from 'wouter';

const navItems = [
  { path: '/', label: 'Date Converter', icon: '📅' },
  { path: '/calendar', label: 'Calendar', icon: '🗓️' },
  { path: '/image', label: 'Image Tools', icon: '🖼️' },
  { path: '/pdf', label: 'PDF Merger', icon: '📄' },
  { path: '/notes', label: 'Notes', icon: '📝' },
  { path: '/bcrypt', label: 'Bcrypt', icon: '🔒' },
  { path: '/ai', label: 'AI Studio', icon: '✨' },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  const [clicks, setClicks] = useState(0);
  const [secretUnlocked, setSecretUnlocked] = useState(false);

  const handleSecretClick = () => {
    if (secretUnlocked) return;
    const newClicks = clicks + 1;
    setClicks(newClicks);
    if (newClicks >= 5) {
      setSecretUnlocked(true);
    }
    // reset after 2 seconds
    setTimeout(() => {
      setClicks(0);
    }, 2000);
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-3 left-3 z-50 w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 transition-all duration-300 shadow-sm"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <span className={`transform transition-transform duration-300 ${open ? 'rotate-90' : 'rotate-0'}`}>
          {open ? '✕' : '☰'}
        </span>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-60 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-40 transition-all duration-300 ease-in-out lg:translate-x-0 ${
          open ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div 
          className="p-4 border-b border-slate-200 dark:border-slate-800 select-none cursor-default transition-colors duration-300"
          onClick={handleSecretClick}
        >
          <h2 className="text-base font-bold text-slate-900 dark:text-white">⚡ Utilities</h2>
          <p className="text-xs text-slate-500 mt-0.5">Offline PWA</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setOpen(false)}
            >
              <div
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-all duration-200 ${
                  location === item.path
                    ? 'bg-red-600 text-white font-semibold shadow-md scale-[1.02] transform'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-[1.01] transform'
                }`}
              >
                <span className="text-base w-6 text-center">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </Link>
          ))}

          <div className="pt-6 pb-2 px-3">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 transition-colors duration-300">My Apps</h3>
            <div className="space-y-0.5">
              <a href="https://shreyam1008.github.io/dbterm/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer hover:scale-[1.01] transform">
                <span className="text-base w-6 text-center opacity-70">🖥️</span>
                <span>dbterm</span>
              </a>
              <a href="https://radhey.web.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer hover:scale-[1.01] transform">
                <span className="text-base w-6 text-center opacity-70">⚛️</span>
                <span>Radhey</span>
              </a>
              <a href="https://nepallegalfirm.com.np/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer hover:scale-[1.01] transform">
                <span className="text-base w-6 text-center opacity-70">⚖️</span>
                <span>Legal Firm</span>
              </a>
              
              {/* Secret Link */}
              {secretUnlocked && (
                <a href="https://loveyoubuddy.web.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-3 py-2 mt-4 rounded-lg text-sm text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-500/10 border border-pink-200 dark:border-pink-500/20 hover:bg-pink-200 dark:hover:bg-pink-500/20 transition-all duration-300 cursor-pointer animate-pulse transform scale-105">
                  <span className="text-base w-6 text-center">💖</span>
                  <span className="font-medium">Secret App</span>
                </a>
              )}
            </div>
          </div>
        </nav>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-600 transition-colors duration-300">
          Works offline · PWA
        </div>
      </aside>
    </>
  );
}
