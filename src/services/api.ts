// ============================================================================
// MOCK API SERVICE
// ============================================================================

import type {
  Person,
  Visit,
  Photo,
  FormCSubmission,
  DashboardStats,
  Draft,
  User,
} from '../types';
import { generateDummyData } from './mockData';

// Mock database
let mockDB = generateDummyData(100);
let drafts: Draft[] = [];
export let currentUser: User = {
  username: 'admin',
  role: 'Admin',
  permissions: {
    canCreate: true,
    canEditPerson: true,
    canDelete: true,
    canSubmitFormC: true,
    canExport: true,
    canCheckOut: true,
  },
};

// Utility to simulate network errors (for testing)
const simulateNetworkError = (shouldError = false) => {
  if (shouldError && Math.random() < 0.1) { // 10% chance of error
    throw new Error('Network connection error. Please check your internet connection.');
  }
};

// Utility to add timeout to promises
const withTimeout = <T>(promise: Promise<T>, timeoutMs = 10000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout. Please try again.')), timeoutMs)
    ),
  ]);
};

// Mock API functions
export const mockAPI = {
  async getDashboardStats(): Promise<DashboardStats> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    simulateNetworkError(false);
    const currentVisits = mockDB.visits.filter((v) => !v.actualDeparture);
    const pendingFormC = currentVisits.filter(
      (v) =>
        !mockDB.formCSubmissions.find((fc) => fc.visitId === v.id && fc.submitted)
    );
    const today = new Date().toISOString().split('T')[0];
    const todayArrivals = mockDB.visits.filter(
      (v) => v.arrivalDateTime.split('T')[0] === today
    );
    const todayDepartures = mockDB.visits.filter(
      (v) => v.plannedDeparture?.split('T')[0] === today && !v.actualDeparture
    );

    return {
      currentOccupancy: currentVisits.length,
      pendingFormC: pendingFormC.length,
      drafts: drafts.length,
      todayArrivals: todayArrivals.length,
      todayDepartures: todayDepartures.length,
    };
  },

  async getCurrentResidents(
    filters: { nationality?: string; formCStatus?: string } = {}
  ): Promise<Visit[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    let residents = mockDB.visits
      .filter((v) => !v.actualDeparture)
      .map((v) => ({
        ...v,
        person: mockDB.persons.find((p) => p.id === v.personId),
        formCStatus: mockDB.formCSubmissions.find((fc) => fc.visitId === v.id)
          ?.submitted
          ? ('Submitted' as const)
          : ('Pending' as const),
        photo: mockDB.photos.find((ph) => ph.visitId === v.id),
      }));

    if (filters.nationality) {
      residents = residents.filter(
        (r) => r.person?.nationality === filters.nationality
      );
    }
    if (filters.formCStatus) {
      residents = residents.filter((r) => r.formCStatus === filters.formCStatus);
    }

    return residents;
  },

  async getAllVisits(): Promise<Visit[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockDB.visits.map((v) => ({
      ...v,
      person: mockDB.persons.find((p) => p.id === v.personId),
      formCStatus: mockDB.formCSubmissions.find((fc) => fc.visitId === v.id)
        ?.submitted
        ? ('Submitted' as const)
        : ('Pending' as const),
      photo: mockDB.photos.find((ph) => ph.visitId === v.id),
    }));
  },

  async searchPersons(query: string): Promise<Person[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const lowerQuery = query.toLowerCase();
    return mockDB.persons.filter(
      (p) =>
        p.givenName.toLowerCase().includes(lowerQuery) ||
        p.familyName.toLowerCase().includes(lowerQuery) ||
        p.contact?.includes(query) ||
        p.identities?.some((id) =>
          id.idNumber.toLowerCase().includes(lowerQuery)
        )
    );
  },

  async getPerson(id: string): Promise<Person> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const person = mockDB.persons.find((p) => p.id === id);
    if (!person) throw new Error('Person not found');
    
    const visits = mockDB.visits
      .filter((v) => v.personId === id)
      .map((v) => ({
        ...v,
        photo: mockDB.photos.find((ph) => ph.visitId === v.id),
        formC: mockDB.formCSubmissions.find((fc) => fc.visitId === v.id),
      }));
    return { ...person, visits };
  },

  async createPerson(data: Omit<Person, 'id'>): Promise<Person> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const newPerson: Person = {
      id: `P${String(mockDB.persons.length + 1).padStart(4, '0')}`,
      ...data,
    };
    mockDB.persons.push(newPerson);
    return newPerson;
  },

  async createVisit(data: Omit<Visit, 'id'>): Promise<Visit> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const newVisit: Visit = {
      id: `V${String(mockDB.visits.length + 1).padStart(4, '0')}`,
      ...data,
    };
    mockDB.visits.push(newVisit);
    return newVisit;
  },

  async createPhoto(data: Omit<Photo, 'id'>): Promise<Photo> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const newPhoto: Photo = {
      id: `PH${String(mockDB.photos.length + 1).padStart(4, '0')}`,
      ...data,
    };
    mockDB.photos.push(newPhoto);
    return newPhoto;
  },

  async updateVisit(id: string, data: Partial<Visit>): Promise<Visit> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const index = mockDB.visits.findIndex((v) => v.id === id);
    if (index !== -1) {
      mockDB.visits[index] = { ...mockDB.visits[index], ...data };
      return mockDB.visits[index];
    }
    throw new Error('Visit not found');
  },

  async submitFormC(
    visitId: string,
    govIdNumber: string
  ): Promise<FormCSubmission> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const newFormC: FormCSubmission = {
      id: `FC${String(mockDB.formCSubmissions.length + 1).padStart(4, '0')}`,
      visitId,
      submitted: true,
      govIdNumber,
      govSubmissionDate: new Date().toISOString(),
      govResponse: 'Approved',
    };
    mockDB.formCSubmissions.push(newFormC);
    return newFormC;
  },

  async saveDraft(data: any): Promise<Draft> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const draft: Draft = {
      id: `D${String(drafts.length + 1).padStart(4, '0')}`,
      ...data,
      savedAt: new Date().toISOString(),
    };
    drafts.push(draft);
    return draft;
  },

  async getDrafts(): Promise<Draft[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return drafts;
  },

  async deleteDraft(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    drafts = drafts.filter((d) => d.id !== id);
  },

  async generateMoreData(count: number): Promise<{ message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newData = generateDummyData(count);
    mockDB.persons.push(...newData.persons);
    mockDB.visits.push(...newData.visits);
    mockDB.photos.push(...newData.photos);
    mockDB.formCSubmissions.push(...newData.formCSubmissions);
    return { message: `Generated ${count} new records` };
  },
};
