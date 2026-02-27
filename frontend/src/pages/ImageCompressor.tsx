import { useState, useRef, useEffect } from 'react';
import imageCompression from 'browser-image-compression';

type OutputFormat = 'jpeg' | 'png' | 'webp';

const fmtSize = (b: number) =>
  b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(2)} MB`;

export default function ImageCompressor() {
  const [original, setOriginal] = useState<File | null>(null);
  const [converted, setConverted] = useState<Blob | null>(null);
  const [origPreview, setOrigPreview] = useState('');
  const [convPreview, setConvPreview] = useState('');
  const [processing, setProcessing] = useState(false);
  const [quality, setQuality] = useState(85);
  const [format, setFormat] = useState<OutputFormat>('jpeg');
  const [stats, setStats] = useState<{ orig: number; conv: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (origPreview) URL.revokeObjectURL(origPreview);
      if (convPreview) URL.revokeObjectURL(convPreview);
    };
  }, [origPreview, convPreview]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (origPreview) URL.revokeObjectURL(origPreview);
    if (convPreview) URL.revokeObjectURL(convPreview);
    setOriginal(file);
    setOrigPreview(URL.createObjectURL(file));
    setConverted(null);
    setConvPreview('');
    setStats(null);
  };

  const compress = async () => {
    if (!original) return;
    setProcessing(true);
    try {
      const mimeMap: Record<OutputFormat, string> = {
        jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
      };
      const result = await imageCompression(original, {
        maxSizeMB: 10,
        maxWidthOrHeight: 4096,
        useWebWorker: true,
        initialQuality: quality / 100,
        fileType: mimeMap[format],
      });
      const blob = new Blob([result], { type: mimeMap[format] });
      if (convPreview) URL.revokeObjectURL(convPreview);
      setConverted(blob);
      setConvPreview(URL.createObjectURL(blob));
      setStats({ orig: original.size, conv: blob.size });
    } catch (e) {
      console.error('Compression failed', e);
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!converted) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(converted);
    a.download = `compressed.${format}`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleCamera = () => {
    if (fileRef.current) {
      fileRef.current.setAttribute('capture', 'environment');
      fileRef.current.click();
      setTimeout(() => fileRef.current?.removeAttribute('capture'), 500);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const file = e.clipboardData.files[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    if (origPreview) URL.revokeObjectURL(origPreview);
    if (convPreview) URL.revokeObjectURL(convPreview);
    setOriginal(null);
    setConverted(null);
    setOrigPreview('');
    setConvPreview('');
    setStats(null);
    setProcessing(false);
  };

  return (
    <div className="max-w-3xl mx-auto pt-12 lg:pt-0" onPaste={onPaste}>
      <h1 className="text-2xl font-bold mb-1 text-slate-900 dark:text-white transition-colors duration-300">Image Compressor</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 transition-colors duration-300">Compress & convert images · Paste, drop, or camera capture</p>

      {!original ? (
        <div
          className="bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-10 text-center cursor-pointer hover:border-red-500 dark:hover:border-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => {
            if (fileRef.current) {
              fileRef.current.removeAttribute('capture');
              fileRef.current.click();
            }
          }}
        >
          <span className="text-5xl block mb-3 transform transition-transform hover:scale-110 duration-300">📷</span>
          <p className="font-semibold text-slate-900 dark:text-white transition-colors">Drop image here or click to browse</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">Supports JPEG, PNG, WebP · Ctrl+V to paste</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div className="flex justify-center gap-3 mt-4">
            <button
              onClick={(e) => { e.stopPropagation(); handleCamera(); }}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 cursor-pointer shadow-sm hover:scale-105"
            >
              📸 Camera
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm transition-colors duration-300">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Settings</h3>
              <button onClick={reset} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">↺ Reset</button>
            </div>

            {/* Format selector */}
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block transition-colors">Output Format</label>
              <div className="flex gap-2">
                {(['jpeg', 'png', 'webp'] as OutputFormat[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold uppercase transition-all duration-300 cursor-pointer ${
                      format === f
                        ? 'bg-red-600 text-white shadow-md scale-[1.02]'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-[1.01]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality */}
            {format !== 'png' && (
              <div className="animate-in fade-in duration-300">
                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block transition-colors">Quality: <strong className="text-slate-900 dark:text-white">{quality}%</strong></label>
                <input
                  type="range" min={10} max={100} value={quality}
                  onChange={(e) => setQuality(+e.target.value)}
                  className="w-full accent-red-600"
                />
              </div>
            )}

            <button
              onClick={compress}
              disabled={processing}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.98]"
            >
              {processing ? '⏳ Compressing…' : `⚡ Compress to ${format.toUpperCase()}`}
            </button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors duration-300 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">Original</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white transition-colors">{fmtSize(stats.orig)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">Compressed</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 transition-colors">{fmtSize(stats.conv)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">Saved</p>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400 transition-colors">{Math.round((1 - stats.conv / stats.orig) * 100)}%</p>
                </div>
              </div>
              <button
                onClick={download}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.98]"
              >
                ⬇ Download {format.toUpperCase()}
              </button>
            </div>
          )}

          {/* Previews */}
          <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-500">
            {origPreview && (
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 transition-colors">Original</p>
                <img src={origPreview} alt="Original" className="max-h-48 mx-auto rounded-lg object-contain shadow-sm border border-slate-200 dark:border-slate-800" />
              </div>
            )}
            {convPreview && (
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 transition-colors">Compressed</p>
                <img src={convPreview} alt="Compressed" className="max-h-48 mx-auto rounded-lg object-contain shadow-sm border border-slate-200 dark:border-slate-800" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
