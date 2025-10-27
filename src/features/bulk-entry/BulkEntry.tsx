import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, Plus, Save, Upload, Download, Trash2, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button, Card, Input, Select } from '../../components/ui';
import { mockAPI } from '../../services/api';
import { NATIONALITIES, PURPOSES, LOCATIONS, GENDER_OPTIONS, ID_TYPES } from '../../config/constants';
import { getCurrentDateTimeLocal } from '../../utils/dateUtils';

interface RowData {
  id: string;
  givenName: string;
  familyName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  nationality: string;
  idType: 'passport' | 'citizenship' | 'voterid' | 'driver';
  idNumber: string;
  contact: string;
  email: string;
  roomNumber: string;
}

export function BulkEntry() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
        idType: 'passport',
        idNumber: '',
        contact: '',
        email: '',
        roomNumber: '',
      }))
  );

  const [sharedFields, setSharedFields] = useState({
    arrivalDateTime: getCurrentDateTimeLocal(),
    arrivalLocation: LOCATIONS[0],
    purpose: PURPOSES[0],
    host: 'Ashram Administration',
  });

  const saveBatchMutation = useMutation({
    mutationFn: async (data: { rows: RowData[]; shared: typeof sharedFields }) => {
      const validRows = data.rows.filter(
        (r) => r.givenName && r.familyName && r.idNumber && r.roomNumber
      );

      const results = await Promise.all(
        validRows.map(async (row) => {
          const person = await mockAPI.createPerson({
            givenName: row.givenName,
            familyName: row.familyName,
            dob: row.dob,
            gender: row.gender,
            nationality: row.nationality,
            permanentAddress: '',
            contact: row.contact,
            email: row.email,
            identities: [
              {
                type: row.idType,
                idNumber: row.idNumber,
                issuingCountry: row.nationality,
                expiryDate: '',
              },
            ],
          });

          const visit = await mockAPI.createVisit({
            personId: person.id,
            arrivalDateTime: data.shared.arrivalDateTime,
            arrivalLocation: data.shared.arrivalLocation,
            temporaryAddress: row.roomNumber,
            plannedDeparture: '',
            purpose: data.shared.purpose,
            host: data.shared.host,
          });

          return { person, visit };
        })
      );

      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries();
      alert(`Successfully saved ${results.length} devotees!`);
      navigate('/');
    },
  });

  const updateRow = (index: number, field: keyof RowData, value: string) => {
    const newRows = [...rows];
    (newRows[index][field] as any) = value;
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
        idType: 'passport',
        idNumber: '',
        contact: '',
        email: '',
        roomNumber: '',
      },
    ]);
  };

  const deleteRow = (index: number) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index));
    }
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        const importedRows: RowData[] = data.map((row, idx) => ({
          id: `imported-${idx}`,
          givenName: row['Given Name'] || row['givenName'] || '',
          familyName: row['Family Name'] || row['familyName'] || '',
          dob: row['DOB'] || row['dob'] || '',
          gender: (row['Gender'] || row['gender'] || 'Male') as 'Male' | 'Female' | 'Other',
          nationality: row['Nationality'] || row['nationality'] || 'Nepal',
          idType: (row['ID Type'] || row['idType'] || 'passport') as 'passport' | 'citizenship' | 'voterid' | 'driver',
          idNumber: row['ID Number'] || row['idNumber'] || '',
          contact: row['Contact'] || row['contact'] || '',
          email: row['Email'] || row['email'] || '',
          roomNumber: row['Room Number'] || row['roomNumber'] || '',
        }));

        setRows(importedRows);
      } catch (error) {
        alert('Error reading Excel file. Please check the format.');
        console.error(error);
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Given Name': 'John',
        'Family Name': 'Doe',
        DOB: '1990-01-15',
        Gender: 'Male',
        Nationality: 'Nepal',
        'ID Type': 'passport',
        'ID Number': 'P123456',
        Contact: '+977-9841234567',
        Email: 'john@example.com',
        'Room Number': 'Room 101',
      },
      {
        'Given Name': 'Jane',
        'Family Name': 'Smith',
        DOB: '1985-05-20',
        Gender: 'Female',
        Nationality: 'India',
        'ID Type': 'passport',
        'ID Number': 'P789012',
        Contact: '+91-9876543210',
        Email: 'jane@example.com',
        'Room Number': 'Room 102',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Devotees');
    XLSX.writeFile(wb, 'devotee_bulk_upload_template.xlsx');
  };

  const getValidRowCount = () => {
    return rows.filter((r) => r.givenName && r.familyName && r.idNumber && r.roomNumber).length;
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
        <p className="text-gray-600 mt-2">
          Add multiple devotees at once. Import from Excel or enter manually.
        </p>
      </div>

      <Card className="p-6 mb-4">
        <div className="flex flex-wrap gap-3 mb-4">
          <Button variant="secondary" onClick={downloadTemplate}>
            <Download className="w-4 h-4" />
            Download Template
          </Button>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelImport}
              className="hidden"
              id="excel-upload"
            />
            <Button variant="secondary" onClick={() => document.getElementById('excel-upload')?.click()}>
              <Upload className="w-4 h-4" />
              Import from Excel
            </Button>
          </label>
          <div className="ml-auto text-sm text-gray-600 flex items-center gap-2">
            Valid entries: <span className="font-semibold text-blue-600">{getValidRowCount()}</span> / {rows.length}
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-4">Shared Fields (Applied to All)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
          <Input
            label="Host/Contact"
            value={sharedFields.host}
            onChange={(e) => setSharedFields({ ...sharedFields, host: e.target.value })}
          />
        </div>
      </Card>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700">#</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700">Given Name *</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700">Family Name *</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700">DOB</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700">Gender</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700">Nationality</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700">ID Type</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700">ID Number *</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700">Contact</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700">Email</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700">Room *</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const isValid = row.givenName && row.familyName && row.idNumber && row.roomNumber;
                return (
                  <tr
                    key={row.id}
                    className={`border-b ${isValid ? 'bg-green-50' : 'bg-white'} hover:bg-gray-50`}
                  >
                    <td className="px-2 py-2 text-sm text-gray-600">{idx + 1}</td>
                    <td className="px-2 py-2">
                      <input
                        className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                        value={row.givenName}
                        onChange={(e) => updateRow(idx, 'givenName', e.target.value)}
                        placeholder="Given name"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                        value={row.familyName}
                        onChange={(e) => updateRow(idx, 'familyName', e.target.value)}
                        placeholder="Family name"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="date"
                        className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                        value={row.dob}
                        onChange={(e) => updateRow(idx, 'dob', e.target.value)}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <select
                        className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
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
                    <td className="px-2 py-2">
                      <select
                        className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
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
                    <td className="px-2 py-2">
                      <select
                        className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                        value={row.idType}
                        onChange={(e) => updateRow(idx, 'idType', e.target.value)}
                      >
                        {ID_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <input
                        className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                        value={row.idNumber}
                        onChange={(e) => updateRow(idx, 'idNumber', e.target.value)}
                        placeholder="ID number"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                        value={row.contact}
                        onChange={(e) => updateRow(idx, 'contact', e.target.value)}
                        placeholder="Contact"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="email"
                        className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                        value={row.email}
                        onChange={(e) => updateRow(idx, 'email', e.target.value)}
                        placeholder="Email"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                        value={row.roomNumber}
                        onChange={(e) => updateRow(idx, 'roomNumber', e.target.value)}
                        placeholder="Room 101"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <button
                        onClick={() => deleteRow(idx)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex gap-2 mt-4 justify-between">
          <Button onClick={addRow} variant="secondary">
            <Plus className="w-4 h-4" />
            Add Row
          </Button>
          <Button
            onClick={() => saveBatchMutation.mutate({ rows, shared: sharedFields })}
            disabled={getValidRowCount() === 0 || saveBatchMutation.isPending}
          >
            {saveBatchMutation.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save {getValidRowCount()} Devotees
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
