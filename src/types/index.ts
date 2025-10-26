// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Identity {
  type: 'passport' | 'citizenship' | 'voterid' | 'driver';
  idNumber: string;
  issuingCountry: string;
  expiryDate: string;
}

export interface Person {
  id: string;
  givenName: string;
  familyName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  nationality: string;
  permanentAddress: string;
  contact: string;
  email: string;
  notes?: string;
  identities: Identity[];
  visits?: Visit[];
}

export interface Photo {
  id: string;
  personId: string;
  visitId: string;
  fileName: string;
  size: number;
  mime: string;
  thumbnailData: string;
}

export interface FormCSubmission {
  id: string;
  visitId: string;
  submitted: boolean;
  govIdNumber: string | null;
  govSubmissionDate: string | null;
  govResponse: string | null;
}

export interface Visit {
  id: string;
  personId: string;
  arrivalDateTime: string;
  arrivalLocation: string;
  temporaryAddress: string;
  plannedDeparture: string;
  actualDeparture?: string | null;
  purpose: string;
  host: string;
  person?: Person;
  photo?: Photo;
  formC?: FormCSubmission;
  formCStatus?: 'Submitted' | 'Pending';
}

export interface DashboardStats {
  currentOccupancy: number;
  pendingFormC: number;
  drafts: number;
  todayArrivals: number;
  todayDepartures: number;
}

export interface User {
  username: string;
  role: string;
  permissions: {
    canCreate: boolean;
    canEditPerson: boolean;
    canDelete: boolean;
    canSubmitFormC: boolean;
    canExport: boolean;
    canCheckOut: boolean;
  };
}

export interface Draft {
  id: string;
  savedAt: string;
  status: 'incomplete' | 'pending_approval';
  // Basic Details
  givenName?: string;
  familyName?: string;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other';
  nationality?: string;
  // Address
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressCountry?: string;
  // Contact
  contact?: string;
  email?: string;
  // Identity
  identities?: Identity[];
  // Visa
  visaNumber?: string;
  visaType?: string;
  visaIssueDate?: string;
  visaExpiryDate?: string;
  // Visit
  arrivalDateTime?: string;
  arrivalLocation?: string;
  temporaryAddress?: string;
  plannedDeparture?: string;
  purpose?: string;
  host?: string;
  // Photo
  photoPreview?: string;
  photoSize?: number;
  [key: string]: any;
}

export interface CompressedImage {
  blob: Blob;
  size: number;
  dataURL: string;
}
