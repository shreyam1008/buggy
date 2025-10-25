import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { 
  ChevronRight, 
  ChevronDown, 
  RefreshCw, 
  Save, 
  Trash2,
  CheckCircle,
  AlertCircle,
  Calendar,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { Button, Card, Input, Select, BSDatePicker, Modal } from '../../components/ui';
import { PhotoUploadEditor } from '../../components/features';
import { mockAPI } from '../../services/api';
import { NATIONALITIES, PURPOSES, LOCATIONS, GENDER_OPTIONS } from '../../config/constants';
import type { CompressedImage, Person } from '../../types';

const DRAFT_KEY = 'devotee_form_draft';

// Extended ID types
const EXTENDED_ID_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'citizenship', label: 'Citizenship Certificate (Nepali)' },
  { value: 'voterid', label: 'Voter ID' },
  { value: 'driver', label: 'Driver License' },
  { value: 'nid', label: 'National ID (NID)' },
  { value: 'aadhaar', label: 'Aadhaar (India)' },
  { value: 'other', label: 'Other Government ID' },
];

export function AddDevoteeEnhanced() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));
  const [formData, setFormData] = useState<any>({
    // Basic Details
    givenName: '',
    familyName: '',
    dob: '',
    gender: 'Male',
    nationality: 'Nepal',
    
    // Permanent Address (detailed)
    addressStreet: '',
    addressCity: '',
    addressState: '',
    addressCountry: 'Nepal',
    
    // Contact
    contact: '',
    email: '',
    
    // Identity Document
    identities: [{
      type: 'passport',
      idNumber: '',
      issuingCountry: 'Nepal',
      expiryDate: '',
    }],
    
    // Visa Details (for non-Nepali)
    visaNumber: '',
    visaType: '',
    visaIssueDate: '',
    visaExpiryDate: '',
    
    // Visit Details
    arrivalDateTime: new Date().toISOString().slice(0, 16),
    arrivalLocation: LOCATIONS[0],
    temporaryAddress: '',
    plannedDeparture: '',
    purpose: PURPOSES[0],
    host: 'Ashram Administration',
    
    // Photo
    photo: null as File | null,
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoSize, setPhotoSize] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showBSPickerDOB, setShowBSPickerDOB] = useState(false);
  const [showBSPickerExpiry, setShowBSPickerExpiry] = useState(false);

  // Duplicate detection state
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState<{
    nameMatches: Person[];
    nameNationalityMatches: Person[];
    identityMatches: Person[];
  }>({ nameMatches: [], nameNationalityMatches: [], identityMatches: [] });
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  // Fetch all persons for duplicate checking
  const { data: allPersons } = useQuery({
    queryKey: ['allPersons'],
    queryFn: async () => {
      const visits = await mockAPI.getAllVisits();
      return visits.map(v => v.person).filter(Boolean) as Person[];
    },
  });

  // Calculate age from DOB
  const calculatedAge = useMemo(() => {
    if (!formData.dob) return null;
    const birthDate = new Date(formData.dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }, [formData.dob]);

  // Age validation
  const ageError = calculatedAge !== null && (calculatedAge < 0 || calculatedAge > 150);

  // Check if Nepali
  const isNepali = formData.nationality === 'Nepal';

  // Duplicate detection logic
  const duplicateChecks = useMemo(() => {
    if (!allPersons || !formData.givenName || !formData.familyName) {
      return { nameMatches: [], nameNationalityMatches: [], identityMatches: [] };
    }

    const givenNameLower = formData.givenName.toLowerCase().trim();
    const familyNameLower = formData.familyName.toLowerCase().trim();
    const idNumber = formData.identities[0]?.idNumber?.toLowerCase().trim();

    // Check for same name
    const nameMatches = allPersons.filter(p => 
      p.givenName.toLowerCase().trim() === givenNameLower &&
      p.familyName.toLowerCase().trim() === familyNameLower
    );

    // Check for same name + same nationality (stricter)
    const nameNationalityMatches = nameMatches.filter(p => 
      p.nationality === formData.nationality
    );

    // Check for same identity number (super strict)
    const identityMatches = idNumber ? allPersons.filter(p =>
      p.identities?.some(id => id.idNumber.toLowerCase().trim() === idNumber)
    ) : [];

    return { nameMatches, nameNationalityMatches, identityMatches };
  }, [allPersons, formData.givenName, formData.familyName, formData.nationality, formData.identities]);

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

  // Auto-set visa defaults for Nepali
  useEffect(() => {
    if (isNepali && !formData.visaNumber) {
      setFormData((prev: any) => ({
        ...prev,
        visaNumber: '0',
        visaType: 'N/A',
        visaIssueDate: '2025-01-01',
        visaExpiryDate: '2125-01-01',
      }));
    }
  }, [isNepali]);

  // Auto-set ID expiry to +100 years if empty
  const handleIdExpiryBlur = () => {
    if (!formData.identities[0].expiryDate) {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 100);
      updateIdentity('expiryDate', futureDate.toISOString().split('T')[0]);
    }
  };

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
      // Build permanent address
      const permanentAddress = [
        data.addressStreet,
        data.addressCity,
        data.addressState,
        data.addressCountry
      ].filter(Boolean).join(', ');

      const person = await mockAPI.createPerson({
        givenName: data.givenName,
        familyName: data.familyName,
        dob: data.dob,
        gender: data.gender,
        nationality: data.nationality,
        permanentAddress,
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
      queryClient.invalidateQueries();
      clearDraft();
      navigate('/');
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

  const updateIdentity = (key: string, value: any) => {
    const newIdentities = [...formData.identities];
    newIdentities[0] = { ...newIdentities[0], [key]: value };
    setFormData({ ...formData, identities: newIdentities });
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

  // Section completion checks
  const sections = [
    {
      id: 'basic',
      title: 'Basic Details',
      isComplete: !!(formData.givenName && formData.familyName && formData.dob && !ageError),
    },
    {
      id: 'address',
      title: 'Permanent Address',
      isComplete: !!(formData.addressStreet && formData.addressCity && formData.addressCountry),
    },
    {
      id: 'contact',
      title: 'Contact Information',
      isComplete: !!(formData.contact),
    },
    {
      id: 'identity',
      title: 'Identity Document',
      isComplete: !!(formData.identities[0].idNumber && formData.identities[0].expiryDate),
    },
    {
      id: 'visa',
      title: 'Visa Details',
      isComplete: isNepali || !!(formData.visaNumber && formData.visaExpiryDate),
    },
    {
      id: 'visit',
      title: 'Visit Details',
      isComplete: !!(formData.arrivalDateTime && formData.temporaryAddress),
    },
    {
      id: 'photo',
      title: 'Photo (Optional)',
      isComplete: !!photoPreview,
    },
  ];

  const canSubmit = sections.filter(s => s.id !== 'photo').every(s => s.isComplete);

  const handleSubmit = () => {
    if (!canSubmit) return;

    // Check for duplicates
    const hasNameMatches = duplicateChecks.nameMatches.length > 0;
    const hasNameNationalityMatches = duplicateChecks.nameNationalityMatches.length > 0;
    const hasIdentityMatches = duplicateChecks.identityMatches.length > 0;

    // If there are identity matches (super strict), block submission completely
    if (hasIdentityMatches) {
      setDuplicateMatches(duplicateChecks);
      setShowDuplicateWarning(true);
      return;
    }

    // If there are name+nationality matches, show warning and require confirmation
    if (hasNameNationalityMatches && !confirmSubmit) {
      setDuplicateMatches(duplicateChecks);
      setShowDuplicateWarning(true);
      return;
    }

    // If only name matches (different nationality), show gentle warning but allow
    if (hasNameMatches && !hasNameNationalityMatches && !confirmSubmit) {
      setDuplicateMatches(duplicateChecks);
      setShowDuplicateWarning(true);
      return;
    }

    // Proceed with submission
    createMutation.mutate(formData);
  };

  const handleConfirmSubmit = () => {
    setConfirmSubmit(true);
    setShowDuplicateWarning(false);
    // Re-trigger submit with confirmation flag
    setTimeout(() => {
      createMutation.mutate(formData);
    }, 100);
  };

  const handleCancelSubmit = () => {
    setShowDuplicateWarning(false);
    setConfirmSubmit(false);
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
      {expandedSections.has(section.id) ? (
        <ChevronDown className="w-5 h-5 text-gray-600" />
      ) : (
        <ChevronRight className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Dashboard
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Devotee</h1>
            <p className="text-gray-600 mt-2">Fill in any order. All sections auto-save.</p>
          </div>
          {lastSaved && (
            <div className="text-sm text-gray-500">
              Last saved: {lastSaved.toLocaleTimeString()}
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
                <div
                  key={s.id}
                  className={`w-3 h-3 rounded-full ${
                    s.isComplete ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                  title={s.title}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={saveDraft}>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm('Clear all data and start fresh?')) {
                  setFormData({
                    givenName: '',
                    familyName: '',
                    dob: '',
                    gender: 'Male',
                    nationality: 'Nepal',
                    addressStreet: '',
                    addressCity: '',
                    addressState: '',
                    addressCountry: 'Nepal',
                    contact: '',
                    email: '',
                    identities: [{ type: 'passport', idNumber: '', issuingCountry: 'Nepal', expiryDate: '' }],
                    visaNumber: '',
                    visaType: '',
                    visaIssueDate: '',
                    visaExpiryDate: '',
                    arrivalDateTime: new Date().toISOString().slice(0, 16),
                    arrivalLocation: LOCATIONS[0],
                    temporaryAddress: '',
                    plannedDeparture: '',
                    purpose: PURPOSES[0],
                    host: 'Ashram Administration',
                    photo: null,
                  });
                  setPhotoPreview(null);
                  clearDraft();
                }
              }}
            >
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
            {/* Inline Duplicate Warnings */}
            {duplicateChecks.identityMatches.length > 0 && (
              <div className="p-4 bg-red-50 border-2 border-red-500 rounded-lg">
                <div className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-900">
                      ⛔ Identity Number Already Exists
                    </p>
                    <p className="text-xs text-red-800 mt-1">
                      Someone with ID number "{formData.identities[0]?.idNumber}" is already registered.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {duplicateChecks.identityMatches.length === 0 && duplicateChecks.nameNationalityMatches.length > 0 && (
              <div className="p-4 bg-orange-50 border-2 border-orange-400 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-orange-900">
                      ⚠️ Same Name + Nationality Found
                    </p>
                    <p className="text-xs text-orange-800 mt-1">
                      {duplicateChecks.nameNationalityMatches.length} person(s) with name "{formData.givenName} {formData.familyName}" from {formData.nationality} already exist(s).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {duplicateChecks.identityMatches.length === 0 && 
             duplicateChecks.nameNationalityMatches.length === 0 && 
             duplicateChecks.nameMatches.length > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-300 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-blue-900">
                      ℹ️ Similar name found (different nationality)
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Given Name *"
                value={formData.givenName}
                onChange={(e) => updateFormData('givenName', e.target.value)}
                placeholder="First name"
              />
              <Input
                label="Family Name *"
                value={formData.familyName}
                onChange={(e) => updateFormData('familyName', e.target.value)}
                placeholder="Last name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      label="Date of Birth *"
                      type="date"
                      value={formData.dob}
                      onChange={(e) => updateFormData('dob', e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowBSPickerDOB(true)}
                      title="Enter BS date"
                    >
                      BS
                    </Button>
                  </div>
                </div>
                {calculatedAge !== null && (
                  <div className={`mt-1 text-sm flex items-center gap-2 ${ageError ? 'text-red-600' : 'text-green-600'}`}>
                    <Calendar className="w-4 h-4" />
                    Age: {calculatedAge} years
                    {ageError && ' (Invalid age!)'}
                  </div>
                )}
              </div>
              <Select
                label="Gender *"
                options={GENDER_OPTIONS}
                value={formData.gender}
                onChange={(e) => updateFormData('gender', e.target.value)}
              />
              <Select
                label="Nationality *"
                options={NATIONALITIES.map(n => ({ value: n, label: n }))}
                value={formData.nationality}
                onChange={(e) => updateFormData('nationality', e.target.value)}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Section 2: Permanent Address */}
      <Card className="mb-4">
        {renderSectionHeader(sections[1])}
        {expandedSections.has('address') && (
          <div className="p-4 border-t space-y-4">
            <Input
              label="Street / Place Address *"
              value={formData.addressStreet}
              onChange={(e) => updateFormData('addressStreet', e.target.value)}
              placeholder="House no., street name, locality"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="City / District *"
                value={formData.addressCity}
                onChange={(e) => updateFormData('addressCity', e.target.value)}
                placeholder="City or district"
              />
              <Input
                label="State / Province"
                value={formData.addressState}
                onChange={(e) => updateFormData('addressState', e.target.value)}
                placeholder="Optional"
              />
              <Select
                label="Country *"
                options={NATIONALITIES.map(n => ({ value: n, label: n }))}
                value={formData.addressCountry}
                onChange={(e) => updateFormData('addressCountry', e.target.value)}
              />
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
              <Input
                label="Contact Number *"
                value={formData.contact}
                onChange={(e) => updateFormData('contact', e.target.value)}
                placeholder="+977 9812345678"
              />
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder="optional@example.com"
              />
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
              <Select
                label="ID Type *"
                options={EXTENDED_ID_TYPES}
                value={formData.identities[0].type}
                onChange={(e) => updateIdentity('type', e.target.value)}
              />
              <Input
                label="ID Number *"
                value={formData.identities[0].idNumber}
                onChange={(e) => updateIdentity('idNumber', e.target.value)}
                placeholder="Enter ID number"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Issuing Country *"
                options={NATIONALITIES.map(n => ({ value: n, label: n }))}
                value={formData.identities[0].issuingCountry}
                onChange={(e) => updateIdentity('issuingCountry', e.target.value)}
              />
              <div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      label="Expiry Date *"
                      type="date"
                      value={formData.identities[0].expiryDate}
                      onChange={(e) => updateIdentity('expiryDate', e.target.value)}
                      onBlur={handleIdExpiryBlur}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowBSPickerExpiry(true)}
                      title="Enter BS date"
                    >
                      BS
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to auto-set +100 years
                </p>
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
                <p className="text-green-800 font-medium">
                  ✓ Nepali citizen - Visa details auto-filled (N/A)
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Visa: {formData.visaNumber} | Valid: {formData.visaIssueDate} to {formData.visaExpiryDate}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Visa Number *"
                    value={formData.visaNumber}
                    onChange={(e) => updateFormData('visaNumber', e.target.value)}
                    placeholder="Visa number"
                  />
                  <Input
                    label="Visa Type *"
                    value={formData.visaType}
                    onChange={(e) => updateFormData('visaType', e.target.value)}
                    placeholder="Tourist, Business, etc."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Issue Date *"
                    type="date"
                    value={formData.visaIssueDate}
                    onChange={(e) => updateFormData('visaIssueDate', e.target.value)}
                  />
                  <Input
                    label="Expiry Date *"
                    type="date"
                    value={formData.visaExpiryDate}
                    onChange={(e) => updateFormData('visaExpiryDate', e.target.value)}
                  />
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
              <Input
                label="Arrival Date & Time *"
                type="datetime-local"
                value={formData.arrivalDateTime}
                onChange={(e) => updateFormData('arrivalDateTime', e.target.value)}
              />
              <Select
                label="Arrival Location *"
                options={LOCATIONS.map(l => ({ value: l, label: l }))}
                value={formData.arrivalLocation}
                onChange={(e) => updateFormData('arrivalLocation', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Room / Temporary Address *"
                value={formData.temporaryAddress}
                onChange={(e) => updateFormData('temporaryAddress', e.target.value)}
                placeholder="Room 101, Building A"
              />
              <Input
                label="Planned Departure"
                type="date"
                value={formData.plannedDeparture}
                onChange={(e) => updateFormData('plannedDeparture', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Purpose of Visit *"
                options={PURPOSES.map(p => ({ value: p, label: p }))}
                value={formData.purpose}
                onChange={(e) => updateFormData('purpose', e.target.value)}
              />
              <Input
                label="Host / Contact Person"
                value={formData.host}
                onChange={(e) => updateFormData('host', e.target.value)}
              />
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
              {canSubmit
                ? 'All required fields are complete!'
                : 'Please complete all required sections marked with *'}
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || createMutation.isPending}
            size="lg"
          >
            {createMutation.isPending ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Entry'
            )}
          </Button>
        </div>
      </Card>

      {/* BS Date Pickers */}
      <BSDatePicker
        isOpen={showBSPickerDOB}
        onClose={() => setShowBSPickerDOB(false)}
        onDateSelect={(adDate) => updateFormData('dob', adDate)}
        title="Enter Date of Birth (BS)"
        initialADDate={formData.dob}
      />
      <BSDatePicker
        isOpen={showBSPickerExpiry}
        onClose={() => setShowBSPickerExpiry(false)}
        onDateSelect={(adDate) => updateIdentity('expiryDate', adDate)}
        title="Enter ID Expiry Date (BS)"
        initialADDate={formData.identities[0].expiryDate}
      />

      {/* Duplicate Warning Modal */}
      <Modal
        isOpen={showDuplicateWarning}
        onClose={handleCancelSubmit}
        title="⚠️ Potential Duplicate Detected"
      >
        <div className="p-6">
          {/* Identity Match - BLOCKING */}
          {duplicateMatches.identityMatches.length > 0 && (
            <div className="mb-6">
              <div className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-500 rounded-lg mb-4">
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-red-900">Cannot Add - Identity Number Already Exists</h3>
                  <p className="text-sm text-red-800 mt-1">
                    <strong>SUPER STRICT CHECK:</strong> Someone with the same identity document number is already in the system. This is not allowed.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-900">Existing person(s) with same ID number:</p>
                {duplicateMatches.identityMatches.map((person) => (
                  <div key={person.id} className="p-4 bg-gray-50 border border-red-300 rounded-lg">
                    <p className="font-semibold text-gray-900">
                      {person.givenName} {person.familyName}
                    </p>
                    <p className="text-sm text-gray-600">Nationality: {person.nationality}</p>
                    <p className="text-sm text-gray-600">
                      ID: {person.identities?.[0]?.type} - {person.identities?.[0]?.idNumber}
                    </p>
                    <p className="text-sm text-gray-600">Contact: {person.contact}</p>
                    <p className="text-xs text-red-600 mt-2 font-medium">
                      ⚠️ This person is already registered. Please verify the ID number.
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={handleCancelSubmit} variant="secondary">
                  Go Back and Check
                </Button>
              </div>
            </div>
          )}

          {/* Name + Nationality Match - REQUIRES APPROVAL */}
          {duplicateMatches.identityMatches.length === 0 && duplicateMatches.nameNationalityMatches.length > 0 && (
            <div className="mb-6">
              <div className="flex items-start gap-3 p-4 bg-orange-50 border-2 border-orange-500 rounded-lg mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-orange-900">Warning: Same Name & Nationality</h3>
                  <p className="text-sm text-orange-800 mt-1">
                    <strong>STRICT CHECK:</strong> Someone with the exact same name AND nationality exists in the system.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-900">Existing person(s):</p>
                {duplicateMatches.nameNationalityMatches.map((person) => (
                  <div key={person.id} className="p-4 bg-gray-50 border border-orange-300 rounded-lg">
                    <p className="font-semibold text-gray-900">
                      {person.givenName} {person.familyName}
                    </p>
                    <p className="text-sm text-gray-600">Nationality: {person.nationality}</p>
                    <p className="text-sm text-gray-600">DOB: {person.dob}</p>
                    <p className="text-sm text-gray-600">Contact: {person.contact}</p>
                    <p className="text-sm text-gray-600">
                      ID: {person.identities?.[0]?.type} - {person.identities?.[0]?.idNumber}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                <p className="text-sm text-yellow-900 font-medium">
                  ⚠️ Please verify this is a different person before proceeding.
                </p>
                <p className="text-xs text-yellow-800 mt-1">
                  Check the identity document number, date of birth, and contact information to confirm.
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button onClick={handleCancelSubmit} variant="secondary">
                  Cancel - Review Details
                </Button>
                <Button onClick={handleConfirmSubmit} variant="primary">
                  Confirm - Add Anyway
                </Button>
              </div>
            </div>
          )}

          {/* Name Only Match - GENTLE WARNING */}
          {duplicateMatches.identityMatches.length === 0 && 
           duplicateMatches.nameNationalityMatches.length === 0 && 
           duplicateMatches.nameMatches.length > 0 && (
            <div className="mb-6">
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-300 rounded-lg mb-4">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-blue-900">Notice: Similar Name Found</h3>
                  <p className="text-sm text-blue-800 mt-1">
                    Someone with a similar name (but different nationality) exists in the system.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-900">Existing person(s):</p>
                {duplicateMatches.nameMatches.map((person) => (
                  <div key={person.id} className="p-4 bg-gray-50 border border-blue-200 rounded-lg">
                    <p className="font-semibold text-gray-900">
                      {person.givenName} {person.familyName}
                    </p>
                    <p className="text-sm text-gray-600">Nationality: {person.nationality}</p>
                    <p className="text-sm text-gray-600">DOB: {person.dob}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  ℹ️ This is likely a different person since the nationality is different. You can proceed.
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button onClick={handleCancelSubmit} variant="secondary">
                  Cancel
                </Button>
                <Button onClick={handleConfirmSubmit} variant="primary">
                  Continue Adding
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
