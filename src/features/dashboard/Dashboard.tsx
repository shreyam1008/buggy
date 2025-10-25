import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  FileText,
  Save,
  Calendar,
  Clock,
  Plus,
  Download,
  RefreshCw,
  ChevronRight,
  ArrowUpDown,
  Search as SearchIcon,
  UserPlus,
  Upload,
  Wrench,
  BarChart3,
} from 'lucide-react';
import { Button, Card, StatCard, Select, Modal, Input } from '../../components/ui';
import { mockAPI } from '../../services/api';
import { NATIONALITIES } from '../../config/constants';

export function Dashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: mockAPI.getDashboardStats,
  });

  const { data: residents, isLoading: residentsLoading } = useQuery({
    queryKey: ['currentResidents'],
    queryFn: () => mockAPI.getCurrentResidents(),
  });

  const [filters, setFilters] = useState({ nationality: '', formCStatus: '', search: '' });
  const [sortField, setSortField] = useState<string>('arrivalDateTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateCount, setGenerateCount] = useState(50);
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: (count: number) => mockAPI.generateMoreData(count),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setShowGenerateModal(false);
    },
  });

  const filteredResidents = useMemo(() => {
    if (!residents) return [];
    let filtered = [...residents];
    
    // Apply filters
    if (filters.nationality) {
      filtered = filtered.filter(
        (r) => r.person?.nationality === filters.nationality
      );
    }
    if (filters.formCStatus) {
      filtered = filtered.filter((r) => r.formCStatus === filters.formCStatus);
    }
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter((r) => 
        r.person?.givenName.toLowerCase().includes(query) ||
        r.person?.familyName.toLowerCase().includes(query) ||
        r.person?.id.toLowerCase().includes(query) ||
        r.person?.contact?.includes(query)
      );
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
  }, [residents, filters, sortField, sortOrder]);

  if (statsLoading || residentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/add-devotee')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Devotee
          </Button>
          <Button onClick={() => navigate('/bulk-entry')} variant="secondary">
            <Users className="w-4 h-4" />
            Bulk Entry
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div onClick={() => setFilters({ ...filters, nationality: '', formCStatus: '', search: '' })} className="cursor-pointer">
          <StatCard
            icon={Users}
            label="Current Occupancy"
            value={stats?.currentOccupancy || 0}
            color="blue"
          />
        </div>
        <div onClick={() => setFilters({ ...filters, formCStatus: 'Pending' })} className="cursor-pointer">
          <StatCard
            icon={FileText}
            label="Pending Form-C"
            value={stats?.pendingFormC || 0}
            color="orange"
          />
        </div>
        <div onClick={() => navigate('/drafts')} className="cursor-pointer">
          <StatCard
            icon={Save}
            label="Drafts"
            value={stats?.drafts || 0}
            color="purple"
          />
        </div>
        <div className="cursor-pointer">
          <StatCard
            icon={Calendar}
            label="Today Arrivals"
            value={stats?.todayArrivals || 0}
            color="green"
          />
        </div>
        <div onClick={() => navigate('/exits')} className="cursor-pointer">
          <StatCard
            icon={Clock}
            label="Today Departures"
            value={stats?.todayDepartures || 0}
            color="red"
          />
        </div>
      </div>

      {/* Quick Shortcuts */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/add-devotee')}
            className="flex flex-col items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Add Devotee</span>
          </button>
          
          <button
            onClick={() => navigate('/bulk-entry')}
            className="flex flex-col items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-all"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Bulk Entry</span>
          </button>
          
          <button
            onClick={() => navigate('/search')}
            className="flex flex-col items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <SearchIcon className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Search</span>
          </button>
          
          <button
            onClick={() => navigate('/tools')}
            className="flex flex-col items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition-all"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Tools</span>
          </button>
        </div>
      </Card>

      {/* Statistics Dashboard */}
      {residents && residents.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Statistics & Insights</h2>
                <p className="text-sm text-gray-600">Quick analytics overview</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nationality Breakdown */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Top Nationalities</h3>
              <div className="space-y-2">
                {Object.entries(
                  residents.reduce((acc: Record<string, number>, r) => {
                    const nat = r.person?.nationality || 'Unknown';
                    acc[nat] = (acc[nat] || 0) + 1;
                    return acc;
                  }, {})
                )
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([nationality, count]) => (
                    <div key={nationality} className="flex items-center justify-between">
                      <button
                        onClick={() => setFilters({ ...filters, nationality })}
                        className="text-sm text-gray-700 hover:text-blue-600"
                      >
                        {nationality}
                      </button>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500"
                            style={{ width: `${(count / residents.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-12 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Purpose of Visit */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Purpose of Visit</h3>
              <div className="space-y-2">
                {Object.entries(
                  residents.reduce((acc: Record<string, number>, r) => {
                    const purpose = r.purpose || 'Unknown';
                    acc[purpose] = (acc[purpose] || 0) + 1;
                    return acc;
                  }, {})
                )
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([purpose, count]) => (
                    <div key={purpose} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{purpose}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500"
                            style={{ width: `${(count / residents.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-12 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Average Stay Duration */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Average Stay Duration</h3>
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-indigo-600">
                  {Math.round(
                    residents.reduce((acc, r) => {
                      const arrival = new Date(r.arrivalDateTime);
                      const departure = r.plannedDeparture ? new Date(r.plannedDeparture) : new Date();
                      const days = Math.ceil((departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24));
                      return acc + days;
                    }, 0) / residents.length
                  )}
                </p>
                <p className="text-sm text-gray-600 mt-1">days</p>
              </div>
            </div>

            {/* Form-C Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Form-C Status</h3>
              <div className="space-y-2">
                {Object.entries(
                  residents.reduce((acc: Record<string, number>, r) => {
                    const status = (r as any).formCStatus || 'Unknown';
                    acc[status] = (acc[status] || 0) + 1;
                    return acc;
                  }, {})
                )
                  .map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <button
                        onClick={() => setFilters({ ...filters, formCStatus: status })}
                        className="text-sm text-gray-700 capitalize hover:text-blue-600"
                      >
                        {status}
                      </button>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              status === 'Submitted' ? 'bg-green-500' :
                              status === 'Pending' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${(count / residents.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-12 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Button
              variant="secondary"
              onClick={() => navigate('/search')}
            >
              <SearchIcon className="w-4 h-4 mr-2" />
              View All Residents in Search
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold">Recent Arrivals (Last 10)</h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGenerateModal(true)}
            >
              <RefreshCw className="w-4 h-4" />
              Generate Data
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
          <Input
            label="Search by Name, ID, or Contact"
            placeholder="Type to search..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <Select
            label="Nationality"
            options={[
              { value: '', label: 'All Nationalities' },
              ...NATIONALITIES.map((n) => ({ value: n, label: n })),
            ]}
            value={filters.nationality}
            onChange={(e) =>
              setFilters({ ...filters, nationality: e.target.value })
            }
          />
          <Select
            label="Form-C Status"
            options={[
              { value: '', label: 'All Status' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Submitted', label: 'Submitted' },
            ]}
            value={filters.formCStatus}
            onChange={(e) =>
              setFilters({ ...filters, formCStatus: e.target.value })
            }
          />
          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => setFilters({ nationality: '', formCStatus: '', search: '' })}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
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
              {filteredResidents.slice(0, 10).map((r) => (
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
                        r.formCStatus === 'Submitted'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {r.formCStatus}
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
      </Card>

      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate Dummy Data"
      >
        <div className="p-6 space-y-4">
          <Input
            label="Number of Records"
            type="number"
            value={generateCount}
            onChange={(e) => setGenerateCount(parseInt(e.target.value) || 50)}
            min="1"
            max="1000"
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowGenerateModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => generateMutation.mutate(generateCount)}
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                'Generate'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
