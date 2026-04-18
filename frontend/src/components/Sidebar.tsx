import { Link, useLocation } from 'wouter';
import { useState, useEffect } from 'react';

const navItems = [
  { path: '/', label: 'Calendar', icon: '🗓️' },
  { path: '/date-converter', label: 'Date Converter', icon: '📅' },
  { path: '/image', label: 'Image Tools', icon: '🖼️' },
  { path: '/pdf', label: 'PDF Merger', icon: '📄' },
  { path: '/notes', label: 'Notes', icon: '📝' },
  { path: '/bcrypt', label: 'Bcrypt', icon: '🔒' },
  { path: '/ai', label: 'AI Studio', icon: '✨' },
  { path: '/chat', label: 'Live Chat', icon: '💬' },
  { path: '/log', label: 'The Log', icon: '📓' },
];

const myApps = [
  {
    href: 'https://shreyam1008.github.io/dbterm/',
    icon: '🖥️',
    label: 'dbterm',
    description: 'Database terminal utility',
  },
  {
    href: 'https://nepallegalfirm.com.np/',
    icon: '⚖️',
    label: 'Legal Firm',
    description: 'Law firm website',
  },
  {
    href: 'https://shreyam1008.github.io/visualise-oklch/',
    sourceHref: 'https://github.com/shreyam1008/visualise-oklch',
    icon: '🎨',
    label: 'Visualise OKLCH',
    description: 'Open source VS Code extension',
  },
  {
    href: 'https://mamatap.com.np/',
    icon: '👩‍⚖️',
    label: 'Mamata P',
    description: 'Portfolio website for a legal professional',
  },
  {
    href: 'https://gitvibes.pages.dev/',
    icon: '🌐',
    label: 'GitVibes',
    description: 'Social media for code',
  },
  {
    href: 'https://shreyam1008.github.io/gobarrygo/',
    icon: '🚀',
    label: 'GoBarryGo',
    description: '16x faster downloads',
  },
  {
    href: 'https://shreyam1008.github.io/ProtoPeek/',
    icon: '🔌',
    label: 'ProtoPeek',
    description: 'gRPC Tooling',
  },
  {
    href: 'https://radhey.web.app/',
    icon: '⚛️',
    label: 'Radhey',
    description: 'React-based project · Ongoing',
  },
];

const socials = [
  { href: 'mailto:shreyam1008@gmail.com', icon: '✉️', label: 'Email' },
  { href: 'https://github.com/shreyam1008', icon: '🐙', label: 'GitHub' },
  { href: 'https://x.com/shreyam1008', icon: '🐦', label: 'X (Twitter)' },
  { href: 'https://linkedin.com/in/shreyam1008', icon: '💼', label: 'LinkedIn' },
  { href: 'https://instagram.com/shreyam1008', icon: '�', label: 'Instagram' },
  { href: 'https://www.facebook.com/shreyam1008', icon: '📘', label: 'Facebook' },
  { href: 'https://www.strava.com/athletes/113238146', icon: '🚴', label: 'Strava' },
  { href: 'https://steamcommunity.com/id/buggythegret', icon: '🎮', label: 'Steam' },
  { href: 'https://youtube.com/@shreyam1008', icon: '�', label: 'YouTube' },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Secret App — 5 clicks to reveal
  const [clicks, setClicks] = useState(0);
  const [secretUnlocked, setSecretUnlocked] = useState(false);

  const handleSecretClick = () => {
    if (secretUnlocked) return;
    const newClicks = clicks + 1;
    setClicks(newClicks);
    if (newClicks >= 5) setSecretUnlocked(true);
    setTimeout(() => setClicks(0), 2000);
  };
  
  // Theme Toggle Logic — class-based dark mode
  const [theme, setTheme] = useState<'light'|'dark'>(() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('buggy-theme')) {
      return localStorage.getItem('buggy-theme') as 'light'|'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('buggy-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
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
          className="lg:hidden fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={closeSidebar}
        />
      )}

      <aside className={`fixed lg:static top-0 left-0 h-full w-[280px] bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800/80 z-50 transform transition-transform duration-300 ease-out shadow-2xl lg:shadow-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } flex flex-col`}>

        {/* Header — 5 clicks to unlock secret */}
        <div 
          className="px-5 py-6 flex-shrink-0 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 select-none cursor-default transition-colors"
          onClick={handleSecretClick}
        >
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-[26px]">⚡</span> Utilities
          </h2>
          <button 
            onClick={(e) => { e.stopPropagation(); closeSidebar(); }} 
            className="lg:hidden p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 custom-scrollbar">
          {/* Prominent — Meet Shreyam CTA */}
          <Link href="/me">
            <button
              type="button"
              onClick={closeSidebar}
              className="sidebar-me-cta mb-4 w-full text-left"
              aria-label="Meet Shreyam — profile, journey, and all socials"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl shadow-inner">
                  🪷
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-black tracking-wide uppercase leading-tight">
                    Meet Shreyam
                  </div>
                  <div className="text-[11px] opacity-90 leading-tight mt-0.5">
                    code · bhakti · cycling · arena
                  </div>
                </div>
                <span className="text-base opacity-80" aria-hidden="true">→</span>
              </div>
            </button>
          </Link>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <button
                  onClick={closeSidebar}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left ${
                    location === item.path
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                  }`}
                >
                  <span className={`text-[18px] sm:text-xl transition-transform duration-300 ${location === item.path ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  <span className="text-sm sm:text-[15px]">{item.label}</span>
                </button>
              </Link>
            ))}
          </nav>

          {/* My Apps */}
          <div className="pt-6 pb-2 px-3">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 transition-colors">My Apps</h3>
            <div className="space-y-0.5">
              {myApps.map((app) => (
                <div
                  key={app.label}
                  className="rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <a
                    href={app.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all cursor-pointer hover:scale-[1.01] transform"
                  >
                    <span className="text-base w-6 text-center opacity-70 pt-0.5">{app.icon}</span>
                    <span className="min-w-0">
                      <span className="block">{app.label}</span>
                      <span className="block text-xs text-slate-500 dark:text-slate-500">
                        {app.description}
                      </span>
                    </span>
                  </a>

                  {app.sourceHref && (
                    <a
                      href={app.sourceHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-11 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-200"
                    >
                      Source
                    </a>
                  )}
                </div>
              ))}

              {/* Secret App — revealed after 5 clicks on header */}
              {secretUnlocked && (
                <a 
                  href="https://loveyoubuddy.web.app/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-pink-500 hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all cursor-pointer hover:scale-[1.01] transform chat-msg-enter"
                >
                  <span className="text-base w-6 text-center">💖</span>
                  <span className="font-semibold">Secret App</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Footer: Profile, Theme Toggle & Socials */}
        <div className="p-4 sm:p-5 flex-shrink-0 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#0b1121] transition-colors">
          
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
              className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-amber-400 transition-colors shadow-sm cursor-pointer"
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
