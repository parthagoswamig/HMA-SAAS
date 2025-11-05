'use client';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import React, { useState } from 'react';

interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'MALE' | 'FEMALE' | 'OTHER';
  recordDate: string;
  doctorId: string;
  doctorName: string;
  department: string;
  recordType: 'CONSULTATION' | 'DIAGNOSIS' | 'TREATMENT' | 'SURGERY' | 'FOLLOW_UP';
  chiefComplaint: string;
  presentIllness: string;
  pastMedicalHistory?: string;
  familyHistory?: string;
  socialHistory?: string;
  physicalExamination: string;
  vitalSigns: {
    temperature: number;
    bloodPressure: string;
    heartRate: number;
    respiratoryRate: number;
    oxygenSaturation: number;
    height: number;
    weight: number;
  };
  diagnosis: string;
  treatmentPlan: string;
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  investigations?: Array<{
    type: string;
    result: string;
    date: string;
  }>;
  followUpDate?: string;
  notes?: string;
  attachments?: Array<{
    fileName: string;
    fileType: string;
    uploadDate: string;
  }>;
  status: 'DRAFT' | 'COMPLETED' | 'REVIEWED' | 'SIGNED';
}

const MedicalRecordsPage = () => {
  const [currentTab, setCurrentTab] = useState<'records' | 'create' | 'templates'>('records');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);

  const [medicalRecords] = useState<MedicalRecord[]>([
    {
      id: '1',
      patientId: 'p1',
      patientName: 'John Doe',
      patientAge: 45,
      patientGender: 'MALE',
      recordDate: '2024-12-05',
      doctorId: 'd1',
      doctorName: 'Dr. Sarah Johnson',
      department: 'Cardiology',
      recordType: 'CONSULTATION',
      chiefComplaint: 'Chest pain for 2 days',
      presentIllness:
        'Patient reports sharp chest pain that started 2 days ago, worse with exertion, no radiation to arms.',
      pastMedicalHistory: 'Hypertension, diabetes mellitus type 2',
      familyHistory: 'Father had MI at age 60, mother has diabetes',
      physicalExamination:
        'Well-appearing middle-aged male in no acute distress. Heart rate regular, no murmurs. Lungs clear bilaterally.',
      vitalSigns: {
        temperature: 98.6,
        bloodPressure: '140/90',
        heartRate: 78,
        respiratoryRate: 16,
        oxygenSaturation: 98,
        height: 175,
        weight: 80,
      },
      diagnosis: 'Atypical chest pain, rule out coronary artery disease',
      treatmentPlan: 'Order ECG, cardiac enzymes, stress test. Continue current medications.',
      medications: [
        { name: 'Metoprolol', dosage: '50mg', frequency: 'BID', duration: '30 days' },
        { name: 'Atorvastatin', dosage: '20mg', frequency: 'Daily', duration: '30 days' },
      ],
      investigations: [
        { type: 'ECG', result: 'Normal sinus rhythm', date: '2024-12-05' },
        { type: 'Chest X-ray', result: 'Clear lung fields', date: '2024-12-05' },
      ],
      followUpDate: '2024-12-12',
      notes: 'Patient advised to return if symptoms worsen',
      status: 'COMPLETED',
    },
    {
      id: '2',
      patientId: 'p2',
      patientName: 'Emily Chen',
      patientAge: 28,
      patientGender: 'FEMALE',
      recordDate: '2024-12-04',
      doctorId: 'd2',
      doctorName: 'Dr. Michael Brown',
      department: 'Internal Medicine',
      recordType: 'DIAGNOSIS',
      chiefComplaint: 'Fatigue and joint pain for 3 weeks',
      presentIllness:
        'Progressive fatigue, morning stiffness in joints, especially hands and wrists.',
      physicalExamination:
        'Swelling and tenderness in MCPs and PIPs bilaterally. No synovial thickening.',
      vitalSigns: {
        temperature: 99.1,
        bloodPressure: '120/80',
        heartRate: 82,
        respiratoryRate: 18,
        oxygenSaturation: 99,
        height: 160,
        weight: 55,
      },
      diagnosis: 'Early rheumatoid arthritis, probable',
      treatmentPlan: 'Start methotrexate, refer to rheumatology',
      followUpDate: '2024-12-18',
      status: 'COMPLETED',
    },
    {
      id: '3',
      patientId: 'p3',
      patientName: 'Robert Wilson',
      patientAge: 65,
      patientGender: 'MALE',
      recordDate: '2024-12-03',
      doctorId: 'd3',
      doctorName: 'Dr. Lisa Anderson',
      department: 'Surgery',
      recordType: 'SURGERY',
      chiefComplaint: 'Gallbladder surgery',
      presentIllness: 'Elective laparoscopic cholecystectomy for symptomatic cholelithiasis',
      physicalExamination: 'Post-operative day 1, incisions healing well, no signs of infection',
      vitalSigns: {
        temperature: 98.4,
        bloodPressure: '130/85',
        heartRate: 72,
        respiratoryRate: 14,
        oxygenSaturation: 97,
        height: 178,
        weight: 85,
      },
      diagnosis: 'Post-operative status, laparoscopic cholecystectomy',
      treatmentPlan: 'Continue post-op care, diet advancement, pain management',
      status: 'COMPLETED',
    },
  ]);

  const filteredRecords = medicalRecords.filter((record) => {
    const matchesSearch =
      record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || record.recordType === filterType;

    return matchesSearch && matchesType;
  });

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'CONSULTATION':
        return '#3b82f6';
      case 'DIAGNOSIS':
        return '#10b981';
      case 'TREATMENT':
        return '#f59e0b';
      case 'SURGERY':
        return '#dc2626';
      case 'FOLLOW_UP':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '#10b981';
      case 'REVIEWED':
        return '#3b82f6';
      case 'SIGNED':
        return '#059669';
      case 'DRAFT':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const RecordCard = ({ record }: { record: MedicalRecord }) => (
    <Card variant="elevated" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <h3
                style={{
                  margin: '0 0 0.25rem 0',
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                }}
              >
                {record.patientName}
              </h3>
              <p style={{ margin: '0', fontSize: '0.875rem', color: '#6b7280' }}>
                {record.patientAge} years • {record.patientGender}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  backgroundColor: `${getRecordTypeColor(record.recordType)}15`,
                  color: getRecordTypeColor(record.recordType),
                }}
              >
                {record.recordType.replace('_', ' ')}
              </span>
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  backgroundColor: `${getStatusColor(record.status)}15`,
                  color: getStatusColor(record.status),
                }}
              >
                {record.status}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Date:</strong> {new Date(record.recordDate).toLocaleDateString()}
              </p>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Doctor:</strong> {record.doctorName}
              </p>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Department:</strong> {record.department}
              </p>
            </div>

            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Chief Complaint:</strong> {record.chiefComplaint}
              </p>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Diagnosis:</strong> {record.diagnosis}
              </p>
              {record.followUpDate && (
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                  <strong>Follow-up:</strong> {new Date(record.followUpDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Vital Signs Quick View */}
          <div
            style={{
              padding: '0.75rem',
              background: '#f8fafc',
              borderRadius: '6px',
              marginBottom: '0.5rem',
            }}
          >
            <h4
              style={{
                margin: '0 0 0.5rem 0',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
              }}
            >
              Vital Signs
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '0.5rem',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                <strong>BP:</strong> {record.vitalSigns.bloodPressure}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                <strong>HR:</strong> {record.vitalSigns.heartRate} bpm
              </span>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                <strong>Temp:</strong> {record.vitalSigns.temperature}°F
              </span>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                <strong>SpO2:</strong> {record.vitalSigns.oxygenSaturation}%
              </span>
            </div>
          </div>
        </div>

        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginLeft: '1rem' }}
        >
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedRecord(record);
              setShowRecordModal(true);
            }}
          >
            View Details
          </Button>
          <Button size="sm" variant="primary">
            Edit Record
          </Button>
          <Button size="sm" variant="secondary">
            Print
          </Button>
        </div>
      </div>
    </Card>
  );

  const DetailedRecordModal = () =>
    showRecordModal &&
    selectedRecord && (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
          }}
        >
          <div
            style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
              Medical Record Details
            </h2>
            <Button variant="outline" size="sm" onClick={() => setShowRecordModal(false)}>
              ✕
            </Button>
          </div>

          <div style={{ padding: '1.5rem' }}>
            {/* Patient Info */}
            <div style={{ marginBottom: '2rem' }}>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem',
                }}
              >
                Patient Information
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                }}
              >
                <div>
                  <strong>Name:</strong> {selectedRecord.patientName}
                  <br />
                  <strong>Age:</strong> {selectedRecord.patientAge}
                  <br />
                  <strong>Gender:</strong> {selectedRecord.patientGender}
                </div>
                <div>
                  <strong>Date:</strong> {new Date(selectedRecord.recordDate).toLocaleDateString()}
                  <br />
                  <strong>Doctor:</strong> {selectedRecord.doctorName}
                  <br />
                  <strong>Department:</strong> {selectedRecord.department}
                </div>
              </div>
            </div>

            {/* Clinical Information */}
            <div style={{ marginBottom: '2rem' }}>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem',
                }}
              >
                Clinical Information
              </h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <strong>Chief Complaint:</strong>
                  <br />
                  <p
                    style={{
                      margin: '0.5rem 0',
                      padding: '0.75rem',
                      background: '#f8fafc',
                      borderRadius: '6px',
                    }}
                  >
                    {selectedRecord.chiefComplaint}
                  </p>
                </div>
                <div>
                  <strong>Present Illness:</strong>
                  <br />
                  <p
                    style={{
                      margin: '0.5rem 0',
                      padding: '0.75rem',
                      background: '#f8fafc',
                      borderRadius: '6px',
                    }}
                  >
                    {selectedRecord.presentIllness}
                  </p>
                </div>
                {selectedRecord.pastMedicalHistory && (
                  <div>
                    <strong>Past Medical History:</strong>
                    <br />
                    <p
                      style={{
                        margin: '0.5rem 0',
                        padding: '0.75rem',
                        background: '#f8fafc',
                        borderRadius: '6px',
                      }}
                    >
                      {selectedRecord.pastMedicalHistory}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Vital Signs */}
            <div style={{ marginBottom: '2rem' }}>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem',
                }}
              >
                Vital Signs
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    padding: '0.75rem',
                    background: '#f0f9ff',
                    borderRadius: '6px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0369a1' }}>
                    {selectedRecord.vitalSigns.bloodPressure}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Blood Pressure</div>
                </div>
                <div
                  style={{
                    padding: '0.75rem',
                    background: '#f0fdf4',
                    borderRadius: '6px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
                    {selectedRecord.vitalSigns.heartRate}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Heart Rate (bpm)</div>
                </div>
                <div
                  style={{
                    padding: '0.75rem',
                    background: '#fefce8',
                    borderRadius: '6px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ca8a04' }}>
                    {selectedRecord.vitalSigns.temperature}°F
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Temperature</div>
                </div>
                <div
                  style={{
                    padding: '0.75rem',
                    background: '#fdf2f8',
                    borderRadius: '6px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#be185d' }}>
                    {selectedRecord.vitalSigns.oxygenSaturation}%
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Oxygen Saturation</div>
                </div>
              </div>
            </div>

            {/* Diagnosis and Treatment */}
            <div style={{ marginBottom: '2rem' }}>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem',
                }}
              >
                Diagnosis & Treatment
              </h3>
              <div>
                <strong>Diagnosis:</strong>
                <br />
                <p
                  style={{
                    margin: '0.5rem 0',
                    padding: '0.75rem',
                    background: '#f0fdf4',
                    borderRadius: '6px',
                  }}
                >
                  {selectedRecord.diagnosis}
                </p>
              </div>
              <div>
                <strong>Treatment Plan:</strong>
                <br />
                <p
                  style={{
                    margin: '0.5rem 0',
                    padding: '0.75rem',
                    background: '#f8fafc',
                    borderRadius: '6px',
                  }}
                >
                  {selectedRecord.treatmentPlan}
                </p>
              </div>
            </div>

            {/* Medications */}
            {selectedRecord.medications && selectedRecord.medications.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '1rem',
                  }}
                >
                  Medications
                </h3>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {selectedRecord.medications.map((med, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '0.75rem',
                        background: '#fef3c7',
                        borderRadius: '6px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                        gap: '0.5rem',
                      }}
                    >
                      <div>
                        <strong>{med.name}</strong>
                      </div>
                      <div>Dose: {med.dosage}</div>
                      <div>Frequency: {med.frequency}</div>
                      <div>Duration: {med.duration}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Investigations */}
            {selectedRecord.investigations && selectedRecord.investigations.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '1rem',
                  }}
                >
                  Investigations
                </h3>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {selectedRecord.investigations.map((inv, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '0.75rem',
                        background: '#e0f2fe',
                        borderRadius: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong>{inv.type}</strong>
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {new Date(inv.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ marginTop: '0.25rem' }}>{inv.result}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb',
              }}
            >
              <Button variant="outline" onClick={() => setShowRecordModal(false)}>
                Close
              </Button>
              <Button variant="primary">Edit Record</Button>
              <Button variant="secondary">Print Record</Button>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <Layout>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '0.5rem',
              }}
            >
              Medical Records
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>
              Manage patient medical records and clinical documentation
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary">📊 Analytics</Button>
            <Button onClick={() => setCurrentTab('create')}>+ New Record</Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
            {[
              { key: 'records', label: '📋 Medical Records', count: medicalRecords.length },
              { key: 'create', label: '➕ Create New', count: null },
              { key: 'templates', label: '📄 Templates', count: null },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setCurrentTab(tab.key as 'records' | 'create' | 'templates')}
                style={{
                  padding: '1rem 1.5rem',
                  border: 'none',
                  background: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: currentTab === tab.key ? '#667eea' : '#6b7280',
                  borderBottom:
                    currentTab === tab.key ? '2px solid #667eea' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.label}
                {tab.count && (
                  <span
                    style={{
                      marginLeft: '0.5rem',
                      padding: '0.25rem 0.5rem',
                      backgroundColor: currentTab === tab.key ? '#667eea' : '#e5e7eb',
                      color: currentTab === tab.key ? 'white' : '#6b7280',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {currentTab === 'records' && (
          <>
            {/* Filters */}
            <Card style={{ marginBottom: '2rem' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1rem',
                  alignItems: 'end',
                }}
              >
                <Input
                  placeholder="Search records, patients, or doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon="🔍"
                  label="Search"
                />

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                    }}
                  >
                    Record Type
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      backgroundColor: 'white',
                      color: '#374151',
                    }}
                  >
                    <option value="all">All Types</option>
                    <option value="CONSULTATION">Consultation</option>
                    <option value="DIAGNOSIS">Diagnosis</option>
                    <option value="TREATMENT">Treatment</option>
                    <option value="SURGERY">Surgery</option>
                    <option value="FOLLOW_UP">Follow-up</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button variant="outline" size="sm">
                    Export Records
                  </Button>
                  <Button variant="secondary" size="sm">
                    Print Report
                  </Button>
                </div>
              </div>
            </Card>

            {/* Records List */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
                  Medical Records ({filteredRecords.length})
                </h2>
              </div>

              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => <RecordCard key={record.id} record={record} />)
              ) : (
                <Card>
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                    <h3
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '0.5rem',
                      }}
                    >
                      No medical records found
                    </h3>
                    <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                      No records match your current search criteria.
                    </p>
                    <Button onClick={() => setCurrentTab('create')}>Create New Record</Button>
                  </div>
                </Card>
              )}
            </div>
          </>
        )}

        {currentTab === 'create' && (
          <Card>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                }}
              >
                Create New Medical Record
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                Create a new medical record form will be implemented here with comprehensive fields
                for patient documentation.
              </p>
              <Button variant="primary">Open Record Creation Form</Button>
            </div>
          </Card>
        )}

        {currentTab === 'templates' && (
          <Card>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                }}
              >
                Medical Record Templates
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                Pre-built templates for different types of medical records will be available here.
              </p>
              <Button variant="primary">Browse Templates</Button>
            </div>
          </Card>
        )}

        <DetailedRecordModal />
      </div>
    </Layout>
  );
};

export default MedicalRecordsPage;
