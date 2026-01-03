import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useToast } from '../../hooks/useToast';
import { 
  ChevronRight, ChevronDown, RefreshCw, Save, Trash2,
  CheckCircle, AlertCircle, Calendar, AlertTriangle, XCircle
} from 'lucide-react';
import { Button, Card, Input, Select, BSDatePicker, Modal, LoadingOverlay } from '../../components/ui';
import { PhotoUploadEditor } from '../../components/features';
import { mockAPI } from '../../services/api';
import { draftService } from '../../utils/localStorage';
import { NATIONALITIES, PURPOSES, LOCATIONS, GENDER_OPTIONS } from '../../config/constants';
import type { CompressedImage, Person, Draft } from '../../types';
import { getCurrentDateTimeLocal } from '../../utils/dateUtils';

const AUTOSAVE_INTERVAL = 15000;

const EXTENDED_ID_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'citizenship', label: 'Citizenship Certificate (Nepali)' },
  { value: 'voterid', label: 'Voter ID' },
  { value: 'driver', label: 'Driver License' },
  { value: 'nid', label: 'National ID (NID)' },
  { value: 'aadhaar', label: 'Aadhaar (India)' },
  { value: 'other', label: 'Other Government ID' },
];

const INITIAL_FORM_STATE = {
  givenName: '', familyName: '', dob: '', gender: 'Male', nationality: 'Nepal',
  addressStreet: '', addressCity: '', addressState: '', addressCountry: 'Nepal',
  contact: '', email: '',
  identities: [{ type: 'passport', idNumber: '', issuingCountry: 'Nepal', expiryDate: '' }],
  visaNumber: '', visaType: '', visaIssueDate: '', visaExpiryDate: '',
  arrivalDateTime: getCurrentDateTimeLocal(), arrivalLocation: LOCATIONS[0],
  temporaryAddress: '', plannedDeparture: '', purpose: PURPOSES[0],
  host: 'Ashram Administration', photo: null as File | null,
};

// Duplicate alert configurations
const DUPLICATE_ALERTS = {
  identity: {
    bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-900',
    icon: XCircle, iconColor: 'text-red-600',
    title: '⛔ Identity Number Already Exists',
    getMessage: (idNumber: string) => `Someone with ID number "${idNumber}" is already registered.`
  },
  nameNationality: {
    bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-900',
    icon: AlertTriangle, iconColor: 'text-orange-600',
    title: '⚠️ Same Name + Nationality Found',
    getMessage: (count: number, name: string, nationality: string) => 
      `${count} person(s) with name "${name}" from ${nationality} already exist(s).`
  },
  nameOnly: {
    bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-900',
    icon: AlertCircle, iconColor: 'text-blue-600',
    title: 'ℹ️ Similar name found (different nationality)',
    getMessage: () => ''
  }
};

