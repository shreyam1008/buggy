import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';
import { Layout } from './components/layout';
import { Dashboard } from './features/dashboard';
import { AddDevotee } from './features/devotee';
import { BulkEntryImproved } from './features/bulk-entry';
import { PersonProfile } from './features/person-profile';
import { SearchView } from './features/search';
import { Drafts } from './features/drafts';
import { Exits } from './features/exits';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-devotee" element={<AddDevotee />} />
            <Route path="/bulk-entry" element={<BulkEntryImproved />} />
            <Route path="/search" element={<SearchView />} />
            <Route path="/person/:personId" element={<PersonProfile />} />
            <Route path="/drafts" element={<Drafts />} />
            <Route path="/exits" element={<Exits />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
