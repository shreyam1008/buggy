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

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold">Current Residents</h2>
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
              {filteredResidents.slice(0, 50).map((r) => (
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
