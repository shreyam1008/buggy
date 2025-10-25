import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RefreshCw, ChevronRight } from 'lucide-react';
import { Button, Card } from '../../components/ui';
import { mockAPI } from '../../services/api';
import type { Person } from '../../types';

export function SearchView() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Person[]>([]);
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
            {isSearching ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            Search
          </Button>
        </div>
      </Card>

      {searchResults.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Results ({searchResults.length})
          </h2>
          <div className="space-y-2">
            {searchResults.map((person) => (
              <div
                key={person.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors border border-transparent hover:border-blue-200"
                onClick={() => navigate(`/person/${person.id}`)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {person.givenName[0]}
                    {person.familyName[0]}
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-1">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {person.givenName} {person.familyName}
                      </h3>
                      <p className="text-sm text-gray-500 font-mono">
                        ID: {person.id}
                      </p>
                    </div>
                    <div className="text-sm space-y-1">
                      <p className="text-gray-700">
                        <span className="font-medium">Country:</span> {person.nationality}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">ID No:</span>{' '}
                        {person.identities?.[0]?.idNumber || 'N/A'}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Phone:</span> {person.contact || 'N/A'}
                      </p>
                    </div>
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
