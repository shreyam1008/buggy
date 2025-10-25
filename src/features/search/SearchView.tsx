import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, RefreshCw, ChevronRight, X, ArrowUpDown } from 'lucide-react';
import { Button, Card, Select } from '../../components/ui';
import { mockAPI } from '../../services/api';
import { fuzzyMatch } from '../../utils/fuzzySearch';
import { NATIONALITIES } from '../../config/constants';
import type { Visit } from '../../types';

export function SearchView() {
  const navigate = useNavigate();
  
  // Fetch all residents
  const { data: residents, isLoading } = useQuery({
    queryKey: ['currentResidents'],
    queryFn: () => mockAPI.getCurrentResidents(),
  });

  // Search filters
  const [nameQuery, setNameQuery] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [generalQuery, setGeneralQuery] = useState('');
  const [formCStatus, setFormCStatus] = useState('');
  
  // Sorting
  const [sortField, setSortField] = useState<string>('arrivalDateTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Add country to selection
  const addCountry = (country: string) => {
    if (country && !selectedCountries.includes(country)) {
      setSelectedCountries([...selectedCountries, country]);
    }
  };

  // Remove country from selection
  const removeCountry = (country: string) => {
    setSelectedCountries(selectedCountries.filter(c => c !== country));
  };

  // Clear all countries
  const clearAllCountries = () => {
    setSelectedCountries([]);
  };

  // Filtered and sorted residents
  const filteredResidents = useMemo(() => {
    if (!residents) return [];
    
    let filtered = [...residents];

    // Name search (fuzzy)
    if (nameQuery.trim()) {
      filtered = filtered.filter(r => {
        const fullName = `${r.person?.givenName || ''} ${r.person?.familyName || ''}`.toLowerCase();
        return fuzzyMatch(fullName, nameQuery);
      });
    }

    // Country filter (multiple selection)
    if (selectedCountries.length > 0) {
      filtered = filtered.filter(r => 
        selectedCountries.includes(r.person?.nationality || '')
      );
    }

    // General search (fuzzy - ID, contact, email, etc.)
    if (generalQuery.trim()) {
      filtered = filtered.filter(r => {
        const searchFields = [
          r.person?.id || '',
          r.person?.contact || '',
          r.person?.email || '',
          r.person?.identities?.[0]?.idNumber || '',
          r.purpose || '',
          r.arrivalLocation || '',
        ].map(f => f.toLowerCase());
        
        return searchFields.some(field => fuzzyMatch(field, generalQuery));
      });
    }

    // Form-C Status filter
    if (formCStatus) {
      filtered = filtered.filter(r => (r as any).formCStatus === formCStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch(sortField) {
        case 'name':
          aVal = `${a.person?.givenName} ${a.person?.familyName}`;
          bVal = `${b.person?.givenName} ${b.person?.familyName}`;
          break;
        case 'id':
          aVal = a.person?.id || '';
          bVal = b.person?.id || '';
          break;
        case 'nationality':
          aVal = a.person?.nationality || '';
          bVal = b.person?.nationality || '';
          break;
        case 'arrivalDateTime':
          aVal = new Date(a.arrivalDateTime).getTime();
          bVal = new Date(b.arrivalDateTime).getTime();
          break;
        case 'plannedDeparture':
          aVal = new Date(a.plannedDeparture).getTime();
          bVal = new Date(b.plannedDeparture).getTime();
          break;
        default:
          return 0;
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [residents, nameQuery, selectedCountries, generalQuery, formCStatus, sortField, sortOrder]);

  const clearAllFilters = () => {
    setNameQuery('');
    setSelectedCountries([]);
    setGeneralQuery('');
    setFormCStatus('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Search & Browse Residents</h1>
          <p className="text-gray-600 mt-1">Find devotees using advanced filters</p>
        </div>
        <Button variant="secondary" onClick={clearAllFilters}>
          Clear All Filters
        </Button>
      </div>

      {/* Search Filters */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Filters</h2>
        
        <div className="space-y-4">
          {/* Name Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Name (Fuzzy Search)
            </label>
            <input
              type="text"
              placeholder="Type name... (e.g., 'john', 'jhn', 'jon')"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Fuzzy search allows approximate matching - finds results even with typos
            </p>
          </div>

          {/* Country Multi-Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Countries (Multiple Selection)
            </label>
            <div className="flex gap-2">
              <Select
                label=""
                options={[
                  { value: '', label: 'Select a country...' },
                  ...NATIONALITIES.filter(n => !selectedCountries.includes(n)).map((n) => ({ value: n, label: n })),
                ]}
                value=""
                onChange={(e) => addCountry(e.target.value)}
              />
              {selectedCountries.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={clearAllCountries}
                >
                  Clear All
                </Button>
              )}
            </div>
            
            {/* Selected Countries Tags */}
            {selectedCountries.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedCountries.map((country) => (
                  <span
                    key={country}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {country}
                    <button
                      onClick={() => removeCountry(country)}
                      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                      title={`Remove ${country}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* General Search */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by ID / Contact / Email
              </label>
              <input
                type="text"
                placeholder="Phone, email, ID number, purpose..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={generalQuery}
                onChange={(e) => setGeneralQuery(e.target.value)}
              />
            </div>

            <div>
              <Select
                label="Form-C Status"
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Submitted', label: 'Submitted' },
                ]}
                value={formCStatus}
                onChange={(e) => setFormCStatus(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Results ({filteredResidents.length} of {residents?.length || 0})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    if (sortField === 'id') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('id');
                      setSortOrder('asc');
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    Devotee ID
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    if (sortField === 'name') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('name');
                      setSortOrder('asc');
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    Name
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    if (sortField === 'nationality') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('nationality');
                      setSortOrder('asc');
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    Nationality
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    if (sortField === 'arrivalDateTime') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('arrivalDateTime');
                      setSortOrder('desc');
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    Arrival
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    if (sortField === 'plannedDeparture') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('plannedDeparture');
                      setSortOrder('asc');
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    Departure
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Form-C
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredResidents.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/person/${r.personId}`)}
                      className="text-blue-600 hover:text-blue-700 font-mono text-sm font-medium"
                    >
                      {r.person?.id}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={r.photo?.thumbnailData}
                        alt={r.person?.givenName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <button
                          onClick={() => navigate(`/person/${r.personId}`)}
                          className="font-medium text-blue-600 hover:text-blue-700 text-left"
                        >
                          {r.person?.givenName} {r.person?.familyName}
                        </button>
                        <p className="text-sm text-gray-500">
                          {r.person?.contact}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {r.person?.nationality}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(r.arrivalDateTime).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(r.plannedDeparture).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (r as any).formCStatus === 'Submitted'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {(r as any).formCStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      onClick={() => navigate(`/person/${r.personId}`)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredResidents.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Results Found</h3>
            <p className="text-gray-500">
              Try adjusting your search filters or clear all filters to see all residents.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
