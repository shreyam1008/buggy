import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, Check, RefreshCw } from 'lucide-react';
import { Button, Card, Input, Select } from '../../components/ui';
import { PhotoUploadEditor } from '../../components/features';
import { mockAPI } from '../../services/api';
import { NATIONALITIES, PURPOSES, LOCATIONS, ID_TYPES, GENDER_OPTIONS } from '../../config/constants';
import type { CompressedImage } from '../../types';

export function AddDevotee() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
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
    arrivalDateTime: new Date().toISOString().slice(0, 16),
    arrivalLocation: LOCATIONS[0],
    temporaryAddress: '',
    plannedDeparture: '',
    purpose: PURPOSES[0],
    host: 'Ashram Administration',
    photo: null as File | null,
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoSize, setPhotoSize] = useState(0);
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries();
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

  const canProceed = () => {
    if (step === 1) return formData.givenName && formData.familyName && formData.dob;
    if (step === 2) return formData.identities[0].idNumber;
    if (step === 3) return formData.arrivalDateTime && formData.temporaryAddress;
    return true;
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Add New Devotee</h1>
      </div>

      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                s === step
                  ? 'bg-blue-600 text-white'
                  : s < step
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {s < step ? <Check className="w-5 h-5" /> : s}
            </div>
            {s < 5 && (
              <div className={`w-16 h-1 ${s < step ? 'bg-green-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <Card className="p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Basic Details</h2>
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

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Identity Documents</h2>
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

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Visit Details</h2>
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

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Photo Upload & Edit</h2>
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

        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Review & Confirm</h2>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div>
                <span className="font-medium">Name:</span> {formData.givenName}{' '}
                {formData.familyName}
              </div>
              <div>
                <span className="font-medium">DOB:</span> {formData.dob}
              </div>
              <div>
                <span className="font-medium">Nationality:</span> {formData.nationality}
              </div>
              <div>
                <span className="font-medium">ID:</span> {formData.identities[0].type} -{' '}
                {formData.identities[0].idNumber}
              </div>
              <div>
                <span className="font-medium">Arrival:</span>{' '}
                {new Date(formData.arrivalDateTime).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Room:</span> {formData.temporaryAddress}
              </div>
              <div>
                <span className="font-medium">Purpose:</span> {formData.purpose}
              </div>
              {photoPreview && (
                <div>
                  <span className="font-medium">Photo:</span> Uploaded (
                  {(photoSize / 1024).toFixed(2)} KB)
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <Button
            variant="secondary"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            Previous
          </Button>
          {step < 5 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              Next
            </Button>
          ) : (
            <Button
              onClick={() => createMutation.mutate(formData)}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                'Save Devotee'
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
