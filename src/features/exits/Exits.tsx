import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LogOut, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { Button, Card, Input } from '../../components/ui';
import { mockAPI } from '../../services/api';
import type { Visit } from '../../types';
import { getCurrentDateISO, getTomorrowDateISO, extractDateFromISO } from '../../utils/dateUtils';

export function Exits() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(getCurrentDateISO());

  const { data: visits = [] } = useQuery({
    queryKey: ['visits'],
    queryFn: mockAPI.getAllVisits,
  });

  const checkoutMutation = useMutation({
    mutationFn: async (visitId: string) => {
      await mockAPI.updateVisit(visitId, {
        actualDeparture: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });

  // Filter active visits (no actual departure)
  const activeVisits = visits.filter((v) => !v.actualDeparture);

  // Group by departure dates
  const today = getCurrentDateISO();
  const tomorrow = getTomorrowDateISO();

  const departingToday = activeVisits.filter(
    (v) => v.plannedDeparture && extractDateFromISO(v.plannedDeparture) === today
  );
  const departingTomorrow = activeVisits.filter(
    (v) => v.plannedDeparture && extractDateFromISO(v.plannedDeparture) === tomorrow
  );
  const departingSelected = activeVisits.filter(
    (v) => v.plannedDeparture && extractDateFromISO(v.plannedDeparture) === selectedDate
  );

  const overdue = activeVisits.filter((v) => {
    const planned = v.plannedDeparture ? extractDateFromISO(v.plannedDeparture) : null;
    return planned && planned < today;
  });

  const renderVisitCard = (visit: Visit, showOverdue = false) => (
    <Card key={visit.id} className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <button
            onClick={() => navigate(`/person/${visit.personId}`)}
            className="text-lg font-semibold text-blue-600 hover:text-blue-700"
          >
            {visit.person?.givenName} {visit.person?.familyName}
          </button>
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium">ID:</span> {visit.person?.id.slice(0, 8)}
            </p>
            <p>
              <span className="font-medium">Nationality:</span> {visit.person?.nationality}
            </p>
            <p>
              <span className="font-medium">Contact:</span> {visit.person?.contact || 'N/A'}
            </p>
            <p>
              <span className="font-medium">Arrival:</span>{' '}
              {new Date(visit.arrivalDateTime).toLocaleDateString()}
            </p>
            <p>
              <span className="font-medium">Planned Departure:</span>{' '}
              {visit.plannedDeparture
                ? new Date(visit.plannedDeparture).toLocaleDateString()
                : 'Not set'}
            </p>
            {showOverdue && (
              <div className="flex items-center gap-1 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Overdue</span>
              </div>
            )}
          </div>
        </div>
        <Button
          onClick={() => checkoutMutation.mutate(visit.id)}
          disabled={checkoutMutation.isPending}
          className="ml-4"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Check Out
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Exit Management</h1>
        <p className="text-gray-600 mt-2">Track departures and check-out devotees</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{departingToday.length}</p>
              <p className="text-sm text-gray-600">Departing Today</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{departingTomorrow.length}</p>
              <p className="text-sm text-gray-600">Departing Tomorrow</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{overdue.length}</p>
              <p className="text-sm text-gray-600">Overdue</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Overdue */}
      {overdue.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Overdue Departures
          </h2>
          <div className="space-y-3">
            {overdue.map((visit) => renderVisitCard(visit, true))}
          </div>
        </div>
      )}

      {/* Departing Today */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-blue-600" />
          Departing Today
        </h2>
        {departingToday.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No departures scheduled for today</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {departingToday.map((visit) => renderVisitCard(visit))}
          </div>
        )}
      </div>

      {/* Departing Tomorrow */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Departing Tomorrow</h2>
        {departingTomorrow.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No departures scheduled for tomorrow</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {departingTomorrow.map((visit) => renderVisitCard(visit))}
          </div>
        )}
      </div>

      {/* Search by Date */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Search by Date</h2>
        <div className="mb-4">
          <Input
            type="date"
            label="Select Date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        {selectedDate !== today && selectedDate !== tomorrow && (
          <div className="space-y-3">
            {departingSelected.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500">
                  No departures scheduled for {new Date(selectedDate).toLocaleDateString()}
                </p>
              </Card>
            ) : (
              departingSelected.map((visit) => renderVisitCard(visit))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
