import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Camera, Download, Zap, Clipboard, RefreshCw } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { Button } from '../components/shared/Button';

type OutputFormat = 'jpeg' | 'png' | 'webp';

const formatMimeTypes: Record<OutputFormat, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export default function ImageConverter() {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string>('');
  const [convertedPreview, setConvertedPreview] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState(85);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg');
  const [stats, setStats] = useState<{ original: number; converted: number; savings: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup Object URLs on unmount or change
  useEffect(() => {
    return () => {
      if (originalPreview) URL.revokeObjectURL(originalPreview);
      if (convertedPreview) URL.revokeObjectURL(convertedPreview);
    };
  }, [originalPreview, convertedPreview]);

  // Clipboard Paste Handler (Ctrl+V)
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            handleFileSelect(file);
            break;
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;

    // Cleanup previous URLs
    if (originalPreview) URL.revokeObjectURL(originalPreview);
    if (convertedPreview) URL.revokeObjectURL(convertedPreview);

    setOriginalImage(file);
    setOriginalPreview(URL.createObjectURL(file));
    setConvertedBlob(null);
    setConvertedPreview('');
    setStats(null);
  }, [originalPreview, convertedPreview]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const convertImage = async () => {
    if (!originalImage) return;

    setIsProcessing(true);

    try {
      // First compress if needed (lossy formats)
      let processedBlob: Blob;

      if (outputFormat === 'png') {
        // PNG: Convert without lossy compression
        processedBlob = await convertToFormat(originalImage, 'png', 1);
      } else {
        // JPEG/WEBP: Apply quality compression first
        const compressed = await imageCompression(originalImage, {
          maxSizeMB: 10,
          maxWidthOrHeight: 4096,
          useWebWorker: true,
          initialQuality: quality / 100,
          fileType: formatMimeTypes[outputFormat],
        });
        processedBlob = await convertToFormat(compressed, outputFormat, quality / 100);
      }

      // Cleanup old preview
      if (convertedPreview) URL.revokeObjectURL(convertedPreview);

      setConvertedBlob(processedBlob);
      setConvertedPreview(URL.createObjectURL(processedBlob));

      const originalSize = originalImage.size / 1024;
      const convertedSize = processedBlob.size / 1024;
      const savings = ((originalSize - convertedSize) / originalSize) * 100;

      setStats({
        original: originalSize,
        converted: convertedSize,
        savings: savings > 0 ? savings : 0,
      });
    } catch (error) {
      console.error('Conversion failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const convertToFormat = (file: Blob, format: OutputFormat, qualityVal: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;

        // Fill white background for JPEG (handles transparency)
        if (format === 'jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas toBlob failed'));
          },
          formatMimeTypes[format],
          format === 'png' ? undefined : qualityVal
        );
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleDownload = () => {
    if (!convertedBlob || !originalImage) return;

    const baseName = originalImage.name.replace(/\.[^.]+$/, '');
    const link = document.createElement('a');
    link.href = convertedPreview;
    link.download = `${baseName}_converted.${outputFormat}`;
    link.click();
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      // Temporarily switch to camera capture mode
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
      // Remove attribute after click to restore file picker behavior
      setTimeout(() => {
          fileInputRef.current?.removeAttribute('capture');
      }, 500);
    }
  };

  const reset = () => {
    if (originalPreview) URL.revokeObjectURL(originalPreview);
    if (convertedPreview) URL.revokeObjectURL(convertedPreview);
    setOriginalImage(null);
    setConvertedBlob(null);
    setOriginalPreview('');
    setConvertedPreview('');
    setStats(null);
  };

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="page-header">
        <h1 className="page-title">Image Converter</h1>
        <p className="page-subtitle">Convert & compress images • Paste, drop, or upload</p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-content">
          {/* Drop Zone */}
          <div
            className={`drop-zone ${originalImage ? 'active' : ''}`}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => {
                if(fileInputRef.current) {
                    fileInputRef.current.removeAttribute('capture'); // Default: File Picker
                    fileInputRef.current.click()
                }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              style={{ display: 'none' }}
            />
            <div className="drop-zone-icon">
              <Upload size={48} />
            </div>
            <p className="drop-zone-text">
              {originalImage ? originalImage.name : 'Drop, paste (Ctrl+V), or click to upload'}
            </p>
            {!originalImage && (
              <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '0.5rem' }}>
                <Clipboard size={14} style={{ verticalAlign: 'middle' }} /> Paste screenshots directly!
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center' }}>
            <Button variant="secondary" onClick={(e) => { e.stopPropagation(); handleCameraCapture(); }}>
              <Camera size={18} /> Camera
            </Button>
            {originalImage && (
              <Button variant="ghost" onClick={(e) => { e.stopPropagation(); reset(); }}>
                <RefreshCw size={18} /> Reset
              </Button>
            )}
          </div>

          {/* Settings */}
          {originalImage && (
            <div style={{ marginTop: '1.5rem' }}>
              {/* Output Format */}
              <div className="input-group">
                <label className="label">Output Format</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(['jpeg', 'png', 'webp'] as OutputFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setOutputFormat(fmt)}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: outputFormat === fmt ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${outputFormat === fmt ? 'var(--primary-color)' : 'var(--glass-border)'}`,
                        borderRadius: '8px',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: outputFormat === fmt ? 600 : 400,
                        textTransform: 'uppercase',
                        fontSize: '0.8rem',
                      }}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality (only for lossy formats) */}
              {outputFormat !== 'png' && (
                <div className="input-group">
                  <label className="label">Quality: {quality}%</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              )}

              <Button
                variant="primary"
                fullWidth
                onClick={convertImage}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <><div className="loading-spinner" style={{ width: 18, height: 18 }} /> Converting...</>
                ) : (
                  <><Zap size={18} /> Convert to {outputFormat.toUpperCase()}</>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {convertedBlob && stats && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="card-content">
            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Original</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{stats.original.toFixed(1)} KB</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Converted</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#6ee7b7' }}>{stats.converted.toFixed(1)} KB</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Saved</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ec4899' }}>{stats.savings.toFixed(1)}%</div>
              </div>
            </div>

            {/* Format Badge */}
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <span style={{
                background: 'var(--primary-color)',
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}>
                {outputFormat}
              </span>
            </div>

            {/* Comparison */}
            <div className="comparison-grid">
              <div>
                <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Original</h4>
                <div className="image-preview">
                  <img src={originalPreview} alt="Original" />
                </div>
              </div>
              <div>
                <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Converted</h4>
                <div className="image-preview">
                  <img src={convertedPreview} alt="Converted" />
                </div>
              </div>
            </div>

            <Button variant="primary" fullWidth onClick={handleDownload} style={{ marginTop: '1.5rem' }}>
              <Download size={18} /> Download {outputFormat.toUpperCase()}
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
