import { Link, useLocation } from 'wouter';
import { useState, useEffect } from 'react';

const navItems = [
  { path: '/', label: 'Date Converter', icon: '📅' },
  { path: '/calendar', label: 'Calendar', icon: '🗓️' },
  { path: '/image', label: 'Image Tools', icon: '🖼️' },
  { path: '/pdf', label: 'PDF Merger', icon: '📄' },
  { path: '/notes', label: 'Notes', icon: '📝' },
  { path: '/bcrypt', label: 'Bcrypt', icon: '🔒' },
  { path: '/ai', label: 'AI Studio', icon: '✨' },
  { path: '/chat', label: 'Live Chat', icon: '💬' },
];

const socials = [
  { href: 'mailto:shreyam1008@gmail.com', icon: '✉️', label: 'Email' },
  { href: 'https://github.com/shreyam1008', icon: '🐙', label: 'GitHub' },
  { href: 'https://x.com/shreyam1008', icon: '🐦', label: 'X (Twitter)' },
  { href: 'https://youtube.com/@shreyam1008', icon: '📺', label: 'YouTube' },
  { href: 'https://linkedin.com/in/shreyam1008', icon: '💼', label: 'LinkedIn' },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Theme Toggle Logic
  const [theme, setTheme] = useState<'light'|'dark'>(() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('buggy-theme')) {
      return localStorage.getItem('buggy-theme') as 'light'|'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('buggy-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
      >
        <span className="text-xl leading-none">☰</span>
      </button>

      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-300"
          onClick={closeSidebar}
        />
      )}

      <aside className={`fixed lg:static top-0 left-0 h-full w-[280px] bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800/80 z-50 transform transition-transform duration-300 ease-out shadow-2xl lg:shadow-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } flex flex-col`}>
        <div className="flex-1 overflow-y-auto px-5 py-8 custom-scrollbar">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-[26px]">⚡</span> Buggy
            </h2>
            <button 
              onClick={closeSidebar} 
              className="lg:hidden p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          <nav className="space-y-1.5 flex-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <button
                  onClick={closeSidebar}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left ${
                    location === item.path
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 border border-transparent dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                  }`}
                >
                  <span className={`text-xl transition-transform duration-300 ${location === item.path ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  <span className="text-[15px]">{item.label}</span>
                </button>
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer Area: User Profile, Theme Toggle & Socials */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#0b1121] transition-colors">
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                SA
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-slate-900 dark:text-slate-200 leading-tight">Shreyam1008</span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide">SHREYAM ADHIKARI</span>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-amber-400 transition-colors shadow-sm"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {socials.map((s) => (
              <a 
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                title={s.label}
                className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-[13px] hover:bg-slate-300 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white hover:-translate-y-0.5 transition-all"
              >
                {s.icon}
              </a>
            ))}
          </div>
          
        </div>
      </aside>
    </>
  );
}
