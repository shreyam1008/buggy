import { useState, useRef } from 'react';

interface PDFFile {
  id: string;
  file: File;
  name: string;
  isImage: boolean;
}

export default function PdfMerger() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [merging, setMerging] = useState(false);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles: PDFFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      if (f.type === 'application/pdf' || f.type.startsWith('image/')) {
        newFiles.push({
          id: crypto.randomUUID(),
          file: f,
          name: f.name,
          isImage: f.type.startsWith('image/'),
        });
      }
    }
    setFiles((prev) => [...prev, ...newFiles]);
    setMergedUrl(null);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setMergedUrl(null);
  };

  const moveFile = (idx: number, dir: -1 | 1) => {
    setFiles((prev) => {
      const arr = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr;
    });
  };

  const merge = async () => {
    if (files.length < 2) return;
    setMerging(true);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const merged = await PDFDocument.create();

      for (const { file, isImage } of files) {
        const bytes = await file.arrayBuffer();

        if (!isImage) {
          const src = await PDFDocument.load(bytes);
          const pages = await merged.copyPages(src, src.getPageIndices());
          pages.forEach((p) => merged.addPage(p));
        } else {
          const imgBytes = new Uint8Array(bytes);
          const image = file.type === 'image/png'
            ? await merged.embedPng(imgBytes)
            : await merged.embedJpg(imgBytes);
          const page = merged.addPage([image.width, image.height]);
          page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        }
      }

      const pdfBytes = await merged.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      if (mergedUrl) URL.revokeObjectURL(mergedUrl);
      setMergedUrl(URL.createObjectURL(blob));
    } catch (e) {
      console.error('Merge failed:', e);
    } finally {
      setMerging(false);
    }
  };

  const download = () => {
    if (!mergedUrl) return;
    const a = document.createElement('a');
    a.href = mergedUrl;
    a.download = 'merged.pdf';
    a.click();
  };

  return (
    <div className="max-w-3xl mx-auto pt-12 lg:pt-0">
      <h1 className="text-2xl font-bold mb-1 text-slate-900 dark:text-white transition-colors">PDF Merger</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 transition-colors">Combine PDFs & images into one document</p>

      <div
        className="bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-red-500 dark:hover:border-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
      >
        <span className="text-4xl block mb-2">📄</span>
        <p className="font-semibold text-slate-900 dark:text-white transition-colors">Drop PDFs or images here</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">Or click to browse · Images are embedded as PDF pages</p>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,image/*"
          multiple
          hidden
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-600 dark:text-slate-300 transition-colors">{files.length} file{files.length > 1 ? 's' : ''}</span>
            <button
              onClick={() => fileRef.current?.click()}
              className="text-xs text-red-500 dark:text-red-400 hover:text-red-400 dark:hover:text-red-300 transition cursor-pointer"
            >
              + Add More
            </button>
          </div>

          <ul className="space-y-1">
            {files.map((f, i) => (
              <li key={f.id} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 rounded-lg px-3 py-2 text-sm transition-colors">
                <span>{f.isImage ? '🖼️' : '📄'}</span>
                <span className="flex-1 truncate text-slate-700 dark:text-slate-300">{f.name}</span>
                <div className="flex gap-1">
                  <button disabled={i === 0} onClick={() => moveFile(i, -1)} className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 text-xs cursor-pointer">↑</button>
                  <button disabled={i === files.length - 1} onClick={() => moveFile(i, 1)} className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 text-xs cursor-pointer">↓</button>
                  <button onClick={() => removeFile(f.id)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 text-xs cursor-pointer">✕</button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex gap-2 mt-4">
            <button
              onClick={merge}
              disabled={files.length < 2 || merging}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition cursor-pointer"
            >
              {merging ? '⏳ Merging…' : `🔗 Merge ${files.length} Files`}
            </button>
            <button
              onClick={() => { setFiles([]); setMergedUrl(null); }}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {mergedUrl && (
        <div className="mt-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5 text-center transition-colors">
          <p className="text-emerald-600 dark:text-emerald-400 font-semibold mb-3">✅ Merged Successfully</p>
          <button
            onClick={download}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition cursor-pointer"
          >
            ⬇ Download Merged PDF
          </button>
        </div>
      )}
    </div>
  );
}
