import React, { useState, useEffect, useCallback } from 'react';
import { Camera, Upload, Save, Trash2, Printer, Chrome, X, Search, Plus, RefreshCw, Download, Moon, Sun } from 'lucide-react';

// Types
interface Visit {
  visitId: string;
  ashram: string;
  ashramAddress: string;
  arrivedFromCountry: string;
  arrivedFromCity: string;
  dateArrivedInIndia: string;
  dateArrivedInAshram: string;
  timeArrivedInAshram: string;
  expectedDateOfDeparture: string;
  intendedDaysInAshram: number;
  nextDestinationInsideIndia: boolean;
  nextDestinationCountry: string;
  nextDestinationState?: string;
  nextDestinationCity: string;
  nextDestinationPlace: string;
  phoneInIndia: string;
  jkpNo?: string;
}

interface Devotee {
  id: number;
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  nationality: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  residenceCountry: string;
  phoneResiding: string;
  photoUrl?: string;
  photoBase64?: string;
  passportNumber?: string;
  passportIssuingCountry?: string;
  passportExpiryDate?: string;
  passportIssuedDate?: string;
  passportPlaceOfIssue?: string;
  visaNumber?: string;
  visaType?: string;
  visaIssuingCountry?: string;
  visaIssueDate?: string;
  visaExpiryDate?: string;
  visits: Visit[];
}

// Mock data
const MOCK_DEVOTEES: Devotee[] = [
  {
    id: 644,
    firstName: "Keshav",
    lastName: "Jha",
    gender: "Male",
    dob: "2001-09-25",
    nationality: "Nepal",
    streetAddress: "8, Malangwa, Sarlahi",
    city: "Malangwa",
    state: "Madhesh",
    postalCode: "",
    residenceCountry: "Nepal",
    phoneResiding: "9779800866813",
    passportNumber: "N1234567",
    passportIssuingCountry: "Nepal",
    passportExpiryDate: "2028-09-25",
    passportIssuedDate: "2018-09-25",
    passportPlaceOfIssue: "Kathmandu",
    visaNumber: "0",
    visaType: "0",
    visaIssuingCountry: "0",
    visaIssueDate: "0",
    visaExpiryDate: "0",
    visits: [
      {
        visitId: "v-2025-10-17-mang",
        ashram: "Mangarh",
        ashramAddress: "JKP Bhakti Dham, Mangarh/ Uttar Pradesh/ Pratapgarh/ 230204",
        arrivedFromCountry: "Nepal",
        arrivedFromCity: "Bhairawah, Buddha Chowk",
        dateArrivedInIndia: "2025-10-17",
        dateArrivedInAshram: "2025-10-17",
        timeArrivedInAshram: "03:34",
        expectedDateOfDeparture: "2025-10-21",
        intendedDaysInAshram: 4,
        nextDestinationInsideIndia: false,
        nextDestinationCountry: "Nepal",
        nextDestinationCity: "Malangwa",
        nextDestinationPlace: "Ward 8",
        phoneInIndia: "9919441222"
      }
    ]
  },
  {
    id: 645,
    firstName: "Priya",
    lastName: "Sharma",
    gender: "Female",
    dob: "1995-03-15",
    nationality: "India",
    streetAddress: "45, MG Road",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",
    residenceCountry: "India",
    phoneResiding: "919876543210",
    passportNumber: "J9876543",
    passportIssuingCountry: "India",
    passportExpiryDate: "2030-03-15",
    passportIssuedDate: "2020-03-15",
    passportPlaceOfIssue: "Mumbai",
    visaNumber: "V123456",
    visaType: "Tourist",
    visaIssuingCountry: "India",
    visaIssueDate: "2024-01-01",
    visaExpiryDate: "2026-01-01",
    visits: []
  }
];

const COUNTRIES = ["Nepal", "India", "USA", "UK", "Canada", "Australia"];
const ASHRAMS = ["Mangarh", "Kripalu Dham", "Barsana Dham", "Radha Madhav Dham"];

