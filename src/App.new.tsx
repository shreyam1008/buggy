import React, { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';
import { Dashboard } from './features/dashboard';
import { AddDevotee } from './features/devotee';
import { BulkEntry } from './features/bulk-entry';
import { PersonProfile } from './features/person-profile';
import { SearchView } from './features/search';

function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
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
        ) : (
          <Dashboard onNavigate={handleNavigate} />
        );
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
