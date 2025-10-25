import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Plus, Save } from 'lucide-react';
import { Button, Card, Input, Select } from '../../components/ui';
import { NATIONALITIES, PURPOSES, LOCATIONS, GENDER_OPTIONS } from '../../config/constants';

interface RowData {
  id: string;
  givenName: string;
  familyName: string;
  dob: string;
  gender: string;
  nationality: string;
  idNumber: string;
  contact: string;
}

export function BulkEntry() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<RowData[]>(
    Array(10)
      .fill(null)
      .map((_, i) => ({
        id: `temp-${i}`,
        givenName: '',
        familyName: '',
        dob: '',
        gender: 'Male',
        nationality: 'Nepal',
        idNumber: '',
        contact: '',
      }))
  );

  const [sharedFields, setSharedFields] = useState({
    arrivalDateTime: new Date().toISOString().slice(0, 16),
    arrivalLocation: LOCATIONS[0],
    temporaryAddressPrefix: 'Room ',
    purpose: PURPOSES[0],
  });

  const updateRow = (index: number, field: keyof RowData, value: string) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        id: `temp-${rows.length}`,
        givenName: '',
        familyName: '',
        dob: '',
        gender: 'Male',
        nationality: 'Nepal',
        idNumber: '',
        contact: '',
      },
    ]);
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Bulk Entry</h1>
      </div>

      <Card className="p-6 mb-4">
        <h2 className="text-lg font-semibold mb-4">Shared Fields (Applied to All)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Arrival Date & Time"
            type="datetime-local"
            value={sharedFields.arrivalDateTime}
            onChange={(e) =>
              setSharedFields({ ...sharedFields, arrivalDateTime: e.target.value })
            }
          />
          <Select
            label="Arrival Location"
            options={LOCATIONS.map((l) => ({ value: l, label: l }))}
            value={sharedFields.arrivalLocation}
            onChange={(e) =>
              setSharedFields({ ...sharedFields, arrivalLocation: e.target.value })
            }
          />
          <Select
            label="Purpose"
            options={PURPOSES.map((p) => ({ value: p, label: p }))}
            value={sharedFields.purpose}
            onChange={(e) => setSharedFields({ ...sharedFields, purpose: e.target.value })}
          />
        </div>
      </Card>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left text-sm font-semibold">#</th>
                <th className="px-3 py-2 text-left text-sm font-semibold">Given Name</th>
                <th className="px-3 py-2 text-left text-sm font-semibold">Family Name</th>
                <th className="px-3 py-2 text-left text-sm font-semibold">DOB</th>
                <th className="px-3 py-2 text-left text-sm font-semibold">Gender</th>
                <th className="px-3 py-2 text-left text-sm font-semibold">Nationality</th>
                <th className="px-3 py-2 text-left text-sm font-semibold">ID Number</th>
                <th className="px-3 py-2 text-left text-sm font-semibold">Contact</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id} className="border-b">
                  <td className="px-3 py-2 text-sm text-gray-600">{idx + 1}</td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full px-2 py-1 border rounded text-sm"
                      value={row.givenName}
                      onChange={(e) => updateRow(idx, 'givenName', e.target.value)}
                      placeholder="Given name"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full px-2 py-1 border rounded text-sm"
                      value={row.familyName}
                      onChange={(e) => updateRow(idx, 'familyName', e.target.value)}
                      placeholder="Family name"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="date"
                      className="w-full px-2 py-1 border rounded text-sm"
                      value={row.dob}
                      onChange={(e) => updateRow(idx, 'dob', e.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      className="w-full px-2 py-1 border rounded text-sm"
                      value={row.gender}
                      onChange={(e) => updateRow(idx, 'gender', e.target.value)}
                    >
                      {GENDER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      className="w-full px-2 py-1 border rounded text-sm"
                      value={row.nationality}
                      onChange={(e) => updateRow(idx, 'nationality', e.target.value)}
                    >
                      {NATIONALITIES.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full px-2 py-1 border rounded text-sm"
                      value={row.idNumber}
                      onChange={(e) => updateRow(idx, 'idNumber', e.target.value)}
                      placeholder="ID number"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full px-2 py-1 border rounded text-sm"
                      value={row.contact}
                      onChange={(e) => updateRow(idx, 'contact', e.target.value)}
                      placeholder="Contact"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={addRow} variant="secondary">
            <Plus className="w-4 h-4" />
            Add Row
          </Button>
          <Button>
            <Save className="w-4 h-4" />
            Save Batch
          </Button>
        </div>
      </Card>
    </div>
  );
}