export function AddDevoteeEnhanced() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const toast = useToast();
  
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [formData, setFormData] = useState<any>(INITIAL_FORM_STATE);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoSize, setPhotoSize] = useState(0);
  const [lastAutosaved, setLastAutosaved] = useState<Date | null>(null);
  const [showBSPickerDOB, setShowBSPickerDOB] = useState(false);
  const [showBSPickerExpiry, setShowBSPickerExpiry] = useState(false);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState<{
    nameMatches: Person[]; nameNationalityMatches: Person[]; identityMatches: Person[];
  }>({ nameMatches: [], nameNationalityMatches: [], identityMatches: [] });
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasShownRestoreToast = useRef(false);

  const { data: allPersons } = useQuery({
    queryKey: ['allPersons'],
    queryFn: async () => {
      const visits = await mockAPI.getAllVisits();
      return visits.map(v => v.person).filter(Boolean) as Person[];
    },
    staleTime: 30000,
  });

  const calculatedAge = useMemo(() => {
    if (!formData.dob) return null;
    const birthDate = new Date(formData.dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  }, [formData.dob]);

  const ageError = calculatedAge !== null && (calculatedAge < 0 || calculatedAge > 150);
  const isNepali = formData.nationality === 'Nepal';

  const duplicateChecks = useMemo(() => {
    if (!allPersons || !formData.givenName || !formData.familyName) {
      return { nameMatches: [], nameNationalityMatches: [], identityMatches: [] };
    }

    const givenNameLower = formData.givenName.toLowerCase().trim();
    const familyNameLower = formData.familyName.toLowerCase().trim();
    const idNumber = formData.identities?.[0]?.idNumber?.toLowerCase().trim();

    return {
      nameMatches: allPersons.filter(p => 
        p.givenName.toLowerCase().trim() === givenNameLower &&
        p.familyName.toLowerCase().trim() === familyNameLower &&
        p.nationality !== formData.nationality
      ),
      nameNationalityMatches: allPersons.filter(p =>
        p.givenName.toLowerCase().trim() === givenNameLower &&
        p.familyName.toLowerCase().trim() === familyNameLower &&
        p.nationality === formData.nationality
      ),
      identityMatches: idNumber ? allPersons.filter(p =>
        p.identities?.some(id => id.idNumber.toLowerCase().trim() === idNumber)
      ) : []
    };
  }, [allPersons, formData.givenName, formData.familyName, formData.nationality, formData.identities]);

  // Load draft or autosave on mount
  useEffect(() => {
    if (hasShownRestoreToast.current) return;
    hasShownRestoreToast.current = true;
    
    const draftId = (location.state as any)?.draftId;
    if (draftId) {
      const draft = draftService.getDraft(draftId);
      if (draft) {
        setCurrentDraftId(draft.id);
        setFormData({ ...INITIAL_FORM_STATE, ...draft, photo: null });
        if (draft.photoPreview) {
          setPhotoPreview(draft.photoPreview);
          setPhotoSize(draft.photoSize || 0);
        }
        toast.info('Draft Loaded', `Loaded draft for ${draft.givenName || 'unnamed person'}`);
        return;
      }
    }
    
    const autosave = draftService.getAutosave();
    if (autosave) {
      setFormData(autosave.formData);
      if (autosave.photoPreview) {
        setPhotoPreview(autosave.photoPreview);
        setPhotoSize(autosave.photoSize || 0);
      }
      setLastAutosaved(new Date(autosave.savedAt));
      toast.info('Autosave Restored', 'Your previous work has been restored');
    }
  }, []);

  // Auto-save timer
  useEffect(() => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      draftService.saveAutosave(formData, photoPreview || undefined, photoSize);
      setLastAutosaved(new Date());
    }, AUTOSAVE_INTERVAL);
    return () => { if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current); };
  }, [formData, photoPreview, photoSize]);
  
  // Save on unmount
  useEffect(() => {
    return () => {
      if (formData.givenName || formData.familyName || formData.contact) {
        draftService.saveAutosave(formData, photoPreview || undefined, photoSize);
      }
    };
  }, [formData, photoPreview, photoSize]);

  // Auto-set visa for Nepali
  useEffect(() => {
    if (isNepali && !formData.visaNumber) {
      setFormData((prev: any) => ({
        ...prev, visaNumber: '0', visaType: 'N/A',
        visaIssueDate: '2025-01-01', visaExpiryDate: '2125-01-01',
      }));
    }
  }, [isNepali]);

  const handleIdExpiryBlur = () => {
    if (!formData.identities[0].expiryDate) {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 100);
      updateIdentity('expiryDate', futureDate.toISOString().split('T')[0]);
    }
  };

  const handleSaveToDraft = useCallback(async () => {
    setIsSavingDraft(true);
    try {
      const draftData: Partial<Draft> = {
        ...(currentDraftId ? { id: currentDraftId } : {}),
        ...formData, photoPreview: photoPreview || undefined,
        photoSize, status: 'incomplete',
      };
      const savedDraft = draftService.saveDraft(draftData);
      setCurrentDraftId(savedDraft.id);
      toast.success('Saved to Drafts', `Draft saved for ${formData.givenName || 'unnamed person'}`);
    } catch (error) {
      toast.error('Failed to Save Draft', 'Please try again');
    } finally {
      setIsSavingDraft(false);
    }
  }, [formData, photoPreview, photoSize, currentDraftId, toast]);
  
  const clearAutosave = useCallback(() => {
    draftService.clearAutosave();
    setLastAutosaved(null);
  }, []);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const permanentAddress = [
        data.addressStreet, data.addressCity, data.addressState, data.addressCountry
      ].filter(Boolean).join(', ');

      const person = await mockAPI.createPerson({
        givenName: data.givenName, familyName: data.familyName, dob: data.dob,
        gender: data.gender, nationality: data.nationality, permanentAddress,
        contact: data.contact, email: data.email, identities: data.identities,
      });

      const visit = await mockAPI.createVisit({
        personId: person.id, arrivalDateTime: data.arrivalDateTime,
        arrivalLocation: data.arrivalLocation, temporaryAddress: data.temporaryAddress,
        plannedDeparture: data.plannedDeparture, purpose: data.purpose, host: data.host,
      });

      if (data.photo) {
        await mockAPI.createPhoto({
          personId: person.id, visitId: visit.id, fileName: data.photo.name,
          size: data.photo.size, mime: data.photo.type, thumbnailData: photoPreview || '',
        });
      }
      return { person, visit };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      clearAutosave();
      if (currentDraftId) draftService.deleteDraft(currentDraftId);
      toast.success('Devotee Added Successfully', `${data.person.givenName} ${data.person.familyName} has been registered`);
      navigate('/');
    },
    onError: (error: any) => {
      toast.error('Failed to Save', error.message || 'An error occurred while saving. Please try again.');
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

  const updateFormData = (key: string, value: any) => setFormData({ ...formData, [key]: value });
  const updateIdentity = (key: string, value: any) => {
    const newIdentities = [...formData.identities];
    newIdentities[0] = { ...newIdentities[0], [key]: value };
    setFormData({ ...formData, identities: newIdentities });
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    newExpanded.has(sectionId) ? newExpanded.delete(sectionId) : newExpanded.add(sectionId);
    setExpandedSections(newExpanded);
  };

  const sections = [
    { id: 'basic', title: 'Basic Details', 
      isComplete: !!(formData.givenName && formData.familyName && formData.dob && !ageError) },
    { id: 'address', title: 'Permanent Address', 
      isComplete: !!(formData.addressStreet && formData.addressCity && formData.addressCountry) },
    { id: 'contact', title: 'Contact Information', isComplete: !!formData.contact },
    { id: 'identity', title: 'Identity Document', 
      isComplete: !!(formData.identities[0].idNumber && formData.identities[0].expiryDate) },
    { id: 'visa', title: 'Visa Details', 
      isComplete: isNepali || !!(formData.visaNumber && formData.visaExpiryDate) },
    { id: 'visit', title: 'Visit Details', 
      isComplete: !!(formData.arrivalDateTime && formData.temporaryAddress) },
    { id: 'photo', title: 'Photo (Optional)', isComplete: !!photoPreview },
  ];

  const canSubmit = sections.filter(s => s.id !== 'photo').every(s => s.isComplete);

  const handleSubmit = () => {
    if (!canSubmit) return;

    const { identityMatches, nameNationalityMatches, nameMatches } = duplicateChecks;

    if (identityMatches.length > 0) {
      setDuplicateMatches(duplicateChecks);
      setShowDuplicateWarning(true);
      toast.error('Identity Number Exists', 'This ID number is already registered in the system');
      return;
    }

    if (nameNationalityMatches.length > 0 && !confirmSubmit) {
      setDuplicateMatches(duplicateChecks);
      setShowDuplicateWarning(true);
      toast.warning('Duplicate Detected', 'Same name and nationality found. Please verify.');
      return;
    }

    if (nameMatches.length > 0 && !nameNationalityMatches.length && !confirmSubmit) {
      setDuplicateMatches(duplicateChecks);
      setShowDuplicateWarning(true);
      toast.info('Similar Name Found', 'Someone with a similar name (different nationality) exists');
      return;
    }

    createMutation.mutate(formData);
  };

  const handleConfirmSubmit = () => {
    setConfirmSubmit(true);
    setShowDuplicateWarning(false);
    setTimeout(() => createMutation.mutate(formData), 100);
  };

  const renderSectionHeader = (section: typeof sections[0]) => (
    <button
      onClick={() => toggleSection(section.id)}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        {section.isComplete ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <AlertCircle className="w-5 h-5 text-gray-400" />
        )}
        <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
      </div>
      {expandedSections.has(section.id) ? 
        <ChevronDown className="w-5 h-5 text-gray-600" /> : 
        <ChevronRight className="w-5 h-5 text-gray-600" />
      }
    </button>
  );

  const renderDuplicateAlert = (type: keyof typeof DUPLICATE_ALERTS, matches: Person[]) => {
    const config = DUPLICATE_ALERTS[type];
    const Icon = config.icon;
    const message = type === 'identity' 
      ? config.getMessage(formData.identities[0]?.idNumber)
      : type === 'nameNationality'
      ? config.getMessage(matches.length, `${formData.givenName} ${formData.familyName}`, formData.nationality)
      : config.getMessage();

    return (
      <div className={`p-4 ${config.bg} border-2 ${config.border} rounded-lg`}>
        <div className="flex items-start gap-2">
          <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
          <div>
            <p className={`text-sm font-bold ${config.text}`}>{config.title}</p>
            {message && <p className={`text-xs ${config.text} mt-1`}>{message}</p>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Dashboard
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Devotee</h1>
            <p className="text-gray-600 mt-2">Fill in any order. All sections auto-save.</p>
          </div>
          {lastAutosaved && (
            <div className="text-sm text-gray-500">
              Auto-saved: {lastAutosaved.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              Progress: {sections.filter(s => s.isComplete).length} / {sections.length} sections
            </span>
            <div className="flex gap-2">
              {sections.map(s => (
                <div key={s.id} className={`w-3 h-3 rounded-full ${s.isComplete ? 'bg-green-500' : 'bg-gray-300'}`} title={s.title} />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleSaveToDraft} disabled={isSavingDraft}>
              {isSavingDraft ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save to Draft
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowDraftsModal(true)}>
              Pull from Draft
            </Button>
            <Button variant="ghost" size="sm" onClick={() => {
              if (confirm('Clear all data and start fresh?')) {
                setFormData(INITIAL_FORM_STATE);
                setPhotoPreview(null);
                clearAutosave();
                setCurrentDraftId(null);
              }
            }}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      </Card>

      {/* Section 1: Basic Details */}
      <Card className="mb-4">
        {renderSectionHeader(sections[0])}
        {expandedSections.has('basic') && (
          <div className="p-4 border-t space-y-4">
            {duplicateChecks.identityMatches.length > 0 && renderDuplicateAlert('identity', duplicateChecks.identityMatches)}
            {duplicateChecks.identityMatches.length === 0 && duplicateChecks.nameNationalityMatches.length > 0 && 
              renderDuplicateAlert('nameNationality', duplicateChecks.nameNationalityMatches)}
            {duplicateChecks.identityMatches.length === 0 && duplicateChecks.nameNationalityMatches.length === 0 && 
              duplicateChecks.nameMatches.length > 0 && renderDuplicateAlert('nameOnly', duplicateChecks.nameMatches)}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Given Name *" value={formData.givenName} 
                onChange={(e) => updateFormData('givenName', e.target.value)} placeholder="First name" />
              <Input label="Family Name *" value={formData.familyName} 
                onChange={(e) => updateFormData('familyName', e.target.value)} placeholder="Last name" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input label="Date of Birth *" type="date" value={formData.dob} 
                      onChange={(e) => updateFormData('dob', e.target.value)} />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" variant="secondary" size="sm" 
                      onClick={() => setShowBSPickerDOB(true)} title="Enter BS date">BS</Button>
                  </div>
                </div>
                {calculatedAge !== null && (
                  <div className={`mt-1 text-sm flex items-center gap-2 ${ageError ? 'text-red-600' : 'text-green-600'}`}>
                    <Calendar className="w-4 h-4" />
                    Age: {calculatedAge} years{ageError && ' (Invalid age!)'}
                  </div>
                )}
              </div>
              <Select label="Gender *" options={GENDER_OPTIONS} value={formData.gender} 
                onChange={(e) => updateFormData('gender', e.target.value)} />
              <Select label="Nationality *" options={NATIONALITIES.map(n => ({ value: n, label: n }))} 
                value={formData.nationality} onChange={(e) => updateFormData('nationality', e.target.value)} />
            </div>
          </div>
        )}
      </Card>

      {/* Section 2: Permanent Address */}
      <Card className="mb-4">
        {renderSectionHeader(sections[1])}
        {expandedSections.has('address') && (
          <div className="p-4 border-t space-y-4">
            <Input label="Street / Place Address *" value={formData.addressStreet} 
              onChange={(e) => updateFormData('addressStreet', e.target.value)} 
              placeholder="House no., street name, locality" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="City / District *" value={formData.addressCity} 
                onChange={(e) => updateFormData('addressCity', e.target.value)} placeholder="City or district" />
              <Input label="State / Province" value={formData.addressState} 
                onChange={(e) => updateFormData('addressState', e.target.value)} placeholder="Optional" />
              <Select label="Country *" options={NATIONALITIES.map(n => ({ value: n, label: n }))} 
                value={formData.addressCountry} onChange={(e) => updateFormData('addressCountry', e.target.value)} />
            </div>
          </div>
        )}
      </Card>

      {/* Section 3: Contact */}
      <Card className="mb-4">
        {renderSectionHeader(sections[2])}
        {expandedSections.has('contact') && (
          <div className="p-4 border-t space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Contact Number *" value={formData.contact} 
                onChange={(e) => updateFormData('contact', e.target.value)} placeholder="+977 9812345678" />
              <Input label="Email Address" type="email" value={formData.email} 
                onChange={(e) => updateFormData('email', e.target.value)} placeholder="optional@example.com" />
            </div>
          </div>
        )}
      </Card>

      {/* Section 4: Identity Document */}
      <Card className="mb-4">
        {renderSectionHeader(sections[3])}
        {expandedSections.has('identity') && (
          <div className="p-4 border-t space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="ID Type *" options={EXTENDED_ID_TYPES} value={formData.identities[0].type} 
                onChange={(e) => updateIdentity('type', e.target.value)} />
              <Input label="ID Number *" value={formData.identities[0].idNumber} 
                onChange={(e) => updateIdentity('idNumber', e.target.value)} placeholder="Enter ID number" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="Issuing Country *" options={NATIONALITIES.map(n => ({ value: n, label: n }))} 
                value={formData.identities[0].issuingCountry} 
                onChange={(e) => updateIdentity('issuingCountry', e.target.value)} />
              <div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input label="Expiry Date *" type="date" value={formData.identities[0].expiryDate} 
                      onChange={(e) => updateIdentity('expiryDate', e.target.value)} onBlur={handleIdExpiryBlur} />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" variant="secondary" size="sm" 
                      onClick={() => setShowBSPickerExpiry(true)} title="Enter BS date">BS</Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Leave empty to auto-set +100 years</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Section 5: Visa Details */}
      <Card className="mb-4">
        {renderSectionHeader(sections[4])}
        {expandedSections.has('visa') && (
          <div className="p-4 border-t space-y-4">
            {isNepali ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">✓ Nepali citizen - Visa details auto-filled (N/A)</p>
                <p className="text-sm text-green-700 mt-1">
                  Visa: {formData.visaNumber} | Valid: {formData.visaIssueDate} to {formData.visaExpiryDate}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Visa Number *" value={formData.visaNumber} 
                    onChange={(e) => updateFormData('visaNumber', e.target.value)} placeholder="Visa number" />
                  <Input label="Visa Type *" value={formData.visaType} 
                    onChange={(e) => updateFormData('visaType', e.target.value)} placeholder="Tourist, Business, etc." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Issue Date *" type="date" value={formData.visaIssueDate} 
                    onChange={(e) => updateFormData('visaIssueDate', e.target.value)} />
                  <Input label="Expiry Date *" type="date" value={formData.visaExpiryDate} 
                    onChange={(e) => updateFormData('visaExpiryDate', e.target.value)} />
                </div>
              </>
            )}
          </div>
        )}
      </Card>

      {/* Section 6: Visit Details */}
      <Card className="mb-4">
        {renderSectionHeader(sections[5])}
        {expandedSections.has('visit') && (
          <div className="p-4 border-t space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Arrival Date & Time *" type="datetime-local" value={formData.arrivalDateTime} 
                onChange={(e) => updateFormData('arrivalDateTime', e.target.value)} />
              <Select label="Arrival Location *" options={LOCATIONS.map(l => ({ value: l, label: l }))} 
                value={formData.arrivalLocation} onChange={(e) => updateFormData('arrivalLocation', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Room / Temporary Address *" value={formData.temporaryAddress} 
                onChange={(e) => updateFormData('temporaryAddress', e.target.value)} placeholder="Room 101, Building A" />
              <Input label="Planned Departure" type="date" value={formData.plannedDeparture} 
                onChange={(e) => updateFormData('plannedDeparture', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="Purpose of Visit *" options={PURPOSES.map(p => ({ value: p, label: p }))} 
                value={formData.purpose} onChange={(e) => updateFormData('purpose', e.target.value)} />
              <Input label="Host / Contact Person" value={formData.host} 
                onChange={(e) => updateFormData('host', e.target.value)} />
            </div>
          </div>
        )}
      </Card>

      {/* Section 7: Photo */}
      <Card className="mb-6">
        {renderSectionHeader(sections[6])}
        {expandedSections.has('photo') && (
          <div className="p-4 border-t">
            <PhotoUploadEditor onPhotoReady={handlePhotoReady} />
            {photoPreview && (
              <div className="mt-4 flex items-center gap-4">
                <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-lg object-cover" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Photo uploaded</p>
                  <p className="text-xs text-gray-500">Size: {(photoSize / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Submit Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Ready to Submit?</h3>
            <p className="text-sm text-gray-600 mt-1">
              {canSubmit ? 'All required fields are complete!' : 'Please complete all required sections marked with *'}
            </p>
          </div>
          <Button onClick={handleSubmit} disabled={!canSubmit || createMutation.isPending} size="lg">
            {createMutation.isPending ? (
              <><RefreshCw className="w-5 h-5 mr-2 animate-spin" />Submitting...</>
            ) : 'Submit Entry'}
          </Button>
        </div>
      </Card>

      {/* BS Date Pickers */}
      <BSDatePicker isOpen={showBSPickerDOB} onClose={() => setShowBSPickerDOB(false)} 
        onDateSelect={(adDate) => updateFormData('dob', adDate)} title="Enter Date of Birth (BS)" 
        initialADDate={formData.dob} />
      <BSDatePicker isOpen={showBSPickerExpiry} onClose={() => setShowBSPickerExpiry(false)} 
        onDateSelect={(adDate) => updateIdentity('expiryDate', adDate)} title="Enter ID Expiry Date (BS)" 
        initialADDate={formData.identities[0].expiryDate} />

      {/* Duplicate Warning Modal */}
      <Modal isOpen={showDuplicateWarning} onClose={() => setShowDuplicateWarning(false)} 
        title="⚠️ Potential Duplicate Detected">
        <div className="p-6">
          <DuplicateWarningContent 
            duplicateMatches={duplicateMatches}
            formData={formData}
            onConfirm={handleConfirmSubmit}
            onCancel={() => setShowDuplicateWarning(false)}
          />
        </div>
      </Modal>

      {/* Pull from Draft Modal */}
      <Modal isOpen={showDraftsModal} onClose={() => setShowDraftsModal(false)} title="📋 Pull from Drafts">
        <div className="p-6">
          <PullFromDraftContent
            onSelectDraft={(draft) => {
              navigate('/add-devotee', { state: { draftId: draft.id } });
              window.location.reload();
            }}
            onClose={() => setShowDraftsModal(false)}
          />
        </div>
      </Modal>

      <LoadingOverlay isLoading={createMutation.isPending} message="Saving devotee..." />
    </div>
  );
}

// Duplicate Warning Content Component
function DuplicateWarningContent({ duplicateMatches, formData, onConfirm, onCancel }: any) {
  const renderPersonCard = (person: Person, borderColor: string) => (
    <div key={person.id} className={`p-4 bg-gray-50 border ${borderColor} rounded-lg`}>
      <p className="font-semibold text-gray-900">{person.givenName} {person.familyName}</p>
      <p className="text-sm text-gray-600">Nationality: {person.nationality}</p>
      <p className="text-sm text-gray-600">DOB: {person.dob}</p>
      {person.contact && <p className="text-sm text-gray-600">Contact: {person.contact}</p>}
      {person.identities?.[0] && (
        <p className="text-sm text-gray-600">ID: {person.identities[0].type} - {person.identities[0].idNumber}</p>
      )}
    </div>
  );

  if (duplicateMatches.identityMatches.length > 0) {
    return (
      <>
        <div className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-500 rounded-lg mb-4">
          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-bold text-red-900">Cannot Add - Identity Number Already Exists</h3>
            <p className="text-sm text-red-800 mt-1">
              <strong>SUPER STRICT CHECK:</strong> Someone with the same identity document number is already in the system.
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-900">Existing person(s) with same ID number:</p>
          {duplicateMatches.identityMatches.map((p: Person) => renderPersonCard(p, 'border-red-300'))}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={onCancel} variant="secondary">Go Back and Check</Button>
        </div>
      </>
    );
  }

  if (duplicateMatches.nameNationalityMatches.length > 0) {
    return (
      <>
        <div className="flex items-start gap-3 p-4 bg-orange-50 border-2 border-orange-500 rounded-lg mb-4">
          <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-bold text-orange-900">Warning: Same Name & Nationality</h3>
            <p className="text-sm text-orange-800 mt-1">
              <strong>STRICT CHECK:</strong> Someone with the exact same name AND nationality exists.
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-900">Existing person(s):</p>
          {duplicateMatches.nameNationalityMatches.map((p: Person) => renderPersonCard(p, 'border-orange-300'))}
        </div>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
          <p className="text-sm text-yellow-900 font-medium">⚠️ Please verify this is a different person before proceeding.</p>
          <p className="text-xs text-yellow-800 mt-1">Check the identity document number, date of birth, and contact information.</p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={onCancel} variant="secondary">Cancel - Review Details</Button>
          <Button onClick={onConfirm} variant="primary">Confirm - Add Anyway</Button>
        </div>
      </>
    );
  }

  if (duplicateMatches.nameMatches.length > 0) {
    return (
      <>
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-300 rounded-lg mb-4">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-bold text-blue-900">Notice: Similar Name Found</h3>
            <p className="text-sm text-blue-800 mt-1">Someone with a similar name (but different nationality) exists.</p>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-900">Existing person(s):</p>
          {duplicateMatches.nameMatches.map((p: Person) => renderPersonCard(p, 'border-blue-200'))}
        </div>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">ℹ️ This is likely a different person since the nationality is different.</p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={onCancel} variant="secondary">Cancel</Button>
          <Button onClick={onConfirm} variant="primary">Continue Adding</Button>
        </div>
      </>
    );
  }
  return null;
}

// Pull from Draft Modal Content Component
function PullFromDraftContent({ onSelectDraft, onClose }: { 
  onSelectDraft: (draft: Draft) => void; 
  onClose: () => void;
}) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const toast = useToast();

  useEffect(() => { setDrafts(draftService.getDrafts()); }, []);

  const handleDelete = (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this draft?')) {
      draftService.deleteDraft(draftId);
      setDrafts(draftService.getDrafts());
      toast.success('Draft Deleted', 'Draft has been removed');
    }
  };

  if (drafts.length === 0) {
    return (
      <div className="text-center py-8">
        <Save className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Drafts Available</h3>
        <p className="text-gray-500 mb-6">Save drafts using the "Save to Draft" button to access them here.</p>
        <Button onClick={onClose} variant="secondary">Close</Button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        Select a draft to load into the form. Your current progress will be replaced.
      </p>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {drafts.map((draft) => (
          <div key={draft.id} 
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
            onClick={() => onSelectDraft(draft)}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {draft.givenName || 'Unnamed'} {draft.familyName || ''}
                  {!draft.givenName && !draft.familyName && '(Empty Draft)'}
                </h3>
                <div className="mt-2 space-y-1">
                  {draft.nationality && <p className="text-sm text-gray-600"><span className="font-medium">Nationality:</span> {draft.nationality}</p>}
                  {draft.contact && <p className="text-sm text-gray-600"><span className="font-medium">Contact:</span> {draft.contact}</p>}
                  {draft.identities?.[0]?.idNumber && (
                    <p className="text-sm text-gray-600"><span className="font-medium">ID:</span> {draft.identities[0].type} - {draft.identities[0].idNumber}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">Saved: {new Date(draft.savedAt).toLocaleString()}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    draft.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {draft.status === 'pending_approval' ? 'Pending Approval' : 'Incomplete'}
                  </span>
                </div>
              </div>
              <button onClick={(e) => handleDelete(draft.id, e)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                title="Delete draft">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}