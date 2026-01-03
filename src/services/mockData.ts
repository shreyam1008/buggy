// ============================================================================
// MOCK DATA GENERATOR
// ============================================================================

import type {
  Person,
  Visit,
  Photo,
  FormCSubmission,
} from '../types';
import {
  NATIONALITIES,
  NEPALI_GIVEN_NAMES,
  NEPALI_FAMILY_NAMES,
  INTERNATIONAL_GIVEN_NAMES,
  INTERNATIONAL_FAMILY_NAMES,
  PURPOSES,
  LOCATIONS,
} from '../config/constants';

export function generateDummyData(count: number = 100) {
  const persons: Person[] = [];
  const visits: Visit[] = [];
  const photos: Photo[] = [];
  const formCSubmissions: FormCSubmission[] = [];

  for (let i = 0; i < count; i++) {
    const personId = `P${String(i + 1).padStart(4, '0')}`;
    
    // 75% Nepali, 15% USA, 10% others
    const rand = Math.random();
    let nationality: string;
    let givenName: string;
    let familyName: string;
    
    if (rand < 0.75) {
      // 75% Nepali
      nationality = 'Nepal';
      givenName = NEPALI_GIVEN_NAMES[Math.floor(Math.random() * NEPALI_GIVEN_NAMES.length)];
      familyName = NEPALI_FAMILY_NAMES[Math.floor(Math.random() * NEPALI_FAMILY_NAMES.length)];
    } else if (rand < 0.90) {
      // 15% USA
      nationality = 'USA';
      givenName = INTERNATIONAL_GIVEN_NAMES[Math.floor(Math.random() * INTERNATIONAL_GIVEN_NAMES.length)];
      familyName = INTERNATIONAL_FAMILY_NAMES[Math.floor(Math.random() * INTERNATIONAL_FAMILY_NAMES.length)];
    } else {
      // 10% other countries
      const otherNationalities = NATIONALITIES.filter(n => n !== 'Nepal' && n !== 'USA');
      nationality = otherNationalities[Math.floor(Math.random() * otherNationalities.length)];
      givenName = INTERNATIONAL_GIVEN_NAMES[Math.floor(Math.random() * INTERNATIONAL_GIVEN_NAMES.length)];
      familyName = INTERNATIONAL_FAMILY_NAMES[Math.floor(Math.random() * INTERNATIONAL_FAMILY_NAMES.length)];
    }

    const person: Person = {
      id: personId,
      givenName,
      familyName,
      dob: new Date(
        1950 + Math.floor(Math.random() * 50),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      )
        .toISOString()
        .split('T')[0],
      gender: Math.random() > 0.5 ? 'Male' : 'Female',
      nationality,
      permanentAddress: `${
        Math.floor(Math.random() * 999) + 1
      } Street Name, City, ${nationality}`,
      contact: `+${Math.floor(Math.random() * 900000000) + 100000000}`,
      email: `devotee${i + 1}@example.com`,
      notes:
        Math.random() > 0.7 ? 'Regular visitor, prefers ground floor room' : '',
      identities: [
        {
          type: 'passport',
          idNumber: `${nationality.substring(0, 2).toUpperCase()}${
            Math.floor(Math.random() * 9000000) + 1000000
          }`,
          issuingCountry: nationality,
          expiryDate: new Date(
            2025 + Math.floor(Math.random() * 5),
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28) + 1
          )
            .toISOString()
            .split('T')[0],
        },
      ],
    };

    const visitId = `V${String(i + 1).padStart(4, '0')}`;
    const arrivalDate = new Date(2024, 9, Math.floor(Math.random() * 30) + 1);
    const plannedDays = Math.floor(Math.random() * 20) + 3;
    const isCurrentlyInAshram = Math.random() > 0.3;

    const visit: Visit = {
      id: visitId,
      personId,
      arrivalDateTime: arrivalDate.toISOString(),
      arrivalLocation: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
      temporaryAddress: `Room ${Math.floor(Math.random() * 200) + 1}, Building ${String.fromCharCode(
        65 + Math.floor(Math.random() * 5)
      )}`,
      plannedDeparture: new Date(
        arrivalDate.getTime() + plannedDays * 24 * 60 * 60 * 1000
      ).toISOString(),
      actualDeparture: isCurrentlyInAshram
        ? null
        : new Date(
            arrivalDate.getTime() + (plannedDays - 2) * 24 * 60 * 60 * 1000
          ).toISOString(),
      purpose: PURPOSES[Math.floor(Math.random() * PURPOSES.length)],
      host: 'Ashram Administration',
    };

    const photoId = `PH${String(i + 1).padStart(4, '0')}`;
    photos.push({
      id: photoId,
      personId,
      visitId,
      fileName: `photo_${personId}_${Date.now()}.jpg`,
      size: Math.floor(Math.random() * 40000) + 10000,
      mime: 'image/jpeg',
      thumbnailData: `data:image/svg+xml,${encodeURIComponent(
        `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#${Math.floor(
          Math.random() * 16777215
        ).toString(16)}"/><text x="50" y="55" text-anchor="middle" fill="white" font-size="14">${
          person.givenName[0]
        }${person.familyName[0]}</text></svg>`
      )}`,
    });

    const formCSubmitted = Math.random() > 0.4;
    if (formCSubmitted || !isCurrentlyInAshram) {
      formCSubmissions.push({
        id: `FC${String(i + 1).padStart(4, '0')}`,
        visitId,
        submitted: formCSubmitted,
        govIdNumber: formCSubmitted
          ? `GOV-${Math.floor(Math.random() * 900000) + 100000}`
          : null,
        govSubmissionDate: formCSubmitted
          ? new Date(arrivalDate.getTime() + 24 * 60 * 60 * 1000).toISOString()
          : null,
        govResponse: formCSubmitted ? 'Approved' : null,
      });
    }

    persons.push(person);
    visits.push(visit);
  }

  return { persons, visits, photos, formCSubmissions };
}
