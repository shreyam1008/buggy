import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Home, Users, UserPlus, Search, FileText, Settings, 
  Camera, Upload, Download, Plus, Edit, Trash2, 
  Calendar, MapPin, Phone, Mail, X, Check, 
  AlertCircle, ChevronRight, Save, RefreshCw,
  Eye, EyeOff, LogOut, Menu, Clock, CheckCircle
} from 'lucide-react';

// ============================================================================
// MOCK API & DUMMY DATA GENERATOR
// ============================================================================

const NATIONALITIES = ['Nepal', 'India', 'USA', 'UK', 'Germany', 'France', 'Australia', 'Japan', 'China', 'Russia'];
const GIVEN_NAMES = ['Ram', 'Sita', 'John', 'Emma', 'Hans', 'Marie', 'Yuki', 'Li', 'Ahmed', 'Sarah'];
const FAMILY_NAMES = ['Sharma', 'Thapa', 'Smith', 'Johnson', 'Mueller', 'Dupont', 'Tanaka', 'Chen', 'Khan', 'Williams'];
const PURPOSES = ['Spiritual retreat', 'Meditation course', 'Volunteer work', 'Religious study', 'Cultural exchange'];
const LOCATIONS = ['Tribhuvan International Airport', 'Rasuwagadhi Border', 'Kakarbhitta Border', 'Sunauli Border'];

