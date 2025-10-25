# Migration Guide: Project Reorganization

## Overview

This project has been reorganized following modern React best practices with a feature-based architecture. This guide explains the new structure and how to complete the migration.

## What's Been Done ✅

### 1. **New Folder Structure Created**
```
src/
├── components/ui/          ✅ Base UI components extracted
├── components/features/    ✅ PhotoUploadEditor extracted
├── features/dashboard/     ✅ Dashboard feature module created
├── services/               ✅ API and mock data services
├── utils/                  ✅ Image compression utility
├── types/                  ✅ TypeScript definitions
├── config/                 ✅ Constants and configuration
└── hooks/                  ✅ Ready for custom hooks
```

### 2. **Components Extracted**
- ✅ `Button` - Fully typed, reusable
- ✅ `Input` - With label and error support
- ✅ `Select` - Dropdown component
- ✅ `Card` - Container component
- ✅ `Modal` - Dialog component
- ✅ `StatCard` - Dashboard statistics card
- ✅ `PhotoUploadEditor` - Complete photo upload feature

### 3. **Services Created**
- ✅ `mockAPI` - All API functions with proper typing
- ✅ `generateDummyData` - Data generation utility
- ✅ `compressImage` - Image processing utility

### 4. **Configuration**
- ✅ `constants.ts` - All application constants
- ✅ `queryClient.ts` - React Query configuration
- ✅ `types/index.ts` - Centralized type definitions

### 5. **Features Implemented**
- ✅ Dashboard - Fully migrated with new structure

## What Needs To Be Done 📋

### Phase 1: Extract Remaining Features

#### 1. AddSingleDevotee Feature
**Location**: `src/features/devotee/AddDevotee.tsx`

**Steps**:
1. Create `src/features/devotee/AddDevotee.tsx`
2. Move the AddSingleDevotee component
3. Update imports to use new structure:
   ```typescript
   import { Button, Card, Input, Select } from '@/components/ui';
   import { PhotoUploadEditor } from '@/components/features';
   import { mockAPI } from '@/services/api';
   import { NATIONALITIES, PURPOSES, LOCATIONS, ID_TYPES } from '@/config/constants';
   ```
4. Export via `src/features/devotee/index.ts`

#### 2. BulkEntry Feature
**Location**: `src/features/bulk-entry/BulkEntry.tsx`

**Steps**:
1. Create `src/features/bulk-entry/BulkEntry.tsx`
2. Extract BulkEntry component
3. Update imports
4. Export via `src/features/bulk-entry/index.ts`

#### 3. PersonProfile Feature
**Location**: `src/features/person-profile/PersonProfile.tsx`

**Steps**:
1. Create `src/features/person-profile/PersonProfile.tsx`
2. Extract PersonProfile component
3. Update imports
4. Export via `src/features/person-profile/index.ts`

#### 4. SearchView Feature
**Location**: `src/features/search/SearchView.tsx`

**Steps**:
1. Create `src/features/search/SearchView.tsx`
2. Extract SearchView component
3. Update imports
4. Export via `src/features/search/index.ts`

### Phase 2: Update Main App

**File**: `src/App.tsx`

Replace current App.tsx with:
```typescript
import React, { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';
import { Dashboard } from './features/dashboard';
import { AddDevotee } from './features/devotee';
import { BulkEntry } from './features/bulk-entry';
import { PersonProfile } from './features/person-profile';
import { SearchView } from './features/search';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  const handleNavigate = (view: string, id?: string) => {
    setCurrentView(view);
    if (id) setSelectedPersonId(id);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'addSingle':
        return <AddDevotee onNavigate={handleNavigate} />;
      case 'bulkEntry':
        return <BulkEntry onNavigate={handleNavigate} />;
      case 'person':
        return selectedPersonId ? (
          <PersonProfile personId={selectedPersonId} onNavigate={handleNavigate} />
        ) : <Dashboard onNavigate={handleNavigate} />;
      case 'search':
        return <SearchView onNavigate={handleNavigate} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderView()}
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
```

### Phase 3: Path Aliases (Optional but Recommended)

**File**: `tsconfig.json`

Add path aliases for cleaner imports:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/features/*": ["src/features/*"],
      "@/services/*": ["src/services/*"],
      "@/utils/*": ["src/utils/*"],
      "@/types/*": ["src/types/*"],
      "@/config/*": ["src/config/*"],
      "@/hooks/*": ["src/hooks/*"]
    }
  }
}
```

**File**: `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

## Benefits of New Structure

### 1. **Maintainability**
- Clear separation of concerns
- Easy to locate and modify code
- Reduced file size (components are now 50-200 lines instead of 1600+)

### 2. **Scalability**
- Add new features without touching existing code
- Feature modules are self-contained
- Easy to add new team members

### 3. **Reusability**
- UI components can be used across features
- Services are centralized and consistent
- Types ensure consistency

### 4. **Testing**
- Easier to write unit tests for isolated components
- Mock services for testing
- Test features independently

### 5. **Performance**
- Potential for code splitting by feature
- Lazy loading of routes
- Better tree-shaking

## Testing the Migration

### Step 1: Verify Dashboard
```bash
npm run dev
```
- Dashboard should load correctly
- All stats should display
- Filters should work
- Table should show residents

### Step 2: Test Navigation
- Click "Add Devotee" (will use old component temporarily)
- Verify form works
- Test photo upload with new PhotoUploadEditor

### Step 3: Gradual Migration
- Extract one feature at a time
- Test after each extraction
- Keep old App.tsx as backup (rename to App.old.tsx)

## Rollback Plan

If issues arise:
1. Rename `App.tsx` to `App.new.tsx`
2. Rename `Appold.tsx` to `App.tsx`
3. Application will work with old structure
4. Debug new structure separately

## Next Steps

1. ✅ Review this migration guide
2. ⏳ Extract AddDevotee feature
3. ⏳ Extract BulkEntry feature
4. ⏳ Extract PersonProfile feature
5. ⏳ Extract SearchView feature
6. ⏳ Update main App.tsx
7. ⏳ Add path aliases
8. ⏳ Delete old App.tsx
9. ⏳ Add tests
10. ⏳ Update documentation

## Questions or Issues?

Refer to `PROJECT_STRUCTURE.md` for detailed architecture documentation.