function FormCApp() {
  const [devotees, setDevotees] = useState<Devotee[]>(MOCK_DEVOTEES);
  const [currentDevotee, setCurrentDevotee] = useState<Devotee | null>(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [searchId, setSearchId] = useState('');
  const [showDevoteeList, setShowDevoteeList] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDraft, setIsDraft] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const [currentVisitIndex, setCurrentVisitIndex] = useState(0);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Auto-save draft
  useEffect(() => {
    if (!currentDevotee) return;
    const timer = setTimeout(() => {
      localStorage.setItem('draft_devotee', JSON.stringify(currentDevotee));
      setIsDraft(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, [currentDevotee]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('draft_devotee');
    if (draft) {
      const parsed = JSON.parse(draft);
      setCurrentDevotee(parsed);
      setIsDraft(true);
    } else if (devotees.length > 0) {
      setCurrentDevotee(devotees[0]);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewDevotee();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentDevotee]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleNewDevotee = () => {
    const newDevotee: Devotee = {
      id: Math.max(...devotees.map(d => d.id), 0) + 1,
      firstName: '',
      lastName: '',
      gender: 'Male',
      dob: '',
      nationality: 'Nepal',
      streetAddress: '',
      city: '',
      state: '',
      postalCode: '',
      residenceCountry: 'Nepal',
      phoneResiding: '',
      visits: []
    };
    setCurrentDevotee(newDevotee);
    setErrors({});
    setIsDraft(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!currentDevotee) return false;

    if (!currentDevotee.firstName) newErrors.firstName = 'First name is required';
    if (!currentDevotee.lastName) newErrors.lastName = 'Last name is required';
    if (!currentDevotee.dob) newErrors.dob = 'Date of birth is required';
    if (!currentDevotee.gender) newErrors.gender = 'Gender is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!currentDevotee) return;
    
    if (!validateForm()) {
      showNotification('Please fix validation errors', 'error');
      return;
    }

    const existingIndex = devotees.findIndex(d => d.id === currentDevotee.id);
    if (existingIndex >= 0) {
      const updated = [...devotees];
      updated[existingIndex] = currentDevotee;
      setDevotees(updated);
    } else {
      setDevotees([...devotees, currentDevotee]);
    }
    
    localStorage.removeItem('draft_devotee');
    setIsDraft(false);
    showNotification('Devotee saved successfully!');
  };

  const handleDelete = () => {
    if (!currentDevotee || !confirm('Are you sure you want to delete this devotee?')) return;
    
    setDevotees(devotees.filter(d => d.id !== currentDevotee.id));
    setCurrentDevotee(devotees[0] || null);
    showNotification('Devotee deleted successfully!');
  };

  const handleFieldChange = (field: string, value: any) => {
    if (!currentDevotee) return;
    
    const updated = { ...currentDevotee, [field]: value };
    
    // Auto-populate visa fields for Nepal
    if ((field === 'nationality' || field === 'residenceCountry') && 
        value.toLowerCase() === 'nepal') {
      updated.visaNumber = '0';
      updated.visaType = '0';
      updated.visaIssuingCountry = '0';
      updated.visaIssueDate = '0';
      updated.visaExpiryDate = '0';
    }
    
    setCurrentDevotee(updated);
    setIsDraft(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      showNotification('File size must be less than 2MB', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (currentDevotee) {
        setCurrentDevotee({
          ...currentDevotee,
          photoBase64: event.target?.result as string
        });
        setIsDraft(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleWebcamCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      setTimeout(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 320;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, 320, 320);
        const dataUrl = canvas.toDataURL('image/jpeg');
        
        if (currentDevotee) {
          setCurrentDevotee({
            ...currentDevotee,
            photoBase64: dataUrl
          });
          setIsDraft(true);
        }
        
        stream.getTracks().forEach(track => track.stop());
        setShowWebcam(false);
      }, 1000);
    } catch (err) {
      showNotification('Webcam access denied or unavailable', 'error');
    }
  };

  const handlePrintFormC = () => {
    if (!currentDevotee) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Form C - ${currentDevotee.firstName} ${currentDevotee.lastName}</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            h1 { text-align: center; }
            .field { margin: 10px 0; }
            .label { font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>FORM C</h1>
          <div class="field"><span class="label">Name:</span> ${currentDevotee.firstName} ${currentDevotee.lastName}</div>
          <div class="field"><span class="label">DOB:</span> ${currentDevotee.dob}</div>
          <div class="field"><span class="label">Nationality:</span> ${currentDevotee.nationality}</div>
          <div class="field"><span class="label">Passport:</span> ${currentDevotee.passportNumber || 'N/A'}</div>
          <div class="field"><span class="label">Address:</span> ${currentDevotee.streetAddress}, ${currentDevotee.city}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleUploadToFormC = () => {
    showNotification('Selenium automation would trigger here');
  };

  const handleNewVisit = () => {
    if (!currentDevotee) return;
    const newVisit: Visit = {
      visitId: `v-${Date.now()}`,
      ashram: '',
      ashramAddress: '',
      arrivedFromCountry: currentDevotee.residenceCountry,
      arrivedFromCity: '',
      dateArrivedInIndia: '',
      dateArrivedInAshram: '',
      timeArrivedInAshram: '',
      expectedDateOfDeparture: '',
      intendedDaysInAshram: 0,
      nextDestinationInsideIndia: false,
      nextDestinationCountry: '',
      nextDestinationCity: '',
      nextDestinationPlace: '',
      phoneInIndia: ''
    };
    setCurrentDevotee({
      ...currentDevotee,
      visits: [...currentDevotee.visits, newVisit]
    });
    setCurrentVisitIndex(currentDevotee.visits.length);
  };

  const handleVisitFieldChange = (field: string, value: any) => {
    if (!currentDevotee || currentDevotee.visits.length === 0) return;
    const visits = [...currentDevotee.visits];
    visits[currentVisitIndex] = { ...visits[currentVisitIndex], [field]: value };
    
    // Auto-calculate intended days
    if (field === 'dateArrivedInAshram' || field === 'expectedDateOfDeparture') {
      const arrival = new Date(visits[currentVisitIndex].dateArrivedInAshram);
      const departure = new Date(visits[currentVisitIndex].expectedDateOfDeparture);
      if (!isNaN(arrival.getTime()) && !isNaN(departure.getTime())) {
        const days = Math.ceil((departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24));
        visits[currentVisitIndex].intendedDaysInAshram = days > 0 ? days : 0;
      }
    }
    
    setCurrentDevotee({ ...currentDevotee, visits });
  };

  const isNepalese = currentDevotee?.nationality.toLowerCase() === 'nepal' || 
                      currentDevotee?.residenceCountry.toLowerCase() === 'nepal';

  if (!currentDevotee) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <button onClick={handleNewDevotee} className="px-6 py-3 bg-blue-600 text-white rounded-lg">
          Create New Devotee
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Form C Data Entry</h1>
          <div className="flex gap-2">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {isDraft && <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">Draft</span>}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="col-span-2">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
              {/* Tabs */}
              <div className={`flex border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                {['personal', 'passport', 'visa', 'arrival'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 font-medium ${
                      activeTab === tab
                        ? `border-b-2 border-blue-500 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`
                        : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Personal Details Tab */}
                {activeTab === 'personal' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">First Name *</label>
                        <input
                          type="text"
                          value={currentDevotee.firstName}
                          onChange={(e) => handleFieldChange('firstName', e.target.value)}
                          className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} ${errors.firstName ? 'border-red-500' : ''}`}
                        />
                        {errors.firstName && <span className="text-red-500 text-xs">{errors.firstName}</span>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Last Name *</label>
                        <input
                          type="text"
                          value={currentDevotee.lastName}
                          onChange={(e) => handleFieldChange('lastName', e.target.value)}
                          className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} ${errors.lastName ? 'border-red-500' : ''}`}
                        />
                        {errors.lastName && <span className="text-red-500 text-xs">{errors.lastName}</span>}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Gender *</label>
                        <select
                          value={currentDevotee.gender}
                          onChange={(e) => handleFieldChange('gender', e.target.value)}
                          className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                        >
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Date of Birth *</label>
                        <input
                          type="date"
                          value={currentDevotee.dob}
                          onChange={(e) => handleFieldChange('dob', e.target.value)}
                          className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Nationality *</label>
                        <select
                          value={currentDevotee.nationality}
                          onChange={(e) => handleFieldChange('nationality', e.target.value)}
                          className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                        >
                          {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Street Address</label>
                      <input
                        type="text"
                        value={currentDevotee.streetAddress}
                        onChange={(e) => handleFieldChange('streetAddress', e.target.value)}
                        className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">City</label>
                        <input
                          type="text"
                          value={currentDevotee.city}
                          onChange={(e) => handleFieldChange('city', e.target.value)}
                          className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">State/Province</label>
                        <input
                          type="text"
                          value={currentDevotee.state}
                          onChange={(e) => handleFieldChange('state', e.target.value)}
                          className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Postal Code</label>
                        <input
                          type="text"
                          value={currentDevotee.postalCode}
                          onChange={(e) => handleFieldChange('postalCode', e.target.value)}
                          className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Residence Country</label>
                        <select
                          value={currentDevotee.residenceCountry}
                          onChange={(e) => handleFieldChange('residenceCountry', e.target.value)}
                          className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                        >
                          {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone (Residing Country)</label>
                        <input
                          type="tel"
                          value={currentDevotee.phoneResiding}
                          onChange={(e) => handleFieldChange('phoneResiding', e.target.value)}
                          className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Photo</label>
                      <div className="flex gap-2">
                        <label className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 flex items-center gap-2">
                          <Upload size={16} />
                          Upload
                          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                        </label>
                        <button onClick={handleWebcamCapture} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2">
                          <Camera size={16} />
                          Webcam
                        </button>
                      </div>
                      {currentDevotee.photoBase64 && (
                        <img src={currentDevotee.photoBase64} alt="Devotee" className="mt-2 w-32 h-32 object-cover rounded" />
                      )}
                    </div>
                  </div>
                )}

                {/* Passport Details Tab */}
                {activeTab === 'passport' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Passport Number</label>
                        <input
                          type="text"
                          value={currentDevotee.passportNumber || ''}
                          onChange={(e) => handleFieldChange('passportNumber', e.target.value)}
                          className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Issuing Country</label>
                        <select
                          value={currentDevotee.passportIssuingCountry || ''}
                          onChange={(e) => handleFieldChange('passportIssuingCountry', e.target.value)}
                          className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                        >
                          <option value="">Select...</option>
                          {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Issue Date</label>
                        <input
                          type="date"
                          value={currentDevotee.passportIssuedDate || ''}
                          onChange={(e) => handleFieldChange('passportIssuedDate', e.target.value)}
                          className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Expiry Date</label>
                        <input
                          type="date"
                          value={currentDevotee.passportExpiryDate || ''}
                          onChange={(e) => handleFieldChange('passportExpiryDate', e.target.value)}
                          className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Place of Issue</label>
                        <input
                          type="text"
                          value={currentDevotee.passportPlaceOfIssue || ''}
                          onChange={(e) => handleFieldChange('passportPlaceOfIssue', e.target.value)}
                          className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Visa Details Tab */}
                {activeTab === 'visa' && (
                  <div className="space-y-4">
                    {isNepalese && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded text-blue-800 dark:text-blue-200">
                        No visa required for Nepalese citizens. Fields auto-populated with "0".
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Visa Number</label>
                        <input
                          type="text"
                          value={currentDevotee.visaNumber || ''}
                          onChange={(e) => handleFieldChange('visaNumber', e.target.value)}
                          disabled={isNepalese}
                          className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} ${isNepalese ? 'opacity-50' : ''}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Visa Type</label>
                        <input
                          type="text"
                          value={currentDevotee.visaType || ''}
                          onChange={(e) => handleFieldChange('visaType', e.target.value)}
                          disabled={isNepalese}
                          className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} ${isNepalese ? 'opacity-50' : ''}`}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Issuing Country</label>
                        <input
                          type="text"
                          value={currentDevotee.visaIssuingCountry || ''}
                          onChange={(e) => handleFieldChange('visaIssuingCountry', e.target.value)}
                          disabled={isNepalese}
                          className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} ${isNepalese ? 'opacity-50' : ''}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Issue Date</label>
                        <input
                          type="text"
                          value={currentDevotee.visaIssueDate || ''}
                          onChange={(e) => handleFieldChange('visaIssueDate', e.target.value)}
                          disabled={isNepalese}
                          className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} ${isNepalese ? 'opacity-50' : ''}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Expiry Date</label>
                        <input
                          type="text"
                          value={currentDevotee.visaExpiryDate || ''}
                          onChange={(e) => handleFieldChange('visaExpiryDate', e.target.value)}
                          disabled={isNepalese}
                          className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} ${isNepalese ? 'opacity-50' : ''}`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Arrival Information Tab */}
                {activeTab === 'arrival' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Visit Records</h3>
                      <button onClick={handleNewVisit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
                        <Plus size={16} />
                        New Visit
                      </button>
                    </div>

                    {currentDevotee.visits.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No visits recorded. Click "New Visit" to add one.
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-2 mb-4">
                          {currentDevotee.visits.map((visit, idx) => (
                            <button
                              key={visit.visitId}
                              onClick={() => setCurrentVisitIndex(idx)}
                              className={`px-4 py-2 rounded ${
                                currentVisitIndex === idx
                                  ? 'bg-blue-600 text-white'
                                  : `${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`
                              }`}
                            >
                              Visit {idx + 1}
                            </button>
                          ))}
                        </div>

                        {currentDevotee.visits[currentVisitIndex] && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">Ashram</label>
                                <select
                                  value={currentDevotee.visits[currentVisitIndex].ashram}
                                  onChange={(e) => handleVisitFieldChange('ashram', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                                >
                                  <option value="">Select...</option>
                                  {ASHRAMS.map(a => <option key={a}>{a}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Phone in India</label>
                                <input
                                  type="tel"
                                  value={currentDevotee.visits[currentVisitIndex].phoneInIndia}
                                  onChange={(e) => handleVisitFieldChange('phoneInIndia', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1">Ashram Address</label>
                              <textarea
                                value={currentDevotee.visits[currentVisitIndex].ashramAddress}
                                onChange={(e) => handleVisitFieldChange('ashramAddress', e.target.value)}
                                rows={2}
                                className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">Arrived From Country</label>
                                <select
                                  value={currentDevotee.visits[currentVisitIndex].arrivedFromCountry}
                                  onChange={(e) => handleVisitFieldChange('arrivedFromCountry', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                                >
                                  {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Arrived From City</label>
                                <input
                                  type="text"
                                  value={currentDevotee.visits[currentVisitIndex].arrivedFromCity}
                                  onChange={(e) => handleVisitFieldChange('arrivedFromCity', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">Date Arrived in India</label>
                                <input
                                  type="date"
                                  value={currentDevotee.visits[currentVisitIndex].dateArrivedInIndia}
                                  onChange={(e) => handleVisitFieldChange('dateArrivedInIndia', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Date Arrived in Ashram</label>
                                <input
                                  type="date"
                                  value={currentDevotee.visits[currentVisitIndex].dateArrivedInAshram}
                                  onChange={(e) => handleVisitFieldChange('dateArrivedInAshram', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Time Arrived</label>
                                <input
                                  type="time"
                                  value={currentDevotee.visits[currentVisitIndex].timeArrivedInAshram}
                                  onChange={(e) => handleVisitFieldChange('timeArrivedInAshram', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">Expected Departure Date</label>
                                <input
                                  type="date"
                                  value={currentDevotee.visits[currentVisitIndex].expectedDateOfDeparture}
                                  onChange={(e) => handleVisitFieldChange('expectedDateOfDeparture', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Intended Days</label>
                                <input
                                  type="number"
                                  value={currentDevotee.visits[currentVisitIndex].intendedDaysInAshram}
                                  onChange={(e) => handleVisitFieldChange('intendedDaysInAshram', parseInt(e.target.value))}
                                  className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1">Next Destination Inside India?</label>
                              <select
                                value={currentDevotee.visits[currentVisitIndex].nextDestinationInsideIndia ? 'yes' : 'no'}
                                onChange={(e) => handleVisitFieldChange('nextDestinationInsideIndia', e.target.value === 'yes')}
                                className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                              >
                                <option value="no">No</option>
                                <option value="yes">Yes</option>
                              </select>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">Next Destination Country</label>
                                <select
                                  value={currentDevotee.visits[currentVisitIndex].nextDestinationCountry}
                                  onChange={(e) => handleVisitFieldChange('nextDestinationCountry', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                                >
                                  <option value="">Select...</option>
                                  {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Next Destination City</label>
                                <input
                                  type="text"
                                  value={currentDevotee.visits[currentVisitIndex].nextDestinationCity}
                                  onChange={(e) => handleVisitFieldChange('nextDestinationCity', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Next Destination Place</label>
                                <input
                                  type="text"
                                  value={currentDevotee.visits[currentVisitIndex].nextDestinationPlace}
                                  onChange={(e) => handleVisitFieldChange('nextDestinationPlace', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                                />
                              </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                              <button
                                onClick={() => {
                                  const visits = currentDevotee.visits.filter((_, i) => i !== currentVisitIndex);
                                  setCurrentDevotee({ ...currentDevotee, visits });
                                  setCurrentVisitIndex(Math.max(0, currentVisitIndex - 1));
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
                              >
                                <Trash2 size={16} />
                                Delete Visit
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2">
                <Save size={16} />
                Save Changes
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2">
                <Trash2 size={16} />
                Delete Devotee
              </button>
              <button onClick={handlePrintFormC} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
                <Printer size={16} />
                Print Form C
              </button>
              <button onClick={handleUploadToFormC} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2">
                <Chrome size={16} />
                Upload to Form C
              </button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Search */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
              <h3 className="font-medium mb-3">Devotee Lookup</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by ID or name..."
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                />
                <button className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  <Search size={20} />
                </button>
              </div>
              <button onClick={() => setShowDevoteeList(!showDevoteeList)} className="mt-3 w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center justify-center gap-2">
                <RefreshCw size={16} />
                View All Devotees
              </button>
            </div>

            {/* Devotee List */}
            {showDevoteeList && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4 max-h-96 overflow-y-auto`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">Devotee List</h3>
                  <button onClick={() => setShowDevoteeList(false)}>
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-2">
                  {devotees.filter(d => 
                    searchId === '' || 
                    d.id.toString().includes(searchId) ||
                    `${d.firstName} ${d.lastName}`.toLowerCase().includes(searchId.toLowerCase())
                  ).map(devotee => (
                    <button
                      key={devotee.id}
                      onClick={() => {
                        setCurrentDevotee(devotee);
                        setShowDevoteeList(false);
                        setCurrentVisitIndex(0);
                      }}
                      className={`w-full text-left p-3 rounded ${
                        currentDevotee?.id === devotee.id
                          ? 'bg-blue-600 text-white'
                          : `${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`
                      }`}
                    >
                      <div className="font-medium">
                        {devotee.firstName} {devotee.lastName}
                      </div>
                      <div className="text-sm opacity-75">
                        ID: {devotee.id} • {devotee.nationality}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
              <h3 className="font-medium mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button onClick={handleNewDevotee} className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
                  <Plus size={16} />
                  New Devotee
                </button>
                <button className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-2">
                  <Download size={16} />
                  Export CSV
                </button>
                <button className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-2">
                  <Upload size={16} />
                  Import CSV
                </button>
              </div>
            </div>

            {/* Current Devotee Info */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
              <h3 className="font-medium mb-3">Current Devotee</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">ID:</span> {currentDevotee.id}</div>
                <div><span className="font-medium">Name:</span> {currentDevotee.firstName} {currentDevotee.lastName}</div>
                <div><span className="font-medium">Nationality:</span> {currentDevotee.nationality}</div>
                <div><span className="font-medium">Visits:</span> {currentDevotee.visits.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormCApp;