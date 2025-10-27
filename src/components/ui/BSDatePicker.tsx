import { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Copy, Check } from 'lucide-react';
import { parseDateInput, formatDateInput, isValidBSDate, convertBStoAD, convertADISOtoBS, formatDateToReadable } from '../../utils/dateUtils';
import { copyToClipboardWithState } from '../../utils/clipboard';

interface BSDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect: (adDate: string) => void;
  title?: string;
  initialADDate?: string;
}

export function BSDatePicker({ isOpen, onClose, onDateSelect, title = 'Select BS Date', initialADDate }: BSDatePickerProps) {
  const [bsInput, setBsInput] = useState('');
  const [convertedAD, setConvertedAD] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && initialADDate) {
      try {
        const bsDate = convertADISOtoBS(initialADDate);
        if (bsDate) {
          setBsInput(bsDate);
        } else {
          setBsInput('');
          setConvertedAD('');
        }
      } catch (e) {
        setBsInput('');
        setConvertedAD('');
      }
    }
  }, [isOpen, initialADDate]);


  useEffect(() => {
    const parsed = parseDateInput(bsInput);
    if (parsed) {
      const { day, month, year } = parsed;
      if (isValidBSDate(parsed)) {
        const adDate = convertBStoAD(day, month, year);
        if (adDate) {
          setError('');
          setConvertedAD(adDate);
        } else {
          setError('Invalid BS date');
          setConvertedAD('');
        }
      } else {
        setError('Date out of range (1970-2100 BS)');
        setConvertedAD('');
      }
    } else {
      setConvertedAD('');
      setError('');
    }
  }, [bsInput]);

  const handleOk = () => {
    if (convertedAD) {
      onDateSelect(convertedAD);
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateInput(e.target.value);
    setBsInput(formatted);
  };

  const handleCopy = async () => {
    if (convertedAD) {
      await copyToClipboardWithState(convertedAD, setCopied);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Enter BS Date</label>
          <input
            ref={inputRef}
            type="text"
            placeholder="DD-MM-YYYY"
            value={bsInput}
            onChange={handleInputChange}
            maxLength={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono"
          />
          <p className="text-xs text-gray-500">Type: 15012081 (auto-formats to 15-01-2081)</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {convertedAD && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">BS:</span> {bsInput}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-medium">AD:</span> {formatDateToReadable(convertedAD)}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                title="Copy AD date"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-green-600" />
                )}
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-end pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleOk} disabled={!convertedAD}>
            OK
          </Button>
        </div>
      </div>
    </Modal>
  );
}
