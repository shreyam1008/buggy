export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[80vh] w-full" style={{ background: 'var(--oat-bg)' }}>
      <main className="text-center p-8 max-w-md w-full" style={{ animation: 'bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both' }}>
        <h1 className="flex items-center justify-center gap-3 mb-4" style={{ color: 'var(--oat-color-primary)' }}>
          <span style={{ animation: 'float 3s ease-in-out infinite', display: 'inline-block', fontSize: '3rem' }}>🛸</span>
          404 Void
        </h1>
        <p className="mb-2 font-medium" style={{ fontSize: '1.2rem', color: 'var(--oat-text)' }}>
          Looks like you've wandered into the void.
        </p>
        <p className="mb-8" style={{ color: 'var(--oat-text)', opacity: 0.7, lineHeight: 1.6 }}>
          The page you are looking for has been abducted, moved, or never existed in this dimension. The Buggy has lost its tracks.
        </p>
        
        <form>
          <button 
            type="button" 
            onClick={() => window.location.replace('/')}
            className="w-full flex items-center justify-center gap-2"
          >
            <span style={{ animation: 'pulse-horizontal 1.5s infinite' }}>←</span> Return to Earth
          </button>
        </form>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(8deg); }
        }
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.8) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pulse-horizontal {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-4px); }
        }
      `}} />
    </div>
  );
}
