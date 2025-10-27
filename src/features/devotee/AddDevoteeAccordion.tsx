import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChevronRight, 
  ChevronDown, 
  RefreshCw, 
  Save, 
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button, Card, Input, Select } from '../../components/ui';
import { PhotoUploadEditor } from '../../components/features';
import { mockAPI } from '../../services/api';
import { NATIONALITIES, PURPOSES, LOCATIONS, ID_TYPES, GENDER_OPTIONS } from '../../config/constants';
import type { CompressedImage } from '../../types';
import { getCurrentDateTimeLocal } from '../../utils/dateUtils';

interface AddDevoteeAccordionProps {
  onNavigate: (view: string) => void;
}

interface FormSection {
  id: string;
  title: string;
  isComplete: boolean;
}

const DRAFT_KEY = 'devotee_form_draft';

export function AddDevoteeAccordion({ onNavigate }: AddDevoteeAccordionProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));
  const [formData, setFormData] = useState<any>({
    givenName: '',
    familyName: '',
    dob: '',
    gender: 'Male',
    nationality: 'Nepal',
    permanentAddress: '',
    contact: '',
    email: '',
    identities: [{ type: 'passport', idNumber: '', issuingCountry: 'Nepal', expiryDate: '' }],
    arrivalDateTime: getCurrentDateTimeLocal(),
    arrivalLocation: LOCATIONS[0],
    temporaryAddress: '',
    plannedDeparture: '',
    purpose: PURPOSES[0],
    host: 'Ashram Administration',
    photo: null as File | null,
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoSize, setPhotoSize] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const queryClient = useQueryClient();

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setFormData(draft.formData);
        if (draft.photoPreview) {
          setPhotoPreview(draft.photoPreview);
          setPhotoSize(draft.photoSize || 0);
        }
        setLastSaved(new Date(draft.savedAt));
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveDraft();
    }, 30000);
    return () => clearInterval(interval);
  }, [formData, photoPreview, photoSize]);

  const saveDraft = () => {
    const draft = {
      formData,
      photoPreview,
      photoSize,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    setLastSaved(new Date());
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setLastSaved(null);
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const person = await mockAPI.createPerson({
        givenName: data.givenName,
        familyName: data.familyName,
        dob: data.dob,
        gender: data.gender,
        nationality: data.nationality,
        permanentAddress: data.permanentAddress,
        contact: data.contact,
        email: data.email,
        identities: data.identities,
      });

      const visit = await mockAPI.createVisit({
        personId: person.id,
        arrivalDateTime: data.arrivalDateTime,
        arrivalLocation: data.arrivalLocation,
        temporaryAddress: data.temporaryAddress,
        plannedDeparture: data.plannedDeparture,
        purpose: data.purpose,
        host: data.host,
      });

      if (data.photo) {
        await mockAPI.createPhoto({
          personId: person.id,
          visitId: visit.id,
          fileName: data.photo.name,
          size: data.photo.size,
          mime: data.photo.type,
          thumbnailData: photoPreview || '',
        });
      }

      return { person, visit };
    },
    onSuccess: () => {
      clearDraft();
      queryClient.invalidateQueries();
      onNavigate('dashboard');
    },
  });

  const handlePhotoReady = (compressed: CompressedImage) => {
    setFormData({
      ...formData,
      photo: new File([compressed.blob], 'photo.jpg', { type: 'image/jpeg' }),
    });
    setPhotoPreview(compressed.dataURL);
    setPhotoSize(compressed.size);
  };

  const updateFormData = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value });
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const isSectionComplete = (sectionId: string): boolean => {
    switch (sectionId) {
      case 'basic':
        return !!(formData.givenName && formData.familyName && formData.dob);
      case 'identity':
        return !!formData.identities[0].idNumber;
      case 'visit':
        return !!(formData.arrivalDateTime && formData.temporaryAddress);
      case 'photo':
        return !!photoPreview;
      default:
        return false;
    }
  };

  const canSubmit = () => {
    return isSectionComplete('basic') && 
           isSectionComplete('identity') && 
           isSectionComplete('visit');
  };

  const sections: FormSection[] = [
    { id: 'basic', title: 'Basic Details', isComplete: isSectionComplete('basic') },
    { id: 'identity', title: 'Identity Documents', isComplete: isSectionComplete('identity') },
    { id: 'visit', title: 'Visit Details', isComplete: isSectionComplete('visit') },
    { id: 'photo', title: 'Photo Upload (Optional)', isComplete: isSectionComplete('photo') },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Dashboard
        </button>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Add New Devotee</h1>
          <div className="flex gap-2 items-center">
            {lastSaved && (
              <span className="text-sm text-gray-500">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <Button variant="secondary" size="sm" onClick={saveDraft}>
              <Save className="w-4 h-4" />
              Save Draft
            </Button>
            {lastSaved && (
              <Button variant="ghost" size="sm" onClick={clearDraft}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {sections.map((section) => (
          <Card key={section.id} className="overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expandedSections.has(section.id) ? (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                )}
                <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
              </div>
              {section.isComplete ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-300" />
              )}
            </button>

            {expandedSections.has(section.id) && (
              <div className="px-6 pb-6 pt-2 border-t">
                {section.id === 'basic' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Given Name *"
                        value={formData.givenName}
                        onChange={(e) => updateFormData('givenName', e.target.value)}
                      />
                      <Input
                        label="Family Name *"
                        value={formData.familyName}
                        onChange={(e) => updateFormData('familyName', e.target.value)}
                      />
                      <Input
                        label="Date of Birth *"
                        type="date"
                        value={formData.dob}
                        onChange={(e) => updateFormData('dob', e.target.value)}
                      />
                      <Select
                        label="Gender"
                        options={GENDER_OPTIONS}
                        value={formData.gender}
                        onChange={(e) => updateFormData('gender', e.target.value)}
                      />
                      <Select
                        label="Nationality"
                        options={NATIONALITIES.map((n) => ({ value: n, label: n }))}
                        value={formData.nationality}
                        onChange={(e) => updateFormData('nationality', e.target.value)}
                      />
                      <Input
                        label="Contact"
                        type="tel"
                        value={formData.contact}
                        onChange={(e) => updateFormData('contact', e.target.value)}
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                      />
                    </div>
                    <Input
                      label="Permanent Address"
                      value={formData.permanentAddress}
                      onChange={(e) => updateFormData('permanentAddress', e.target.value)}
                    />
                  </div>
                )}

                {section.id === 'identity' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Select
                        label="ID Type"
                        options={ID_TYPES}
                        value={formData.identities[0].type}
                        onChange={(e) => {
                          const newIdentities = [...formData.identities];
                          newIdentities[0].type = e.target.value;
                          updateFormData('identities', newIdentities);
                        }}
                      />
                      <Input
                        label="ID Number *"
                        value={formData.identities[0].idNumber}
                        onChange={(e) => {
                          const newIdentities = [...formData.identities];
                          newIdentities[0].idNumber = e.target.value;
                          updateFormData('identities', newIdentities);
                        }}
                      />
                      <Select
                        label="Issuing Country"
                        options={NATIONALITIES.map((n) => ({ value: n, label: n }))}
                        value={formData.identities[0].issuingCountry}
                        onChange={(e) => {
                          const newIdentities = [...formData.identities];
                          newIdentities[0].issuingCountry = e.target.value;
                          updateFormData('identities', newIdentities);
                        }}
                      />
                      <Input
                        label="Expiry Date"
                        type="date"
                        value={formData.identities[0].expiryDate}
                        onChange={(e) => {
                          const newIdentities = [...formData.identities];
                          newIdentities[0].expiryDate = e.target.value;
                          updateFormData('identities', newIdentities);
                        }}
                      />
                    </div>
                  </div>
                )}

                {section.id === 'visit' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Arrival Date & Time *"
                        type="datetime-local"
                        value={formData.arrivalDateTime}
                        onChange={(e) => updateFormData('arrivalDateTime', e.target.value)}
                      />
                      <Select
                        label="Arrival Location"
                        options={LOCATIONS.map((l) => ({ value: l, label: l }))}
                        value={formData.arrivalLocation}
                        onChange={(e) => updateFormData('arrivalLocation', e.target.value)}
                      />
                      <Input
                        label="Temporary Address (Room) *"
                        value={formData.temporaryAddress}
                        onChange={(e) => updateFormData('temporaryAddress', e.target.value)}
                        placeholder="e.g., Room 101, Building A"
                      />
                      <Input
                        label="Planned Departure"
                        type="date"
                        value={formData.plannedDeparture}
                        onChange={(e) => updateFormData('plannedDeparture', e.target.value)}
                      />
                      <Select
                        label="Purpose of Visit"
                        options={PURPOSES.map((p) => ({ value: p, label: p }))}
                        value={formData.purpose}
                        onChange={(e) => updateFormData('purpose', e.target.value)}
                      />
                      <Input
                        label="Host/Contact"
                        value={formData.host}
                        onChange={(e) => updateFormData('host', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {section.id === 'photo' && (
                  <div className="space-y-4">
                    {photoPreview ? (
                      <div className="space-y-4">
                        <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="w-48 h-48 mx-auto object-cover rounded-lg"
                          />
                          <p className="text-sm text-gray-600 text-center mt-2">
                            Size: {(photoSize / 1024).toFixed(2)} KB{' '}
                            {photoSize <= 50 * 1024 ? '✓' : '⚠️ Too large'}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            setPhotoPreview(null);
                            setPhotoSize(0);
                            setFormData({ ...formData, photo: null });
                          }}
                        >
                          Change Photo
                        </Button>
                      </div>
                    ) : (
                      <PhotoUploadEditor onPhotoReady={handlePhotoReady} />
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {canSubmit() ? (
              <span className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                All required fields completed
              </span>
            ) : (
              <span className="flex items-center gap-2 text-orange-600">
                <AlertCircle className="w-4 h-4" />
                Please complete all required sections
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => onNavigate('dashboard')}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate(formData)}
              disabled={!canSubmit() || createMutation.isPending}
            >
              {createMutation.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                'Save Devotee'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
