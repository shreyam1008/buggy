import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, RefreshCw, Calendar, Phone, Mail, MapPin } from 'lucide-react';
import { Button, Card, Modal, Input } from '../../components/ui';
import { mockAPI } from '../../services/api';
import type { Person } from '../../types';

export function PersonProfile() {
  const navigate = useNavigate();
  const { personId } = useParams<{ personId: string }>();
  
  if (!personId) {
    navigate('/');
    return null;
  }
  const { data: person, isLoading } = useQuery<Person>({
    queryKey: ['person', personId],
    queryFn: () => mockAPI.getPerson(personId),
  });

  const [showFormCModal, setShowFormCModal] = useState(false);
  const [govIdNumber, setGovIdNumber] = useState('');
  const [selectedVisit, setSelectedVisit] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const submitFormCMutation = useMutation({
    mutationFn: (data: { visitId: string; govIdNumber: string }) =>
      mockAPI.submitFormC(data.visitId, data.govIdNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['person', personId] });
      setShowFormCModal(false);
      setGovIdNumber('');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!person) {
    return <div>Person not found</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="text-center mb-6">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4">
              {person.givenName[0]}
              {person.familyName[0]}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {person.givenName} {person.familyName}
            </h2>
            <p className="text-gray-600">{person.nationality}</p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="w-4 h-4" />
              <span>DOB: {person.dob}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Phone className="w-4 h-4" />
              <span>{person.contact || 'No contact'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Mail className="w-4 h-4" />
              <span>{person.email || 'No email'}</span>
            </div>
            <div className="flex items-start gap-2 text-gray-700">
              <MapPin className="w-4 h-4 mt-0.5" />
              <span>{person.permanentAddress}</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-2">Identity Documents</h3>
            {person.identities?.map((id, idx) => (
              <div key={idx} className="text-sm text-gray-700 mb-2">
                <span className="font-medium">{id.type}:</span> {id.idNumber}
                <br />
                <span className="text-gray-500">Expires: {id.expiryDate}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2 p-6">
          <h2 className="text-xl font-bold mb-4">Visit History</h2>
          <div className="space-y-4">
            {person.visits?.map((visit) => (
              <div key={visit.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">Visit #{visit.id}</h3>
                    <p className="text-sm text-gray-600">{visit.purpose}</p>
                  </div>
                  {visit.formC ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      Form-C Submitted
                    </span>
                  ) : !visit.actualDeparture ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedVisit(visit.id);
                        setShowFormCModal(true);
                      }}
                    >
                      Submit Form-C
                    </Button>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Arrival:</span>
                    <p className="font-medium">
                      {new Date(visit.arrivalDateTime).toLocaleString()}
                    </p>
                    <p className="text-gray-600">{visit.arrivalLocation}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Departure:</span>
                    <p className="font-medium">
                      {visit.actualDeparture
                        ? new Date(visit.actualDeparture).toLocaleDateString()
                        : `Planned: ${new Date(visit.plannedDeparture).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Room:</span>
                    <p className="font-medium">{visit.temporaryAddress}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <p className="font-medium">
                      {visit.actualDeparture ? 'Checked Out' : 'Current Resident'}
                    </p>
                  </div>
                </div>

                {visit.photo && (
                  <div className="mt-3 pt-3 border-t">
                    <img
                      src={visit.photo.thumbnailData}
                      alt="Visit photo"
                      className="w-20 h-20 rounded object-cover"
                    />
                  </div>
                )}

                {visit.formC && (
                  <div className="mt-3 pt-3 border-t text-sm">
                    <p className="text-gray-600">
                      Gov ID: <span className="font-medium">{visit.formC.govIdNumber}</span>
                    </p>
                    <p className="text-gray-600">
                      Submitted:{' '}
                      {visit.formC.govSubmissionDate &&
                        new Date(visit.formC.govSubmissionDate).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal
        isOpen={showFormCModal}
        onClose={() => setShowFormCModal(false)}
        title="Submit Form-C"
      >
        <div className="p-6 space-y-4">
          <Input
            label="Government ID Number"
            value={govIdNumber}
            onChange={(e) => setGovIdNumber(e.target.value)}
            placeholder="GOV-123456"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowFormCModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedVisit &&
                submitFormCMutation.mutate({ visitId: selectedVisit, govIdNumber })
              }
              disabled={!govIdNumber || submitFormCMutation.isPending}
            >
              {submitFormCMutation.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                'Submit'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