function generateDummyData(count = 100) {
  const persons = [];
  const visits = [];
  const photos = [];
  const formCSubmissions = [];

  for (let i = 0; i < count; i++) {
    const personId = `P${String(i + 1).padStart(4, '0')}`;
    const nationality = NATIONALITIES[Math.floor(Math.random() * NATIONALITIES.length)];
    
    const person = {
      id: personId,
      givenName: GIVEN_NAMES[Math.floor(Math.random() * GIVEN_NAMES.length)],
      familyName: FAMILY_NAMES[Math.floor(Math.random() * FAMILY_NAMES.length)],
      dob: new Date(1950 + Math.floor(Math.random() * 50), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      gender: Math.random() > 0.5 ? 'Male' : 'Female',
      nationality,
      permanentAddress: `${Math.floor(Math.random() * 999) + 1} Street Name, City, ${nationality}`,
      contact: `+${Math.floor(Math.random() * 900000000) + 100000000}`,
      email: `devotee${i + 1}@example.com`,
      notes: Math.random() > 0.7 ? 'Regular visitor, prefers ground floor room' : '',
      identities: [{
        type: 'passport',
        idNumber: `${nationality.substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 9000000) + 1000000}`,
        issuingCountry: nationality,
        expiryDate: new Date(2025 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0]
      }]
    };

    const visitId = `V${String(i + 1).padStart(4, '0')}`;
    const arrivalDate = new Date(2024, 9, Math.floor(Math.random() * 30) + 1);
    const plannedDays = Math.floor(Math.random() * 20) + 3;
    const isCurrentlyInAshram = Math.random() > 0.3;
    
    const visit = {
      id: visitId,
      personId,
      arrivalDateTime: arrivalDate.toISOString(),
      arrivalLocation: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
      temporaryAddress: `Room ${Math.floor(Math.random() * 200) + 1}, Building ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
      plannedDeparture: new Date(arrivalDate.getTime() + plannedDays * 24 * 60 * 60 * 1000).toISOString(),
      actualDeparture: isCurrentlyInAshram ? null : new Date(arrivalDate.getTime() + (plannedDays - 2) * 24 * 60 * 60 * 1000).toISOString(),
      purpose: PURPOSES[Math.floor(Math.random() * PURPOSES.length)],
      host: 'Ashram Administration'
    };

    const photoId = `PH${String(i + 1).padStart(4, '0')}`;
    photos.push({
      id: photoId,
      personId,
      visitId,
      fileName: `photo_${personId}_${Date.now()}.jpg`,
      size: Math.floor(Math.random() * 40000) + 10000,
      mime: 'image/jpeg',
      thumbnailData: `data:image/svg+xml,${encodeURIComponent(`<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#${Math.floor(Math.random()*16777215).toString(16)}"/><text x="50" y="55" text-anchor="middle" fill="white" font-size="14">${person.givenName[0]}${person.familyName[0]}</text></svg>`)}`
    });

    const formCSubmitted = Math.random() > 0.4;
    if (formCSubmitted || !isCurrentlyInAshram) {
      formCSubmissions.push({
        id: `FC${String(i + 1).padStart(4, '0')}`,
        visitId,
        submitted: formCSubmitted,
        govIdNumber: formCSubmitted ? `GOV-${Math.floor(Math.random() * 900000) + 100000}` : null,
        govSubmissionDate: formCSubmitted ? new Date(arrivalDate.getTime() + 24 * 60 * 60 * 1000).toISOString() : null,
        govResponse: formCSubmitted ? 'Approved' : null
      });
    }

    persons.push(person);
    visits.push(visit);
  }

  return { persons, visits, photos, formCSubmissions };
}

// Mock database
let mockDB = generateDummyData(100);
let drafts = [];
let currentUser = { username: 'admin', role: 'Admin', permissions: { canCreate: true, canEditPerson: true, canDelete: true, canSubmitFormC: true, canExport: true, canCheckOut: true } };

// Mock API functions
const mockAPI = {
  async getDashboardStats() {
    await new Promise(resolve => setTimeout(resolve, 300));
    const currentVisits = mockDB.visits.filter(v => !v.actualDeparture);
    const pendingFormC = currentVisits.filter(v => !mockDB.formCSubmissions.find(fc => fc.visitId === v.id && fc.submitted));
    const today = new Date().toISOString().split('T')[0];
    const todayArrivals = mockDB.visits.filter(v => v.arrivalDateTime.split('T')[0] === today);
    const todayDepartures = mockDB.visits.filter(v => v.plannedDeparture?.split('T')[0] === today && !v.actualDeparture);

    return {
      currentOccupancy: currentVisits.length,
      pendingFormC: pendingFormC.length,
      drafts: drafts.length,
      todayArrivals: todayArrivals.length,
      todayDepartures: todayDepartures.length
    };
  },

  async getCurrentResidents(filters: { nationality?: string; formCStatus?: string } = {}) {
    await new Promise(resolve => setTimeout(resolve, 200));
    let residents = mockDB.visits
      .filter(v => !v.actualDeparture)
      .map(v => ({
        ...v,
        person: mockDB.persons.find(p => p.id === v.personId),
        formCStatus: mockDB.formCSubmissions.find(fc => fc.visitId === v.id)?.submitted ? 'Submitted' : 'Pending',
        photo: mockDB.photos.find(ph => ph.visitId === v.id)
      }));

    if (filters.nationality) {
      residents = residents.filter(r => r.person?.nationality === filters.nationality);
    }
    if (filters.formCStatus) {
      residents = residents.filter(r => r.formCStatus === filters.formCStatus);
    }

    return residents;
  },

  async searchPersons(query) {
    await new Promise(resolve => setTimeout(resolve, 150));
    const lowerQuery = query.toLowerCase();
    return mockDB.persons.filter(p => 
      p.givenName.toLowerCase().includes(lowerQuery) ||
      p.familyName.toLowerCase().includes(lowerQuery) ||
      p.contact?.includes(query) ||
      p.identities?.some(id => id.idNumber.toLowerCase().includes(lowerQuery))
    );
  },

  async getPerson(id) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const person = mockDB.persons.find(p => p.id === id);
    const visits = mockDB.visits.filter(v => v.personId === id).map(v => ({
      ...v,
      photo: mockDB.photos.find(ph => ph.visitId === v.id),
      formC: mockDB.formCSubmissions.find(fc => fc.visitId === v.id)
    }));
    return { ...person, visits };
  },

  async createPerson(data) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newPerson = {
      id: `P${String(mockDB.persons.length + 1).padStart(4, '0')}`,
      ...data
    };
    mockDB.persons.push(newPerson);
    return newPerson;
  },

  async createVisit(data) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newVisit = {
      id: `V${String(mockDB.visits.length + 1).padStart(4, '0')}`,
      ...data
    };
    mockDB.visits.push(newVisit);
    return newVisit;
  },

  async createPhoto(data) {
    await new Promise(resolve => setTimeout(resolve, 150));
    const newPhoto = {
      id: `PH${String(mockDB.photos.length + 1).padStart(4, '0')}`,
      ...data
    };
    mockDB.photos.push(newPhoto);
    return newPhoto;
  },

  async updateVisit(id, data) {
    await new Promise(resolve => setTimeout(resolve, 150));
    const index = mockDB.visits.findIndex(v => v.id === id);
    if (index !== -1) {
      mockDB.visits[index] = { ...mockDB.visits[index], ...data };
      return mockDB.visits[index];
    }
    throw new Error('Visit not found');
  },

  async submitFormC(visitId, govIdNumber) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newFormC = {
      id: `FC${String(mockDB.formCSubmissions.length + 1).padStart(4, '0')}`,
      visitId,
      submitted: true,
      govIdNumber,
      govSubmissionDate: new Date().toISOString(),
      govResponse: 'Approved'
    };
    mockDB.formCSubmissions.push(newFormC);
    return newFormC;
  },

  async saveDraft(data) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const draft = {
      id: `D${String(drafts.length + 1).padStart(4, '0')}`,
      ...data,
      savedAt: new Date().toISOString()
    };
    drafts.push(draft);
    return draft;
  },

  async getDrafts() {
    await new Promise(resolve => setTimeout(resolve, 100));
    return drafts;
  },

  async deleteDraft(id) {
    await new Promise(resolve => setTimeout(resolve, 100));
    drafts = drafts.filter(d => d.id !== id);
  },

  async generateMoreData(count) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newData = generateDummyData(count);
    mockDB.persons.push(...newData.persons);
    mockDB.visits.push(...newData.visits);
    mockDB.photos.push(...newData.photos);
    mockDB.formCSubmissions.push(...newData.formCSubmissions);
    return { message: `Generated ${count} new records` };
  }
};

// ============================================================================
// IMAGE COMPRESSION UTILITY
// ============================================================================

function compressImage(file, maxSizeKB = 50) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let quality = 0.9;
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        
        // Resize to max 600px
        let width = img.width;
        let height = img.height;
        const maxDim = 600;
        
        if (width > height && width > maxDim) {
          height = (height / width) * maxDim;
          width = maxDim;
        } else if (height > maxDim) {
          width = (width / height) * maxDim;
          height = maxDim;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        const compress = () => {
          canvas.toBlob((blob) => {
            if (blob.size <= maxSizeKB * 1024 || quality <= 0.1) {
              resolve({ blob, size: blob.size, dataURL: canvas.toDataURL('image/jpeg', quality) });
            } else {
              quality -= 0.1;
              compress();
            }
          }, 'image/jpeg', quality);
        };
        
        compress();
      };
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============================================================================
// COMPONENTS
// ============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, refetchOnWindowFocus: false }
  }
});

function Button({ children, variant = 'primary', size = 'md', ...props }) {
  const baseClass = 'rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button className={`${baseClass} ${variants[variant]} ${sizes[size]}`} {...props}>
      {children}
    </button>
  );
}

function Input({ label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        {...props}
      />
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <select
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600'
  };
  
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DASHBOARD
// ============================================================================

function Dashboard({ onNavigate }) {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: mockAPI.getDashboardStats
  });

  const { data: residents, isLoading: residentsLoading } = useQuery({
    queryKey: ['currentResidents'],
    queryFn: () => mockAPI.getCurrentResidents()
  });

  const [filters, setFilters] = useState({ nationality: '', formCStatus: '' });
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateCount, setGenerateCount] = useState(50);
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: (count) => mockAPI.generateMoreData(count),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setShowGenerateModal(false);
    }
  });

  const filteredResidents = useMemo(() => {
    if (!residents) return [];
    let filtered = [...residents];
    if (filters.nationality) {
      filtered = filtered.filter(r => r.person?.nationality === filters.nationality);
    }
    if (filters.formCStatus) {
      filtered = filtered.filter(r => r.formCStatus === filters.formCStatus);
    }
    return filtered;
  }, [residents, filters]);

  if (statsLoading || residentsLoading) {
    return <div className="flex items-center justify-center h-64"><RefreshCw className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={() => onNavigate('addSingle')} size="md">
            <Plus className="w-4 h-4" />
            Add Devotee
          </Button>
          <Button onClick={() => onNavigate('bulkEntry')} variant="secondary">
            <Users className="w-4 h-4" />
            Bulk Entry
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Users} label="Current Occupancy" value={stats.currentOccupancy} color="blue" />
        <StatCard icon={FileText} label="Pending Form-C" value={stats.pendingFormC} color="orange" />
        <StatCard icon={Save} label="Drafts" value={stats.drafts} color="purple" />
        <StatCard icon={Calendar} label="Today Arrivals" value={stats.todayArrivals} color="green" />
        <StatCard icon={Clock} label="Today Departures" value={stats.todayDepartures} color="red" />
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold">Current Residents</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowGenerateModal(true)}>
              <RefreshCw className="w-4 h-4" />
              Generate Data
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <Select
            label="Nationality"
            options={[
              { value: '', label: 'All Nationalities' },
              ...NATIONALITIES.map(n => ({ value: n, label: n }))
            ]}
            value={filters.nationality}
            onChange={(e) => setFilters({ ...filters, nationality: e.target.value })}
          />
          <Select
            label="Form-C Status"
            options={[
              { value: '', label: 'All Status' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Submitted', label: 'Submitted' }
            ]}
            value={filters.formCStatus}
            onChange={(e) => setFilters({ ...filters, formCStatus: e.target.value })}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nationality</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Room</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Arrival</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Departure</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Form-C</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredResidents.slice(0, 20).map((resident) => (
                <tr key={resident.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={resident.photo?.thumbnailData}
                        alt={resident.person?.givenName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {resident.person?.givenName} {resident.person?.familyName}
                        </p>
                        <p className="text-sm text-gray-500">{resident.person?.contact}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{resident.person?.nationality}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{resident.temporaryAddress}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(resident.arrivalDateTime).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(resident.plannedDeparture).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      resident.formCStatus === 'Submitted' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {resident.formCStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={() => onNavigate('person', resident.personId)}>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={showGenerateModal} onClose={() => setShowGenerateModal(false)} title="Generate Dummy Data">
        <div className="p-6 space-y-4">
          <Input
            label="Number of Records"
            type="number"
            value={generateCount}
            onChange={(e) => setGenerateCount(parseInt(e.target.value) || 50)}
            min="1"
            max="1000"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowGenerateModal(false)}>Cancel</Button>
            <Button onClick={() => generateMutation.mutate(generateCount)} disabled={generateMutation.isPending}>
              {generateMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Generate'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ============================================================================
// ADD SINGLE DEVOTEE (WIZARD)
// ============================================================================

function AddSingleDevotee({ onNavigate }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
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
    photo: null
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoSize, setPhotoSize] = useState(0);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const person = await mockAPI.createPerson({
        givenName: data.givenName,
        familyName: data.familyName,
        dob: data.dob,
        gender: data.gender,
        nationality: data.nationality,
        permanentAddress: data.permanentAddress,
        contact: data.contact,
        email: data.email,
        identities: data.identities
      });

      const visit = await mockAPI.createVisit({
        personId: person.id,
        arrivalDateTime: data.arrivalDateTime,
        arrivalLocation: data.arrivalLocation,
        temporaryAddress: data.temporaryAddress,
        plannedDeparture: data.plannedDeparture,
        purpose: data.purpose,
        host: data.host
      });

      if (data.photo) {
        await mockAPI.createPhoto({
          personId: person.id,
          visitId: visit.id,
          fileName: data.photo.name,
          size: data.photo.size,
          mime: data.photo.type,
          thumbnailData: photoPreview
        });
      }

      return { person, visit };
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      onNavigate('dashboard');
    }
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      setFormData({ ...formData, photo: new File([compressed.blob], file.name, { type: 'image/jpeg' }) });
      setPhotoPreview(compressed.dataURL);
      setPhotoSize(compressed.size);
    } catch (error) {
      console.error('Compression failed:', error);
    }
  };

  const updateFormData = (key, value) => {
    setFormData({ ...formData, [key]: value });
    // Auto-save to drafts would go here
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
        <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Add New Devotee</h1>
      </div>

      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              s === step ? 'bg-blue-600 text-white' : s < step ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {s < step ? <Check className="w-5 h-5" /> : s}
            </div>
            {s < 5 && <div className={`w-16 h-1 ${s < step ? 'bg-green-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <Card className="p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Basic Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Given Name *" value={formData.givenName} onChange={(e) => updateFormData('givenName', e.target.value)} />
              <Input label="Family Name *" value={formData.familyName} onChange={(e) => updateFormData('familyName', e.target.value)} />
              <Input label="Date of Birth *" type="date" value={formData.dob} onChange={(e) => updateFormData('dob', e.target.value)} />
              <Select label="Gender" options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }]} value={formData.gender} onChange={(e) => updateFormData('gender', e.target.value)} />
              <Select label="Nationality" options={NATIONALITIES.map(n => ({ value: n, label: n }))} value={formData.nationality} onChange={(e) => updateFormData('nationality', e.target.value)} />
              <Input label="Contact" type="tel" value={formData.contact} onChange={(e) => updateFormData('contact', e.target.value)} />
              <Input label="Email" type="email" value={formData.email} onChange={(e) => updateFormData('email', e.target.value)} />
            </div>
            <Input label="Permanent Address" value={formData.permanentAddress} onChange={(e) => updateFormData('permanentAddress', e.target.value)} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Identity Documents</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="ID Type"
                options={[
                  { value: 'passport', label: 'Passport' },
                  { value: 'citizenship', label: 'Citizenship' },
                  { value: 'voterid', label: 'Voter ID' },
                  { value: 'driver', label: 'Driver License' }
                ]}
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
                options={NATIONALITIES.map(n => ({ value: n, label: n }))}
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
              <Input label="Arrival Date & Time *" type="datetime-local" value={formData.arrivalDateTime} onChange={(e) => updateFormData('arrivalDateTime', e.target.value)} />
              <Select label="Arrival Location" options={LOCATIONS.map(l => ({ value: l, label: l }))} value={formData.arrivalLocation} onChange={(e) => updateFormData('arrivalLocation', e.target.value)} />
              <Input label="Temporary Address (Room) *" value={formData.temporaryAddress} onChange={(e) => updateFormData('temporaryAddress', e.target.value)} placeholder="e.g., Room 101, Building A" />
              <Input label="Planned Departure" type="date" value={formData.plannedDeparture} onChange={(e) => updateFormData('plannedDeparture', e.target.value)} />
              <Select label="Purpose of Visit" options={PURPOSES.map(p => ({ value: p, label: p }))} value={formData.purpose} onChange={(e) => updateFormData('purpose', e.target.value)} />
              <Input label="Host/Contact" value={formData.host} onChange={(e) => updateFormData('host', e.target.value)} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Photo Upload</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                {photoPreview ? (
                  <div className="space-y-4">
                    <img src={photoPreview} alt="Preview" className="w-48 h-48 mx-auto object-cover rounded-lg" />
                    <p className="text-sm text-gray-600">
                      Size: {(photoSize / 1024).toFixed(2)} KB {photoSize <= 50 * 1024 ? '✓' : '⚠️ Too large'}
                    </p>
                    <Button type="button" variant="secondary">Change Photo</Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Camera className="w-16 h-16 mx-auto text-gray-400" />
                    <p className="text-gray-600">Click to upload photo (max 50 KB)</p>
                    <p className="text-sm text-gray-500">Photo will be compressed automatically</p>
                  </div>
                )}
              </label>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Review & Confirm</h2>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div><span className="font-medium">Name:</span> {formData.givenName} {formData.familyName}</div>
              <div><span className="font-medium">DOB:</span> {formData.dob}</div>
              <div><span className="font-medium">Nationality:</span> {formData.nationality}</div>
              <div><span className="font-medium">ID:</span> {formData.identities[0].type} - {formData.identities[0].idNumber}</div>
              <div><span className="font-medium">Arrival:</span> {new Date(formData.arrivalDateTime).toLocaleString()}</div>
              <div><span className="font-medium">Room:</span> {formData.temporaryAddress}</div>
              <div><span className="font-medium">Purpose:</span> {formData.purpose}</div>
              {photoPreview && <div><span className="font-medium">Photo:</span> Uploaded ({(photoSize / 1024).toFixed(2)} KB)</div>}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <Button variant="secondary" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
            Previous
          </Button>
          {step < 5 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              Next
            </Button>
          ) : (
            <Button onClick={() => createMutation.mutate(formData)} disabled={createMutation.isPending}>
              {createMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Save Devotee'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// BULK ENTRY
// ============================================================================

function BulkEntry({ onNavigate }) {
  const [rows, setRows] = useState(Array(10).fill(null).map((_, i) => ({
    id: `temp-${i}`,
    givenName: '',
    familyName: '',
    dob: '',
    gender: 'Male',
    nationality: 'Nepal',
    idNumber: '',
    contact: ''
  })));

  const [sharedFields, setSharedFields] = useState({
    arrivalDateTime: new Date().toISOString().slice(0, 16),
    arrivalLocation: LOCATIONS[0],
    temporaryAddressPrefix: 'Room ',
    purpose: PURPOSES[0]
  });

  const updateRow = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const addRow = () => {
    setRows([...rows, { id: `temp-${rows.length}`, givenName: '', familyName: '', dob: '', gender: 'Male', nationality: 'Nepal', idNumber: '', contact: '' }]);
  };

  return (
    <div>
      <div className="mb-6">
        <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Bulk Entry</h1>
      </div>

      <Card className="p-6 mb-4">
        <h2 className="text-lg font-semibold mb-4">Shared Fields (Applied to All)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Arrival Date & Time" type="datetime-local" value={sharedFields.arrivalDateTime} onChange={(e) => setSharedFields({ ...sharedFields, arrivalDateTime: e.target.value })} />
          <Select label="Arrival Location" options={LOCATIONS.map(l => ({ value: l, label: l }))} value={sharedFields.arrivalLocation} onChange={(e) => setSharedFields({ ...sharedFields, arrivalLocation: e.target.value })} />
          <Select label="Purpose" options={PURPOSES.map(p => ({ value: p, label: p }))} value={sharedFields.purpose} onChange={(e) => setSharedFields({ ...sharedFields, purpose: e.target.value })} />
        </div>
      </Card>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left text-sm font-semibold">#</th>
                <th className="px-3 py-2 text-left text-sm font-semibold">Given Name</th>
                <th className="px-3 py-2 text-left text-sm font-semibold">Family Name</th>
                <th className="px-3 py-2 text-left text-sm font-semibold">DOB</th>
                <th className="px-3 py-2 text-left text-sm font-semibold">Gender</th>
                <th className="px-3 py-2 text-left text-sm font-semibold">Nationality</th>
                <th className="px-3 py-2 text-left text-sm font-semibold">ID Number</th>
                <th className="px-3 py-2 text-left text-sm font-semibold">Contact</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id} className="border-b">
                  <td className="px-3 py-2">
                    <input
                      className="w-full px-2 py-1 border rounded"
                      value={row.contact}
                      onChange={(e) => updateRow(idx, 'contact', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={addRow} variant="secondary">
            <Plus className="w-4 h-4" />
            Add Row
          </Button>
          <Button>
            <Save className="w-4 h-4" />
            Save Batch
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// PERSON PROFILE
// ============================================================================

function PersonProfile({ personId, onNavigate }) {
  const { data: person, isLoading } = useQuery<any>({
    queryKey: ['person', personId],
    queryFn: () => mockAPI.getPerson(personId)
  });

  const [showFormCModal, setShowFormCModal] = useState(false);
  const [govIdNumber, setGovIdNumber] = useState('');
  const [selectedVisit, setSelectedVisit] = useState(null);
  const queryClient = useQueryClient();

  const submitFormCMutation = useMutation({
    mutationFn: (data) => mockAPI.submitFormC(data.visitId, data.govIdNumber),
    onSuccess: () => {
      queryClient.invalidateQueries(['person', personId]);
      setShowFormCModal(false);
      setGovIdNumber('');
    }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><RefreshCw className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="text-center mb-6">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4">
              {person.givenName[0]}{person.familyName[0]}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{person.givenName} {person.familyName}</h2>
            <p className="text-gray-600">{person.nationality}</p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="w-4 h-4" />
              <span>DOB: {person.dob}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Phone className="w-4 h-4" />
              <span>{person.contact || 'No contact'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Mail className="w-4 h-4" />
              <span>{person.email || 'No email'}</span>
            </div>
            <div className="flex items-start gap-2 text-gray-700">
              <MapPin className="w-4 h-4 mt-0.5" />
              <span>{person.permanentAddress}</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-2">Identity Documents</h3>
            {person.identities?.map((id, idx) => (
              <div key={idx} className="text-sm text-gray-700 mb-2">
                <span className="font-medium">{id.type}:</span> {id.idNumber}
                <br />
                <span className="text-gray-500">Expires: {id.expiryDate}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2 p-6">
          <h2 className="text-xl font-bold mb-4">Visit History</h2>
          <div className="space-y-4">
            {person.visits?.map((visit) => (
              <div key={visit.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">Visit #{visit.id}</h3>
                    <p className="text-sm text-gray-600">{visit.purpose}</p>
                  </div>
                  {visit.formC ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      Form-C Submitted
                    </span>
                  ) : !visit.actualDeparture ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedVisit(visit.id);
                        setShowFormCModal(true);
                      }}
                    >
                      Submit Form-C
                    </Button>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Arrival:</span>
                    <p className="font-medium">{new Date(visit.arrivalDateTime).toLocaleString()}</p>
                    <p className="text-gray-600">{visit.arrivalLocation}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Departure:</span>
                    <p className="font-medium">
                      {visit.actualDeparture 
                        ? new Date(visit.actualDeparture).toLocaleDateString()
                        : `Planned: ${new Date(visit.plannedDeparture).toLocaleDateString()}`
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Room:</span>
                    <p className="font-medium">{visit.temporaryAddress}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <p className="font-medium">
                      {visit.actualDeparture ? 'Checked Out' : 'Current Resident'}
                    </p>
                  </div>
                </div>

                {visit.photo && (
                  <div className="mt-3 pt-3 border-t">
                    <img
                      src={visit.photo.thumbnailData}
                      alt="Visit photo"
                      className="w-20 h-20 rounded object-cover"
                    />
                  </div>
                )}

                {visit.formC && (
                  <div className="mt-3 pt-3 border-t text-sm">
                    <p className="text-gray-600">Gov ID: <span className="font-medium">{visit.formC.govIdNumber}</span></p>
                    <p className="text-gray-600">Submitted: {new Date(visit.formC.govSubmissionDate).toLocaleString()}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal isOpen={showFormCModal} onClose={() => setShowFormCModal(false)} title="Submit Form-C">
        <div className="p-6 space-y-4">
          <Input
            label="Government ID Number"
            value={govIdNumber}
            onChange={(e) => setGovIdNumber(e.target.value)}
            placeholder="GOV-123456"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowFormCModal(false)}>Cancel</Button>
            <Button
              onClick={() => submitFormCMutation.mutate({ visitId: selectedVisit, govIdNumber })}
              disabled={!govIdNumber || submitFormCMutation.isPending}
            >
              {submitFormCMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Submit'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ============================================================================
// SEARCH
// ============================================================================

function SearchPage({ onNavigate }) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const results = await mockAPI.searchPersons(query);
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Devotees</h1>

      <Card className="p-6 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name, contact, or ID number..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            Search
          </Button>
        </div>
      </Card>

      {searchResults.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Results ({searchResults.length})</h2>
          <div className="space-y-3">
            {searchResults.map((person) => (
              <div
                key={person.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                onClick={() => onNavigate('person', person.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {person.givenName[0]}{person.familyName[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold">{person.givenName} {person.familyName}</h3>
                    <p className="text-sm text-gray-600">{person.nationality} • {person.contact}</p>
                    {person.identities?.[0] && (
                      <p className="text-xs text-gray-500">{person.identities[0].type}: {person.identities[0].idNumber}</p>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// SETTINGS
// ============================================================================

function SettingsPage() {
  const [roles, setRoles] = useState([
    { name: 'Admin', permissions: { canCreate: true, canEditPerson: true, canDelete: true, canSubmitFormC: true, canExport: true, canCheckOut: true } },
    { name: 'Data Entry', permissions: { canCreate: true, canEditPerson: false, canDelete: false, canSubmitFormC: false, canExport: false, canCheckOut: false } },
    { name: 'Front Desk', permissions: { canCreate: false, canEditPerson: false, canDelete: false, canSubmitFormC: false, canExport: false, canCheckOut: true } },
    { name: 'Read Only', permissions: { canCreate: false, canEditPerson: false, canDelete: false, canSubmitFormC: false, canExport: false, canCheckOut: false } }
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">User Profile</h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {currentUser.username[0].toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{currentUser.username}</h3>
            <p className="text-gray-600">{currentUser.role}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Role Permissions</h2>
        <div className="space-y-4">
          {roles.map((role) => (
            <div key={role.name} className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">{role.name}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(role.permissions).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => {
                        const newRoles = roles.map(r =>
                          r.name === role.name
                            ? { ...r, permissions: { ...r.permissions, [key]: e.target.checked } }
                            : r
                        );
                        setRoles(newRoles);
                      }}
                      className="rounded"
                    />
                    <span className="text-gray-700">
                      {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// MAIN APP
// ============================================================================

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedPersonId, setSelectedPersonId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = (page, personId = null) => {
    setCurrentPage(page);
    setSelectedPersonId(personId);
    setSidebarOpen(false);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'addSingle', label: 'Add Devotee', icon: UserPlus },
    { id: 'bulkEntry', label: 'Bulk Entry', icon: Users },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Devotee Management</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm text-gray-600">{currentUser.username}</span>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className={`
            fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform lg:transform-none
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <nav className="p-4 space-y-1 mt-16 lg:mt-0">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {currentPage === 'dashboard' && <Dashboard onNavigate={navigate} />}
            {currentPage === 'addSingle' && <AddSingleDevotee onNavigate={navigate} />}
            {currentPage === 'bulkEntry' && <BulkEntry onNavigate={navigate} />}
            {currentPage === 'person' && <PersonProfile personId={selectedPersonId} onNavigate={navigate} />}
            {currentPage === 'search' && <SearchPage onNavigate={navigate} />}
            {currentPage === 'settings' && <SettingsPage />}
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;