import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:\n', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen w-full relative overflow-hidden" style={{ background: 'var(--oat-bg)' }}>
          <main className="text-center p-8 max-w-lg w-full relative z-10" style={{ animation: 'shake-in 0.5s cubic-bezier(.36,.07,.19,.97) both' }}>
            <h1 className="flex flex-col items-center justify-center gap-2 mb-4">
              <span className="text-5xl mb-2" style={{ animation: 'glitch-tilt 2s infinite alternate', display: 'inline-block' }}>💥</span>
              <span style={{ color: 'var(--oat-color-error)', fontSize: '2.5rem' }}>The Buggy Crashed!</span>
            </h1>
            
            <div className="p-6 mb-8 text-left overflow-hidden" style={{ background: 'var(--oat-bg-soft)', borderRadius: 'var(--oat-radius)', borderLeft: '4px solid var(--oat-color-error)' }}>
              <p className="font-bold mb-2">Oops! We hit a massive pothole.</p>
              <p className="text-sm opacity-80 mb-4">
                Something went terribly wrong under the hood. The code monkeys have been notified (maybe).
              </p>
              
              <details className="text-xs opacity-70 cursor-pointer">
                <summary className="font-mono">Engine Diagnostic Log</summary>
                <div className="mt-2 p-3 font-mono overflow-auto max-h-32 bg-slate-900 text-green-400 rounded">
                  {this.state.error?.toString()}
                </div>
              </details>
            </div>
            
            <div className="flex gap-4">
              <button 
                type="button" 
                onClick={() => window.location.reload()}
                className="flex-1"
                style={{ background: 'var(--oat-color-error)', color: '#fff', borderColor: 'var(--oat-color-error)' }}
              >
                🔄 Restart Engine
              </button>
              <button 
                type="button" 
                onClick={() => window.location.replace('/')}
                className="flex-[0.5]"
              >
                🏠 Go Home
              </button>
            </div>
          </main>

          {/* Background CSS Effects */}
          <div className="absolute inset-0 pointer-events-none opacity-5" style={{ background: 'radial-gradient(circle at center, var(--oat-color-error) 0%, transparent 70%)', animation: 'pulse-bg 4s infinite' }} />

          <style dangerouslySetInnerHTML={{__html: `
            @keyframes shake-in {
              10%, 90% { transform: translate3d(-1px, 0, 0); }
              20%, 80% { transform: translate3d(2px, 0, 0); }
              30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
              40%, 60% { transform: translate3d(4px, 0, 0); }
            }
            @keyframes glitch-tilt {
              0% { transform: rotate(0deg) scale(1); }
              10% { transform: rotate(-10deg) scale(1.1); filter: drop-shadow(4px 0 0 red); }
              20% { transform: rotate(10deg) scale(0.9); filter: drop-shadow(-4px 0 0 blue); }
              30% { transform: rotate(0deg) scale(1.2); }
              40% { transform: rotate(5deg) scale(1); }
              100% { transform: rotate(0deg) scale(1); filter: drop-shadow(0 0 0 transparent); }
            }
            @keyframes pulse-bg {
              0%, 100% { opacity: 0.05; transform: scale(1); }
              50% { opacity: 0.15; transform: scale(1.1); }
            }
          `}} />
        </div>
      );
    }

    return this.props.children;
  }
}
