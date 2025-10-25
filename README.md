# Form-C Management System

A modern, full-featured web application for managing devotee registrations, visits, and Form-C compliance at ashrams and religious institutions.

## 🎯 Overview

The Form-C Management System streamlines the process of registering visitors, tracking their stays, managing identity documents, and maintaining compliance with Form-C requirements. Built with React, TypeScript, and modern web technologies.

## ✨ Key Features

### 📋 Devotee Management
- **Single Entry Form**: Accordion-style form with collapsible sections
- **Auto-Save Drafts**: Never lose work - forms auto-save every 30 seconds
- **Fill in Any Order**: Complete sections as information becomes available
- **Visual Progress**: Real-time validation with completion indicators
- **Photo Upload**: Webcam capture or file upload with automatic compression
- **BS Date Support**: Bikram Sambat date picker for DOB and document dates

### 📊 Bulk Entry
- **Excel Import**: Upload .xlsx files with devotee data
- **Template Download**: Pre-formatted Excel template provided
- **Visual Validation**: Green highlighting for valid entries
- **Batch Processing**: Add 50+ devotees in one operation
- **Shared Fields**: Set common values (arrival date, location) for all entries

### 🔍 Search & Filter
- **Multi-Field Search**: Search by name, ID, contact, or passport
- **Advanced Filters**: Filter by nationality, Form-C status
- **Sortable Columns**: Click headers to sort by any field
- **Real-Time Results**: Instant filtering as you type

### 📈 Dashboard
- **Live Statistics**: Current occupancy, pending Form-C, drafts
- **Today's Activity**: Arrivals and departures for today
- **Clickable Metrics**: Filter data by clicking stat cards
- **Resident Table**: View all current residents with photos
- **Quick Actions**: Navigate to profiles, generate data

### 🚪 Exit Management
- **Overdue Tracking**: Red alerts for past departure dates
- **Today's Departures**: List of all devotees leaving today
- **Tomorrow Preview**: See upcoming departures
- **Date Search**: Find departures for any specific date
- **Quick Checkout**: One-click departure processing

### 👤 Person Profiles
- **Complete History**: View all visits and documents
- **Photo Gallery**: All uploaded photos with timestamps
- **Identity Documents**: Passport, citizenship, visa details
- **Visit Timeline**: Chronological visit history
- **Form-C Status**: Track submission status

### 🛠️ Tools
- **BS to AD Converter**: Convert Bikram Sambat dates to Anno Domini
- **AD to BS Converter**: Convert Anno Domini dates to Bikram Sambat
- **Quick Input**: Type digits without formatting (e.g., 20810115)
- **Live Conversion**: See results as you type

