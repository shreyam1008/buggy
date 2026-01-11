import React, { useState, useRef, useCallback } from 'react';
import { motion, Reorder } from 'framer-motion';
import { FileUp, FileText, Download, Trash2, GripVertical, Plus } from 'lucide-react';
import { Button } from '../components/shared/Button';

interface PDFFile {
  id: string;
  file: File;
  name: string;
  preview?: string;
}

export default function PdfMerger() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const newFiles: PDFFile[] = Array.from(selectedFiles)
      .filter(file => file.type === 'application/pdf' || file.type.startsWith('image/'))
      .map(file => ({
        id: crypto.randomUUID(),
        file,
        name: file.name,
      }));
    
    setFiles(prev => [...prev, ...newFiles]);
    setMergedUrl(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setMergedUrl(null);
  };

  const mergePdfs = async () => {
    if (files.length < 2) return;
    
    setIsMerging(true);
    
    try {
      // Lazy load pdf-lib
      const { PDFDocument } = await import('pdf-lib');
      
      const mergedPdf = await PDFDocument.create();
      
      for (const pdfFile of files) {
        const arrayBuffer = await pdfFile.file.arrayBuffer();
        
        if (pdfFile.file.type === 'application/pdf') {
          const pdf = await PDFDocument.load(arrayBuffer);
          const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          pages.forEach(page => mergedPdf.addPage(page));
        } else if (pdfFile.file.type.startsWith('image/')) {
          // Convert image to PDF page
          const imageBytes = new Uint8Array(arrayBuffer);
          let image;
          
          if (pdfFile.file.type === 'image/png') {
            image = await mergedPdf.embedPng(imageBytes);
          } else {
            image = await mergedPdf.embedJpg(imageBytes);
          }
          
          const page = mergedPdf.addPage([image.width, image.height]);
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
          });
        }
      }
      
      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setMergedUrl(url);
    } catch (error) {
      console.error('Failed to merge PDFs:', error);
    } finally {
      setIsMerging(false);
    }
  };

  const downloadMerged = () => {
    if (!mergedUrl) return;
    
    const link = document.createElement('a');
    link.href = mergedUrl;
    link.download = 'merged.pdf';
    link.click();
  };

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <h1 className="page-title">PDF Merger</h1>
        <p className="page-subtitle">Combine PDFs & images into one document</p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-content">
          {/* Drop Zone */}
          <div
            className="drop-zone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              style={{ display: 'none' }}
            />
            <div className="drop-zone-icon">
              <FileUp size={48} />
            </div>
            <p className="drop-zone-text">
              Drop PDFs or images here, or click to select
            </p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                  {files.length} file{files.length !== 1 ? 's' : ''} selected
                </span>
                <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Plus size={16} /> Add More
                </Button>
              </div>
              
              <Reorder.Group axis="y" values={files} onReorder={setFiles} style={{ listStyle: 'none', padding: 0 }}>
                {files.map((pdfFile) => (
                  <Reorder.Item
                    key={pdfFile.id}
                    value={pdfFile}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '12px',
                      marginBottom: '0.5rem',
                      cursor: 'grab',
                    }}
                    whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
                  >
                    <GripVertical size={18} style={{ color: 'rgba(255,255,255,0.4)' }} />
                    <FileText size={18} color="var(--primary-color)" />
                    <span style={{ flex: 1, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pdfFile.name}
                    </span>
                    <button
                      onClick={() => removeFile(pdfFile.id)}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
              
              <Button
                variant="primary"
                fullWidth
                onClick={mergePdfs}
                disabled={files.length < 2 || isMerging}
                style={{ marginTop: '1rem' }}
              >
                {isMerging ? (
                  <><div className="loading-spinner" style={{ width: 18, height: 18 }} /> Merging...</>
                ) : (
                  <><FileText size={18} /> Merge {files.length} Files</>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Download Result */}
      {mergedUrl && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="card-content" style={{ textAlign: 'center' }}>
            <div className="status-box status-success" style={{ marginBottom: '1rem' }}>
              ✓ PDFs merged successfully!
            </div>
            <Button variant="primary" onClick={downloadMerged}>
              <Download size={18} /> Download Merged PDF
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
