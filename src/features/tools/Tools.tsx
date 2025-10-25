import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Calendar, ArrowLeftRight, Copy, Check } from 'lucide-react';
import { Card } from '../../components/ui';
import NepaliDate from 'nepali-date-converter';

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

      {/* More tools can be added here */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gray-50 border-dashed">
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">More tools coming soon...</p>
          </div>
        </Card>
        <Card className="p-4 bg-gray-50 border-dashed">
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">More tools coming soon...</p>
          </div>
        </Card>
        <Card className="p-4 bg-gray-50 border-dashed">
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">More tools coming soon...</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