### 💾 Drafts Management
- **View All Drafts**: See all saved incomplete entries
- **Resume Editing**: Continue from where you left off
- **Delete Drafts**: Remove unwanted saved forms
- **Last Saved**: Timestamp for each draft

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd buggy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base components (Button, Input, Card, Modal, BSDatePicker)
│   ├── features/        # Feature-specific components (PhotoUploadEditor)
│   └── layout/          # Layout components (Sidebar, Layout)
│
├── features/            # Feature modules (domain-driven)
│   ├── dashboard/       # Dashboard with stats and resident list
│   ├── devotee/         # Add/Edit devotee forms
│   ├── bulk-entry/      # Bulk upload with Excel import
│   ├── person-profile/  # Individual person profiles
│   ├── search/          # Search functionality
│   ├── drafts/          # Draft management
│   ├── exits/           # Exit tracking and checkout
│   └── tools/           # Utility tools (BS/AD converter)
│
├── services/            # API and external services
│   ├── api.ts           # Mock API service
│   └── mockData.ts      # Data generation utilities
│
├── utils/               # Utility functions
│   └── imageCompression.ts  # Image processing
│
├── types/               # TypeScript type definitions
│   └── index.ts         # Centralized type exports
│
├── config/              # Configuration
│   ├── constants.ts     # App constants (nationalities, purposes, etc.)
│   └── queryClient.ts   # React Query configuration
│
├── App.tsx              # Main application with routing
├── main.tsx             # Application entry point
└── index.css            # Global styles (Tailwind)
```

## 🎨 Tech Stack

### Core
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing

### State Management
- **TanStack Query (React Query)** - Server state management
- **React Hooks** - Local state management

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Icon library
- **React Image Crop** - Image cropping
- **React Webcam** - Webcam capture

### Data & Files
- **XLSX** - Excel file import/export
- **Nepali Date Converter** - BS/AD date conversion

### Development
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting

## 📖 Usage Guide

### Adding a Single Devotee

1. Click **"Add Devotee"** from Dashboard
2. Fill in sections (any order):
   - **Basic Details**: Name, DOB, gender, nationality
   - **Permanent Address**: Street, city, state, country
   - **Contact**: Phone and email
   - **Identity Document**: Type, number, expiry
   - **Visa Details**: For non-Nepali nationals
   - **Visit Details**: Arrival, room, purpose
   - **Photo**: Optional photo upload
3. Click **BS button** next to date fields for Bikram Sambat input
4. Form auto-saves every 30 seconds
5. Click **"Submit Entry"** when complete

### Bulk Upload from Excel

1. Click **"Bulk Entry"** from Dashboard
2. Click **"Download Template"** to get Excel format
3. Fill Excel with devotee data
4. Click **"Import from Excel"**
5. Review imported data in table
6. Edit or delete rows as needed
7. Fill shared fields (arrival date, location)
8. Click **"Save X Devotees"**

### Using BS Date Converter

1. Click **"Tools"** from Dashboard
2. **BS to AD**: Type 20810115 (no formatting needed)
3. **AD to BS**: Type 01152025 or 150125
4. See instant conversion results

### Searching for Devotees

1. Use search box in Dashboard
2. Type name, ID, contact, or passport number
3. Or use dropdown filters for nationality/Form-C status
4. Click column headers to sort
5. Click devotee name or ID to view profile

### Managing Exits

1. Click **"Today Departures"** stat card or navigate to Exits
2. View overdue departures (red alerts)
3. See today's and tomorrow's departures
4. Search by specific date
5. Click **"Checkout"** to process departure

## 🔧 Configuration

### Draft Auto-Save Interval

Edit `src/features/devotee/AddDevoteeEnhanced.tsx`:
```typescript
const interval = setInterval(() => {
  saveDraft();
}, 30000); // Change to adjust frequency (milliseconds)
```

### Nationalities & Constants

Edit `src/config/constants.ts`:
```typescript
export const NATIONALITIES = ['Nepal', 'India', 'USA', ...];
export const PURPOSES = ['Pilgrimage', 'Retreat', ...];
export const LOCATIONS = ['Main Gate', 'Side Entrance', ...];
```

### Mock Data Generation

Edit `src/services/mockData.ts` to customize generated data.

## 🎯 Key Features in Detail

### Auto-Save Drafts
- Saves to browser localStorage
- Includes all form data and photos
- Persists across browser sessions
- Shows last saved timestamp
- Manual save with "Save Draft" button

### BS Date Picker
- Modal-based date input
- Accepts YYYY/MM/DD format
- Real-time conversion to AD
- Pre-fills from existing AD dates
- Validates date ranges (1970-2100 BS)

### Excel Import
- Supports .xlsx and .xls files
- Flexible column name matching
- Handles both "Given Name" and "givenName"
- Validates required fields
- Shows import errors clearly

### Visual Validation
- Green checkmarks for complete sections
- Red alerts for errors
- Green row highlighting for valid entries
- Real-time field validation
- Clear error messages

### Photo Management
- Webcam capture or file upload
- Automatic compression to <50KB
- Crop and adjust before saving
- Preview before submission
- Thumbnail generation

## 🐛 Troubleshooting

### Draft Not Loading
- Check if localStorage is enabled in browser
- Clear browser cache
- Check browser console for errors

### Excel Import Fails
- Ensure file is .xlsx or .xls format
- Use provided template for correct format
- Check for special characters in data
- Verify column names match template

### BS Date Conversion Issues
- Ensure dates are within 1970-2100 BS range
- Check month is 1-12, day is 1-32
- Verify you're using correct format (YYYYMMDD)

### Photo Upload Problems
- Check file size (should be <10MB before compression)
- Ensure browser supports webcam (HTTPS required)
- Try different image format (JPG, PNG)
- Clear browser cache

## 🔐 Data Storage

### LocalStorage
- **Drafts**: Stored in `devotee_form_draft`
- **Size Limit**: ~5-10MB per browser
- **Persistence**: Until manually cleared
- **Privacy**: Stored locally, not sent to server

### Mock API
- Currently uses in-memory storage
- Data resets on page refresh
- For demo/development purposes
- Replace with real API for production

## 🚦 Performance

### Optimization
- React Query caching reduces API calls
- Image compression reduces bandwidth
- Lazy loading for routes (future)
- Memoization for expensive calculations

### Tested Limits
- **Bulk Upload**: Up to 100 rows tested
- **Residents Table**: 1000+ entries
- **Draft Storage**: ~50KB with photo
- **Search**: Instant with 1000+ records

## 🔮 Future Enhancements

- [ ] User authentication and roles
- [ ] Multi-language support (i18n)
- [ ] PDF generation for Form-C
- [ ] Data export to various formats(excel)

## 📄 License

This project is proprietary software for ashram management.

## 👥 Support

For issues or questions:
- Check this README first
- Review the troubleshooting section
- Contact the development team

## 🙏 Acknowledgments

Built with modern web technologies and best practices for ashram management needs.

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Status**: Active Development
