import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Calendar, ArrowLeftRight, Copy, Check, Image, Download, Upload, FileDown, Trash2 } from 'lucide-react';
import { Card, Button } from '../../components/ui';
import { mockAPI } from '../../services/api';
import { compressImage } from '../../utils/imageCompression';
import type { CompressedImage } from '../../types';
import NepaliDate from 'nepali-date-converter';
import * as XLSX from 'xlsx';

export function Tools() {
  const navigate = useNavigate();
  
  // BS to AD converter state
  const [bsInput, setBsInput] = useState('');
  const [bsResult, setBsResult] = useState('');
  const [bsError, setBsError] = useState('');
  const [bsCopied, setBsCopied] = useState(false);

  // AD to BS converter state
  const [adInput, setAdInput] = useState('');
  const [adResult, setAdResult] = useState('');
  const [adError, setAdError] = useState('');
  const [adCopied, setAdCopied] = useState(false);

  // Photo compressor state
  const [photos, setPhotos] = useState<Array<{ original: File; compressed?: CompressedImage; preview: string; size: number; compressedSize?: number }>>([]);
  const [compressing, setCompressing] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Export state
  const { data: residents } = useQuery({
    queryKey: ['residents'],
    queryFn: () => mockAPI.getCurrentResidents(),
  });
  const [exportStatus, setExportStatus] = useState('');

  const formatBSInput = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    let formatted = '';
    
    if (cleaned.length > 0) {
      formatted = cleaned.substring(0, 2);
      if (cleaned.length > 2) {
        formatted += '-' + cleaned.substring(2, 4);
      }
      if (cleaned.length > 4) {
        formatted += '-' + cleaned.substring(4, 8);
      }
    }
    
    return formatted;
  };

  const parseBSDate = (input: string) => {
    const digits = input.replace(/\D/g, '');
    
    if (digits.length >= 8) {
      return {
        day: parseInt(digits.substring(0, 2)),
        month: parseInt(digits.substring(2, 4)),
        year: parseInt(digits.substring(4, 8))
      };
    }
    return null;
  };

  const formatADInput = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    let formatted = '';
    
    if (cleaned.length > 0) {
      formatted = cleaned.substring(0, 2);
      if (cleaned.length > 2) {
        formatted += '-' + cleaned.substring(2, 4);
      }
      if (cleaned.length > 4) {
        formatted += '-' + cleaned.substring(4, 8);
      }
    }
    
    return formatted;
  };

  const parseADDate = (input: string) => {
    const digits = input.replace(/\D/g, '');
    
    if (digits.length >= 8) {
      return {
        day: parseInt(digits.substring(0, 2)),
        month: parseInt(digits.substring(2, 4)),
        year: parseInt(digits.substring(4, 8))
      };
    }
    return null;
  };

  useEffect(() => {
    if (bsInput.trim()) {
      const parsed = parseBSDate(bsInput);
      if (parsed && parsed.year >= 1970 && parsed.year <= 2100 && parsed.month >= 1 && parsed.month <= 12 && parsed.day >= 1 && parsed.day <= 32) {
        try {
          setBsError('');
          const nepaliDate = new NepaliDate(parsed.year, parsed.month - 1, parsed.day);
          const adDate = nepaliDate.toJsDate();
          const formatted = adDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
          setBsResult(`${formatted} (${adDate.toISOString().split('T')[0]})`);
        } catch (e) {
          setBsError('Invalid BS date');
          setBsResult('');
        }
      } else {
        setBsError('Enter 8 digits in DD-MM-YYYY format');
        setBsResult('');
      }
    } else {
      setBsResult('');
      setBsError('');
    }
  }, [bsInput]);

  useEffect(() => {
    if (adInput.trim()) {
      const parsed = parseADDate(adInput);
      if (parsed && parsed.year >= 1900 && parsed.year <= 2100 && parsed.month >= 1 && parsed.month <= 12 && parsed.day >= 1 && parsed.day <= 31) {
        try {
          setAdError('');
          const adDate = new Date(parsed.year, parsed.month - 1, parsed.day);
          const nepaliDate = new NepaliDate(adDate);
          const bsYear = nepaliDate.getYear();
          const bsMonth = (nepaliDate.getMonth() + 1).toString().padStart(2, '0');
          const bsDay = nepaliDate.getDate().toString().padStart(2, '0');
          setAdResult(`${bsDay}-${bsMonth}-${bsYear}`);
        } catch (e) {
          setAdError('Invalid AD date');
          setAdResult('');
        }
      } else {
        setAdError('Enter 8 digits in DD-MM-YYYY format');
        setAdResult('');
      }
    } else {
      setAdResult('');
      setAdError('');
    }
  }, [adInput]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Tools</h1>
        <p className="text-gray-600 mt-2">Helpful utilities for date conversion and more</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BS to AD Converter */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">BS to AD</h2>
              <p className="text-sm text-gray-600">Bikram Sambat to Anno Domini</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Enter BS Date</label>
              <input
                type="text"
                placeholder="DD-MM-YYYY"
                value={bsInput}
                onChange={(e) => setBsInput(formatBSInput(e.target.value))}
                maxLength={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Type: 15012081 (auto-formats to 15-01-2081)
              </p>
            </div>

            {bsError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{bsError}</p>
              </div>
            )}

            {bsResult && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 font-medium mb-1">Result:</p>
                    <p className="text-lg font-semibold text-green-800">{bsResult}</p>
                  </div>
                  <button
                    onClick={async () => {
                      const adDate = bsResult.match(/\((.*?)\)/)?.[1];
                      if (adDate) {
                        await navigator.clipboard.writeText(adDate);
                        setBsCopied(true);
                        setTimeout(() => setBsCopied(false), 2000);
                      }
                    }}
                    className="p-2 hover:bg-green-100 rounded-lg transition-colors ml-2"
                    title="Copy AD date"
                  >
                    {bsCopied ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5 text-green-600" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2">
              <p className="text-xs text-gray-600">
                <strong>Example:</strong> Type 15012081 → 15-01-2081 BS → AD date
              </p>
            </div>
          </div>
        </Card>

        {/* AD to BS Converter */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ArrowLeftRight className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AD to BS</h2>
              <p className="text-sm text-gray-600">Anno Domini to Bikram Sambat</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Enter AD Date</label>
              <input
                type="text"
                placeholder="DD-MM-YYYY"
                value={adInput}
                onChange={(e) => setAdInput(formatADInput(e.target.value))}
                maxLength={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Type: 15012025 (auto-formats to 15-01-2025)
              </p>
            </div>

            {adError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{adError}</p>
              </div>
            )}

            {adResult && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 font-medium mb-1">Result:</p>
                    <p className="text-lg font-semibold text-purple-800">{adResult}</p>
                  </div>
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(adResult);
                      setAdCopied(true);
                      setTimeout(() => setAdCopied(false), 2000);
                    }}
                    className="p-2 hover:bg-purple-100 rounded-lg transition-colors ml-2"
                    title="Copy BS date"
                  >
                    {adCopied ? (
                      <Check className="w-5 h-5 text-purple-600" />
                    ) : (
                      <Copy className="w-5 h-5 text-purple-600" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2">
              <p className="text-xs text-gray-600">
                <strong>Example:</strong> Type 15012025 → 15-01-2025 AD → BS date
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Bulk Photo Compressor */}
      <Card className="p-6 mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
            <Image className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Bulk Photo Compressor</h2>
            <p className="text-sm text-gray-600">Upload and compress multiple photos at once</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                setCompressing(true);
                
                const newPhotos = await Promise.all(
                  files.map(async (file) => {
                    const preview = URL.createObjectURL(file);
                    try {
                      const compressed = await compressImage(file, 50);
                      return {
                        original: file,
                        compressed,
                        preview,
                        size: file.size,
                        compressedSize: compressed.size
                      };
                    } catch (error) {
                      return {
                        original: file,
                        preview,
                        size: file.size
                      };
                    }
                  })
                );
                
                setPhotos([...photos, ...newPhotos]);
                setCompressing(false);
                if (photoInputRef.current) photoInputRef.current.value = '';
              }}
              className="hidden"
            />
            <Button
              onClick={() => photoInputRef.current?.click()}
              disabled={compressing}
            >
              <Upload className="w-4 h-4 mr-2" />
              {compressing ? 'Compressing...' : 'Select Photos'}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Upload multiple photos. They'll be automatically compressed to &lt;50KB
            </p>
          </div>

          {photos.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">
                  {photos.length} photo{photos.length > 1 ? 's' : ''} processed
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      photos.forEach(photo => {
                        if (photo.compressed) {
                          const a = document.createElement('a');
                          a.href = photo.compressed.dataURL;
                          a.download = `compressed_${photo.original.name}`;
                          a.click();
                        }
                      });
                    }}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download All
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      photos.forEach(p => URL.revokeObjectURL(p.preview));
                      setPhotos([]);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="mt-1 text-xs text-gray-600">
                      <p className="font-medium truncate">{photo.original.name}</p>
                      <p>Original: {(photo.size / 1024).toFixed(0)}KB</p>
                      {photo.compressedSize && (
                        <p className="text-green-600">Compressed: {(photo.compressedSize / 1024).toFixed(0)}KB</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>


      {/* Data Export Tool */}
      <Card className="p-6 mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
            <FileDown className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Data Export & Backup</h2>
            <p className="text-sm text-gray-600">Export data to Excel for reports and backup</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={async () => {
                if (!residents || residents.length === 0) {
                  setExportStatus('No data to export');
                  return;
                }

                setExportStatus('Exporting...');

                // Prepare data for Excel
                const exportData = residents.map(r => ({
                  'Given Name': r.person?.givenName || '',
                  'Family Name': r.person?.familyName || '',
                  'Date of Birth': r.person?.dob || '',
                  'Gender': r.person?.gender || '',
                  'Nationality': r.person?.nationality || '',
                  'Contact': r.person?.contact || '',
                  'Email': r.person?.email || '',
                  'ID Type': r.person?.identities?.[0]?.type || '',
                  'ID Number': r.person?.identities?.[0]?.idNumber || '',
                  'Arrival Date': r.arrivalDateTime.split('T')[0],
                  'Arrival Time': r.arrivalDateTime.split('T')[1]?.substring(0, 5) || '',
                  'Location': r.arrivalLocation || '',
                  'Room Number': r.temporaryAddress || '',
                  'Purpose': r.purpose || '',
                  'Planned Departure': r.plannedDeparture || '',
                  'Form-C Status': (r as any).formCStatus || 'Pending'
                }));

                // Create workbook and worksheet
                const ws = XLSX.utils.json_to_sheet(exportData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Residents');

                // Generate file
                const fileName = `residents_export_${new Date().toISOString().split('T')[0]}.xlsx`;
                XLSX.writeFile(wb, fileName);

                setExportStatus(`Exported ${residents.length} records successfully!`);
                setTimeout(() => setExportStatus(''), 3000);
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export All Residents
            </Button>

            <Button
              variant="secondary"
              onClick={async () => {
                if (!residents || residents.length === 0) {
                  setExportStatus('No data to export');
                  return;
                }

                setExportStatus('Exporting...');

                // Export only pending Form-C
                const pendingData = residents
                  .filter(r => r.formCStatus === 'Pending')
                  .map(r => ({
                    'Given Name': r.person?.givenName || '',
                    'Family Name': r.person?.familyName || '',
                    'Nationality': r.person?.nationality || '',
                    'ID Type': r.person?.identities?.[0]?.type || '',
                    'ID Number': r.person?.identities?.[0]?.idNumber || '',
                    'Arrival Date': r.arrivalDateTime.split('T')[0],
                    'Room Number': r.temporaryAddress || ''
                  }));

                if (pendingData.length === 0) {
                  setExportStatus('No pending Form-C entries');
                  setTimeout(() => setExportStatus(''), 3000);
                  return;
                }

                const ws = XLSX.utils.json_to_sheet(pendingData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Pending Form-C');

                const fileName = `pending_formc_${new Date().toISOString().split('T')[0]}.xlsx`;
                XLSX.writeFile(wb, fileName);

                setExportStatus(`Exported ${pendingData.length} pending Form-C records!`);
                setTimeout(() => setExportStatus(''), 3000);
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Pending Form-C
            </Button>

            <Button
              variant="secondary"
              onClick={async () => {
                if (!residents || residents.length === 0) {
                  setExportStatus('No data to export');
                  return;
                }

                setExportStatus('Exporting...');

                // Export today's arrivals
                const today = new Date().toISOString().split('T')[0];
                const todayArrivals = residents
                  .filter(r => r.arrivalDateTime.split('T')[0] === today)
                  .map(r => ({
                    'Given Name': r.person?.givenName || '',
                    'Family Name': r.person?.familyName || '',
                    'Nationality': r.person?.nationality || '',
                    'Contact': r.person?.contact || '',
                    'Arrival Time': r.arrivalDateTime.split('T')[1]?.substring(0, 5) || '',
                    'Room Number': r.temporaryAddress || '',
                    'Purpose': r.purpose || ''
                  }));

                if (todayArrivals.length === 0) {
                  setExportStatus('No arrivals today');
                  setTimeout(() => setExportStatus(''), 3000);
                  return;
                }

                const ws = XLSX.utils.json_to_sheet(todayArrivals);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Today Arrivals');

                const fileName = `arrivals_${today}.xlsx`;
                XLSX.writeFile(wb, fileName);

                setExportStatus(`Exported ${todayArrivals.length} arrival(s) for today!`);
                setTimeout(() => setExportStatus(''), 3000);
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Today's Arrivals
            </Button>

            <Button
              variant="secondary"
              onClick={async () => {
                if (!residents || residents.length === 0) {
                  setExportStatus('No data to export');
                  return;
                }

                setExportStatus('Creating backup...');

                // Full backup with all data
                const backupData = {
                  exportDate: new Date().toISOString(),
                  totalRecords: residents.length,
                  residents: residents
                };

                const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `full_backup_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);

                setExportStatus('Backup created successfully!');
                setTimeout(() => setExportStatus(''), 3000);
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Full JSON Backup
            </Button>
          </div>

          {exportStatus && (
            <div className={`rounded-lg p-3 ${
              exportStatus.includes('successfully') || exportStatus.includes('Exported') 
                ? 'bg-green-50 border border-green-200' 
                : exportStatus.includes('No') 
                ? 'bg-yellow-50 border border-yellow-200'
                : 'bg-blue-50 border border-blue-200'
            }`}>
              <p className={`text-sm ${
                exportStatus.includes('successfully') || exportStatus.includes('Exported')
                  ? 'text-green-700' 
                  : exportStatus.includes('No')
                  ? 'text-yellow-700'
                  : 'text-blue-700'
              }`}>
                {exportStatus}
              </p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Export Options</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• <strong>All Residents:</strong> Complete export of all resident data</li>
              <li>• <strong>Pending Form-C:</strong> Only entries with pending Form-C submission</li>
              <li>• <strong>Today's Arrivals:</strong> All devotees who arrived today</li>
              <li>• <strong>Full Backup:</strong> JSON format backup for system restore</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
