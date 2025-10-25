import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileEdit, Trash2, Clock, User, AlertCircle } from 'lucide-react';
import { Button, Card } from '../../components/ui';
import type { Draft } from '../../types';

export function Drafts() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<Draft[]>(() => {
    // Load drafts from localStorage
    const stored = localStorage.getItem('devotee_form_drafts');
    return stored ? JSON.parse(stored) : [];
  });

  const deleteDraft = (id: string) => {
    const updated = drafts.filter(d => d.id !== id);
    setDrafts(updated);
    localStorage.setItem('devotee_form_drafts', JSON.stringify(updated));
  };

  const loadDraft = (draft: Draft) => {
    localStorage.setItem('devotee_form_current_draft', JSON.stringify(draft));
    navigate('/add-devotee');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Draft Entries</h1>
        <p className="text-gray-600 mt-2">Resume incomplete devotee entries</p>
      </div>

      {/* localStorage Warning */}
      <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-yellow-800">Local Storage Notice</h3>
            <p className="text-sm text-yellow-700 mt-1">
              <strong>Important:</strong> Drafts are saved on this device only (browser localStorage). 
              They will <strong>NOT</strong> be available on other computers or browsers. 
              Clear your browser data or use incognito mode may delete these drafts.
            </p>
          </div>
        </div>
      </div>

      {drafts.length === 0 ? (
        <Card className="p-12 text-center">
          <FileEdit className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Drafts</h3>
          <p className="text-gray-500 mb-6">
            You don't have any saved draft entries yet.
          </p>
          <Button onClick={() => navigate('/add-devotee')}>
            Create New Entry
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drafts.map((draft) => (
            <Card key={draft.id} className="p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">
                    {draft.givenName || 'Unnamed'} {draft.familyName || ''}
                  </h3>
                </div>
                <button
                  onClick={() => deleteDraft(draft.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Delete draft"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                {draft.nationality && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Nationality:</span> {draft.nationality}
                  </p>
                )}
                {draft.contact && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Contact:</span> {draft.contact}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>Saved {formatDate(draft.savedAt)}</span>
                </div>
              </div>

              <Button
                variant="secondary"
                className="w-full"
                onClick={() => loadDraft(draft)}
              >
                Continue Editing
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
