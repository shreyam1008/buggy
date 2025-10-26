import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileEdit, Trash2, Clock, User, AlertCircle, CheckCircle, Edit, RefreshCw } from 'lucide-react';
import { Button, Card } from '../../components/ui';
import { useToast } from '../../hooks/useToast';
import { draftService } from '../../utils/localStorage';
import { mockAPI } from '../../services/api';
import type { Draft } from '../../types';

export function Drafts() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [approvingDraftId, setApprovingDraftId] = useState<string | null>(null);

  // Load drafts on mount
  useEffect(() => {
    setDrafts(draftService.getDrafts());
  }, []);

  const deleteDraft = (id: string) => {
    if (confirm('Delete this draft?')) {
      draftService.deleteDraft(id);
      setDrafts(draftService.getDrafts());
      toast.success('Draft Deleted', 'Draft has been removed');
    }
  };

  const editDraft = (draft: Draft) => {
    navigate('/add-devotee', { state: { draftId: draft.id } });
  };
  
  // Approve and save draft mutation
  const approveMutation = useMutation({
    mutationFn: async (draft: Draft) => {
      // Build permanent address
      const permanentAddress = [
        draft.addressStreet,
        draft.addressCity,
        draft.addressState,
        draft.addressCountry
      ].filter(Boolean).join(', ');

      const person = await mockAPI.createPerson({
        givenName: draft.givenName || '',
        familyName: draft.familyName || '',
        dob: draft.dob || '',
        gender: draft.gender || 'Male',
        nationality: draft.nationality || 'Nepal',
        permanentAddress,
        contact: draft.contact || '',
        email: draft.email || '',
        identities: draft.identities || [],
      });

      const visit = await mockAPI.createVisit({
        personId: person.id,
        arrivalDateTime: draft.arrivalDateTime || new Date().toISOString(),
        arrivalLocation: draft.arrivalLocation || '',
        temporaryAddress: draft.temporaryAddress || '',
        plannedDeparture: draft.plannedDeparture || '',
        purpose: draft.purpose || '',
        host: draft.host || '',
      });

      if (draft.photoPreview) {
        await mockAPI.createPhoto({
          personId: person.id,
          visitId: visit.id,
          fileName: 'photo.jpg',
          size: draft.photoSize || 0,
          mime: 'image/jpeg',
          thumbnailData: draft.photoPreview,
        });
      }

      // Delete draft after successful save
      draftService.deleteDraft(draft.id);
      
      return { person, visit };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      setDrafts(draftService.getDrafts());
      setApprovingDraftId(null);
      toast.success('Draft Approved & Saved', `${data.person.givenName} ${data.person.familyName} has been added to the database`);
    },
    onError: (error: any) => {
      setApprovingDraftId(null);
      toast.error('Failed to Approve Draft', error.message || 'Please try again');
    },
  });
  
  const approveDraft = (draft: Draft) => {
    // Validate required fields
    if (!draft.givenName || !draft.familyName || !draft.dob || !draft.contact || 
        !draft.identities?.[0]?.idNumber || !draft.arrivalDateTime || !draft.temporaryAddress) {
      toast.warning('Incomplete Draft', 'Please complete all required fields before approving');
      navigate('/add-devotee', { state: { draftId: draft.id } });
      return;
    }
    
    if (confirm(`Approve and save ${draft.givenName} ${draft.familyName} to the database?`)) {
      setApprovingDraftId(draft.id);
      approveMutation.mutate(draft);
    }
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

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => editDraft(draft)}
                  disabled={approvingDraftId === draft.id}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => approveDraft(draft)}
                  disabled={approvingDraftId === draft.id}
                >
                  {approvingDraftId === draft.id ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Approve & Save
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
