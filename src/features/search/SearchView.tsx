import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, RefreshCw, ChevronRight, X, ArrowUpDown } from 'lucide-react';
import { Button, Card, Select } from '../../components/ui';
import { mockAPI } from '../../services/api';
import { fuzzyMatch } from '../../utils/fuzzySearch';
import { NATIONALITIES } from '../../config/constants';

export function SearchView() {
  const navigate = useNavigate();
  
  // Search filters - DECLARE FIRST
  const [nameQuery, setNameQuery] = useState('');
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [generalQuery, setGeneralQuery] = useState('');
  const [formCStatus, setFormCStatus] = useState('');

  // Fetch all visits (Development: loads all data)
  const { data: visits = [], isLoading } = useQuery({
    queryKey: ['allVisits'],
    queryFn: mockAPI.getAllVisits,
  });
  
  // Map visits to residents with all needed data
  const residents = visits;
  
  // Sorting
  const [sortField, setSortField] = useState<string>('arrivalDateTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Handle name input with comma detection
  const handleNameInput = (value: string) => {
    setNameQuery(value);
    
    // Check if user typed a comma
    if (value.includes(',')) {
      const names = value.split(',').map(n => n.trim()).filter(n => n.length > 0);
      
      // Add new names that aren't already selected
      const newNames = names.filter(name => 
        !selectedNames.some(existing => existing.toLowerCase() === name.toLowerCase())
      );
      
      if (newNames.length > 0) {
        setSelectedNames([...selectedNames, ...newNames]);
        setNameQuery(''); // Clear input after adding
      }
    }
  };

  // Handle Enter key to add current name as tag
  const handleNameKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && nameQuery.trim()) {
      const name = nameQuery.trim();
      if (!selectedNames.some(n => n.toLowerCase() === name.toLowerCase())) {
        setSelectedNames([...selectedNames, name]);
        setNameQuery('');
      }
      e.preventDefault();
    }
  };

  // Remove name from selection
  const removeName = (name: string) => {
    setSelectedNames(selectedNames.filter(n => n !== name));
  };

  // Clear all names
  const clearAllNames = () => {
    setSelectedNames([]);
    setNameQuery('');
  };

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
    if (!residents || residents.length === 0) return [];
    
    let filtered = [...residents];

    // Name search - either from input or from selected names
    if (nameQuery.trim() || selectedNames.length > 0) {
      filtered = filtered.filter(r => {
        const fullName = `${r.person?.givenName || ''} ${r.person?.familyName || ''}`.toLowerCase();
        
        // If typing in input, use fuzzy search on that
        if (nameQuery.trim()) {
          return fuzzyMatch(fullName, nameQuery);
        }
        
        // If have selected name tags, match against any of them
        if (selectedNames.length > 0) {
          return selectedNames.some(name => fuzzyMatch(fullName, name));
        }
        
        return false;
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
  }, [residents, nameQuery, selectedNames, selectedCountries, generalQuery, formCStatus, sortField, sortOrder]);

  const clearAllFilters = () => {
    setNameQuery('');
    setSelectedNames([]);
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
          {/* Name Search with Multi-Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Name (Fuzzy Search - Multiple Names)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type name and press Enter or use comma... (e.g., 'john, smith, raj')"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={nameQuery}
                onChange={(e) => handleNameInput(e.target.value)}
                onKeyPress={handleNameKeyPress}
              />
              {selectedNames.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={clearAllNames}
                >
                  Clear All
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              💡 <strong>Pro tip:</strong> Type multiple names separated by commas (e.g., "John, Smith, Raj") or press Enter after each name. Fuzzy search works with typos!
            </p>
            
            {/* Selected Names Tags */}
            {selectedNames.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedNames.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                  >
                    {name}
                    <button
                      onClick={() => removeName(name)}
                      className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                      title={`Remove ${name}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
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
