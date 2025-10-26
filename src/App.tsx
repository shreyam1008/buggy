import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';
import { Layout } from './components/layout';
import { ScrollToTop } from './components/ScrollToTop';
import { ToastProvider } from './hooks/useToast';
import { Dashboard } from './features/dashboard';
import { AddDevoteeEnhanced } from './features/devotee';
import { BulkEntryImproved } from './features/bulk-entry';
import { PersonProfile } from './features/person-profile';
import { SearchView } from './features/search';
import { Drafts } from './features/drafts';
import { Exits } from './features/exits';
import { Tools } from './features/tools';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/add-devotee" element={<AddDevoteeEnhanced />} />
              <Route path="/bulk-entry" element={<BulkEntryImproved />} />
              <Route path="/search" element={<SearchView />} />
              <Route path="/person/:personId" element={<PersonProfile />} />
              <Route path="/drafts" element={<Drafts />} />
              <Route path="/exits" element={<Exits />} />
              <Route path="/tools" element={<Tools />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
