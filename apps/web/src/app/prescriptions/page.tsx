'use client';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import React, { useState } from 'react';

interface Prescription {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  doctorId: string;
  doctorName: string;
  department: string;
  prescriptionDate: string;
  validUntil: string;
  status: 'ACTIVE' | 'DISPENSED' | 'EXPIRED' | 'CANCELLED' | 'PARTIALLY_DISPENSED';
  priority: 'ROUTINE' | 'URGENT' | 'STAT';
  diagnosis?: string;
  medications: Array<{
    id: string;
    name: string;
    genericName: string;
    strength: string;
    dosageForm: 'TABLET' | 'CAPSULE' | 'SYRUP' | 'INJECTION' | 'CREAM' | 'DROPS';
    quantity: number;
    unit: string;
    dosage: string;
    frequency: string;
    duration: string;
    route: 'ORAL' | 'TOPICAL' | 'IV' | 'IM' | 'SC' | 'INHALATION';
    instructions: string;
    dispensed: number;
    remaining: number;
    cost: number;
    notes?: string;
  }>;
  pharmacistId?: string;
  pharmacistName?: string;
  dispensedDate?: string;
  totalCost: number;
  insuranceCoverage?: number;
  patientPayment: number;
  notes?: string;
}

const PrescriptionsPage = () => {
  const [currentTab, setCurrentTab] = useState<
    'prescriptions' | 'pharmacy' | 'inventory' | 'reports'
  >('prescriptions');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  const [prescriptions] = useState<Prescription[]>([
    {
      id: '1',
      prescriptionNumber: 'RX-2024-001',
      patientId: 'p1',
      patientName: 'John Doe',
      patientAge: 45,
      doctorId: 'd1',
      doctorName: 'Dr. Sarah Johnson',
      department: 'Cardiology',
      prescriptionDate: '2024-12-05',
      validUntil: '2024-12-12',
      status: 'DISPENSED',
      priority: 'ROUTINE',
      diagnosis: 'Hypertension, Hyperlipidemia',
      pharmacistId: 'ph1',
      pharmacistName: 'Michael Smith, PharmD',
      dispensedDate: '2024-12-05',
      medications: [
        {
          id: '1',
          name: 'Metoprolol Tartrate',
          genericName: 'Metoprolol',
          strength: '50mg',
          dosageForm: 'TABLET',
          quantity: 30,
          unit: 'tablets',
          dosage: '50mg',
          frequency: 'BID',
          duration: '30 days',
          route: 'ORAL',
          instructions: 'Take with food. Do not stop abruptly.',
          dispensed: 30,
          remaining: 0,
          cost: 25.5,
        },
        {
          id: '2',
          name: 'Atorvastatin Calcium',
          genericName: 'Atorvastatin',
          strength: '20mg',
          dosageForm: 'TABLET',
          quantity: 30,
          unit: 'tablets',
          dosage: '20mg',
          frequency: 'Once daily',
          duration: '30 days',
          route: 'ORAL',
          instructions: 'Take at bedtime',
          dispensed: 30,
          remaining: 0,
          cost: 18.75,
        },
      ],
      totalCost: 44.25,
      insuranceCoverage: 35.4,
      patientPayment: 8.85,
    },
    {
      id: '2',
      prescriptionNumber: 'RX-2024-002',
      patientId: 'p2',
      patientName: 'Emily Chen',
      patientAge: 28,
      doctorId: 'd2',
      doctorName: 'Dr. Michael Brown',
      department: 'Internal Medicine',
      prescriptionDate: '2024-12-04',
      validUntil: '2024-12-11',
      status: 'PARTIALLY_DISPENSED',
      priority: 'URGENT',
      diagnosis: 'Rheumatoid Arthritis',
      pharmacistId: 'ph2',
      pharmacistName: 'Lisa Williams, PharmD',
      dispensedDate: '2024-12-04',
      medications: [
        {
          id: '3',
          name: 'Methotrexate',
          genericName: 'Methotrexate',
          strength: '2.5mg',
          dosageForm: 'TABLET',
          quantity: 12,
          unit: 'tablets',
          dosage: '7.5mg',
          frequency: 'Once weekly',
          duration: '3 months',
          route: 'ORAL',
          instructions: 'Take on same day each week. Avoid alcohol.',
          dispensed: 12,
          remaining: 0,
          cost: 65.0,
        },
        {
          id: '4',
          name: 'Folic Acid',
          genericName: 'Folic Acid',
          strength: '5mg',
          dosageForm: 'TABLET',
          quantity: 30,
          unit: 'tablets',
          dosage: '5mg',
          frequency: 'Once daily',
          duration: '30 days',
          route: 'ORAL',
          instructions: 'Take except on methotrexate day',
          dispensed: 0,
          remaining: 30,
          cost: 12.5,
          notes: 'Out of stock - pending order',
        },
      ],
      totalCost: 77.5,
      insuranceCoverage: 62.0,
      patientPayment: 15.5,
    },
    {
      id: '3',
      prescriptionNumber: 'RX-2024-003',
      patientId: 'p3',
      patientName: 'Robert Wilson',
      patientAge: 65,
      doctorId: 'd3',
      doctorName: 'Dr. Lisa Anderson',
      department: 'Surgery',
      prescriptionDate: '2024-12-03',
      validUntil: '2024-12-10',
      status: 'ACTIVE',
      priority: 'ROUTINE',
      diagnosis: 'Post-operative pain management',
      medications: [
        {
          id: '5',
          name: 'Oxycodone/Acetaminophen',
          genericName: 'Oxycodone/APAP',
          strength: '5/325mg',
          dosageForm: 'TABLET',
          quantity: 20,
          unit: 'tablets',
          dosage: '1-2 tablets',
          frequency: 'Every 4-6 hours as needed',
          duration: '7 days',
          route: 'ORAL',
          instructions: 'For pain. Do not exceed 8 tablets in 24 hours.',
          dispensed: 0,
          remaining: 20,
          cost: 28.0,
        },
        {
          id: '6',
          name: 'Omeprazole',
          genericName: 'Omeprazole',
          strength: '20mg',
          dosageForm: 'CAPSULE',
          quantity: 14,
          unit: 'capsules',
          dosage: '20mg',
          frequency: 'Once daily',
          duration: '14 days',
          route: 'ORAL',
          instructions: 'Take 30 minutes before breakfast',
          dispensed: 0,
          remaining: 14,
          cost: 15.75,
        },
      ],
      totalCost: 43.75,
      patientPayment: 43.75,
    },
  ]);

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const matchesSearch =
      prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.prescriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || prescription.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DISPENSED':
        return '#10b981';
      case 'PARTIALLY_DISPENSED':
        return '#3b82f6';
      case 'ACTIVE':
        return '#f59e0b';
      case 'EXPIRED':
        return '#6b7280';
      case 'CANCELLED':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'STAT':
        return '#dc2626';
      case 'URGENT':
        return '#f59e0b';
      case 'ROUTINE':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const PrescriptionCard = ({ prescription }: { prescription: Prescription }) => (
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
                {prescription.prescriptionNumber}
              </h3>
              <p style={{ margin: '0', fontSize: '0.875rem', color: '#6b7280' }}>
                {prescription.patientName} • {prescription.patientAge} years
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  backgroundColor: `${getStatusColor(prescription.status)}15`,
                  color: getStatusColor(prescription.status),
                }}
              >
                {prescription.status.replace('_', ' ')}
              </span>
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  backgroundColor: `${getPriorityColor(prescription.priority)}15`,
                  color: getPriorityColor(prescription.priority),
                }}
              >
                {prescription.priority}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Prescribed:</strong>{' '}
                {new Date(prescription.prescriptionDate).toLocaleDateString()}
              </p>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Valid Until:</strong>{' '}
                {new Date(prescription.validUntil).toLocaleDateString()}
              </p>
              {prescription.dispensedDate && (
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                  <strong>Dispensed:</strong>{' '}
                  {new Date(prescription.dispensedDate).toLocaleDateString()}
                </p>
              )}
            </div>

            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Doctor:</strong> {prescription.doctorName}
              </p>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Department:</strong> {prescription.department}
              </p>
              {prescription.pharmacistName && (
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                  <strong>Pharmacist:</strong> {prescription.pharmacistName}
                </p>
              )}
            </div>

            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Medications:</strong> {prescription.medications.length} items
              </p>
              <p
                style={{
                  margin: '0 0 0.25rem 0',
                  fontSize: '1rem',
                  color: '#1f2937',
                  fontWeight: '600',
                }}
              >
                <strong>Total Cost:</strong> ${prescription.totalCost.toFixed(2)}
              </p>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#10b981' }}>
                <strong>Patient Pays:</strong> ${prescription.patientPayment.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Medications Summary */}
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
              Medications
            </h4>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {prescription.medications.slice(0, 2).map((med) => (
                <div key={med.id} style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>
                      <strong>{med.name}</strong> {med.strength}
                    </span>
                    <span
                      style={{
                        padding: '0.125rem 0.375rem',
                        borderRadius: '4px',
                        fontSize: '0.625rem',
                        fontWeight: '600',
                        backgroundColor: med.remaining > 0 ? '#f59e0b15' : '#10b98115',
                        color: med.remaining > 0 ? '#f59e0b' : '#10b981',
                      }}
                    >
                      {med.remaining > 0 ? `${med.remaining} pending` : 'Dispensed'}
                    </span>
                  </div>
                  <div style={{ marginTop: '0.125rem' }}>
                    {med.dosage} {med.frequency} • {med.duration}
                  </div>
                </div>
              ))}
              {prescription.medications.length > 2 && (
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' }}>
                  +{prescription.medications.length - 2} more medications...
                </div>
              )}
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
              setSelectedPrescription(prescription);
              setShowPrescriptionModal(true);
            }}
          >
            View Details
          </Button>
          {prescription.status === 'ACTIVE' && (
            <Button size="sm" variant="primary">
              Dispense
            </Button>
          )}
          {prescription.status === 'PARTIALLY_DISPENSED' && (
            <Button size="sm" variant="success">
              Complete
            </Button>
          )}
          <Button size="sm" variant="secondary">
            Print
          </Button>
        </div>
      </div>
    </Card>
  );

  const PrescriptionModal = () =>
    showPrescriptionModal &&
    selectedPrescription && (
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
            maxWidth: '900px',
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
              Prescription Details - {selectedPrescription.prescriptionNumber}
            </h2>
            <Button variant="outline" size="sm" onClick={() => setShowPrescriptionModal(false)}>
              ✕
            </Button>
          </div>

          <div style={{ padding: '1.5rem' }}>
            {/* Patient & Doctor Info */}
            <div style={{ marginBottom: '2rem' }}>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem',
                }}
              >
                Prescription Information
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                }}
              >
                <div>
                  <strong>Patient:</strong> {selectedPrescription.patientName}
                  <br />
                  <strong>Age:</strong> {selectedPrescription.patientAge}
                  <br />
                  <strong>Date:</strong>{' '}
                  {new Date(selectedPrescription.prescriptionDate).toLocaleDateString()}
                </div>
                <div>
                  <strong>Doctor:</strong> {selectedPrescription.doctorName}
                  <br />
                  <strong>Department:</strong> {selectedPrescription.department}
                  <br />
                  <strong>Valid Until:</strong>{' '}
                  {new Date(selectedPrescription.validUntil).toLocaleDateString()}
                </div>
                <div>
                  <strong>Status:</strong>
                  <span
                    style={{
                      marginLeft: '0.5rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: `${getStatusColor(selectedPrescription.status)}15`,
                      color: getStatusColor(selectedPrescription.status),
                    }}
                  >
                    {selectedPrescription.status.replace('_', ' ')}
                  </span>
                  <br />
                  {selectedPrescription.pharmacistName && (
                    <>
                      <strong>Pharmacist:</strong> {selectedPrescription.pharmacistName}
                    </>
                  )}
                </div>
              </div>
              {selectedPrescription.diagnosis && (
                <div style={{ marginTop: '1rem' }}>
                  <strong>Diagnosis:</strong> {selectedPrescription.diagnosis}
                </div>
              )}
            </div>

            {/* Medications */}
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
              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      <th
                        style={{
                          padding: '0.75rem',
                          textAlign: 'left',
                          borderBottom: '1px solid #e5e7eb',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#374151',
                        }}
                      >
                        Medication
                      </th>
                      <th
                        style={{
                          padding: '0.75rem',
                          textAlign: 'left',
                          borderBottom: '1px solid #e5e7eb',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#374151',
                        }}
                      >
                        Strength
                      </th>
                      <th
                        style={{
                          padding: '0.75rem',
                          textAlign: 'center',
                          borderBottom: '1px solid #e5e7eb',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#374151',
                        }}
                      >
                        Quantity
                      </th>
                      <th
                        style={{
                          padding: '0.75rem',
                          textAlign: 'left',
                          borderBottom: '1px solid #e5e7eb',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#374151',
                        }}
                      >
                        Dosage & Frequency
                      </th>
                      <th
                        style={{
                          padding: '0.75rem',
                          textAlign: 'center',
                          borderBottom: '1px solid #e5e7eb',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#374151',
                        }}
                      >
                        Status
                      </th>
                      <th
                        style={{
                          padding: '0.75rem',
                          textAlign: 'right',
                          borderBottom: '1px solid #e5e7eb',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#374151',
                        }}
                      >
                        Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPrescription.medications.map((med) => (
                      <tr key={med.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                          <div>
                            <strong>{med.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                              {med.genericName} • {med.dosageForm}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{med.strength}</td>
                        <td
                          style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'center' }}
                        >
                          {med.quantity} {med.unit}
                          {med.dispensed > 0 && (
                            <div style={{ fontSize: '0.75rem', color: '#10b981' }}>
                              {med.dispensed} dispensed
                            </div>
                          )}
                          {med.remaining > 0 && (
                            <div style={{ fontSize: '0.75rem', color: '#f59e0b' }}>
                              {med.remaining} pending
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                          <div>
                            {med.dosage} {med.frequency}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {med.duration} • {med.route}
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <span
                            style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              backgroundColor: med.remaining > 0 ? '#f59e0b15' : '#10b98115',
                              color: med.remaining > 0 ? '#f59e0b' : '#10b981',
                            }}
                          >
                            {med.remaining > 0 ? 'Pending' : 'Dispensed'}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: '0.75rem',
                            fontSize: '0.875rem',
                            textAlign: 'right',
                            fontWeight: '600',
                          }}
                        >
                          ${med.cost.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Instructions */}
            <div style={{ marginBottom: '2rem' }}>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem',
                }}
              >
                Instructions
              </h3>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {selectedPrescription.medications.map((med) => (
                  <div
                    key={med.id}
                    style={{
                      padding: '0.75rem',
                      background: '#f0f9ff',
                      borderRadius: '6px',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        color: '#1f2937',
                        marginBottom: '0.25rem',
                      }}
                    >
                      {med.name}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{med.instructions}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div style={{ marginBottom: '2rem' }}>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem',
                }}
              >
                Cost Breakdown
              </h3>
              <div
                style={{
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span>Total Cost:</span>
                  <span style={{ fontWeight: '600' }}>
                    ${selectedPrescription.totalCost.toFixed(2)}
                  </span>
                </div>
                {selectedPrescription.insuranceCoverage && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem',
                      color: '#10b981',
                    }}
                  >
                    <span>Insurance Coverage:</span>
                    <span style={{ fontWeight: '600' }}>
                      -${selectedPrescription.insuranceCoverage.toFixed(2)}
                    </span>
                  </div>
                )}
                <hr
                  style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid #d1d5db' }}
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                  }}
                >
                  <span>Patient Payment:</span>
                  <span style={{ color: '#1f2937' }}>
                    ${selectedPrescription.patientPayment.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb',
              }}
            >
              <Button variant="outline" onClick={() => setShowPrescriptionModal(false)}>
                Close
              </Button>
              <Button variant="secondary">Print Prescription</Button>
              {selectedPrescription.status === 'ACTIVE' && (
                <Button variant="primary">Dispense Medication</Button>
              )}
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
              Prescriptions & Pharmacy
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>
              Manage prescriptions, medication dispensing, and pharmacy operations
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary">📊 Analytics</Button>
            <Button>+ New Prescription</Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <Card
            variant="elevated"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
              color: 'white',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {prescriptions.length}
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Prescriptions</div>
            </div>
          </Card>

          <Card
            variant="elevated"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {prescriptions.filter((p) => p.status === 'DISPENSED').length}
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Dispensed</div>
            </div>
          </Card>

          <Card
            variant="elevated"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {prescriptions.filter((p) => p.status === 'ACTIVE').length}
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Pending</div>
            </div>
          </Card>

          <Card
            variant="elevated"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                ${prescriptions.reduce((sum, p) => sum + p.totalCost, 0).toFixed(0)}
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Revenue</div>
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
            {[
              { key: 'prescriptions', label: '💊 Prescriptions', count: prescriptions.length },
              {
                key: 'pharmacy',
                label: '🏪 Pharmacy',
                count: prescriptions.filter((p) => p.status === 'ACTIVE').length,
              },
              { key: 'inventory', label: '📦 Inventory', count: null },
              { key: 'reports', label: '📊 Reports', count: null },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setCurrentTab(tab.key as 'prescriptions' | 'pharmacy' | 'inventory' | 'reports')}
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

        {(currentTab === 'prescriptions' || currentTab === 'pharmacy') && (
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
                  placeholder="Search prescriptions, patients, or doctors..."
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
                    Status Filter
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
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
                    <option value="all">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="DISPENSED">Dispensed</option>
                    <option value="PARTIALLY_DISPENSED">Partially Dispensed</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button variant="outline" size="sm">
                    Export
                  </Button>
                  <Button variant="secondary" size="sm">
                    Print
                  </Button>
                </div>
              </div>
            </Card>

            {/* Prescriptions List */}
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
                  {currentTab === 'pharmacy' ? 'Pharmacy Queue' : 'Prescriptions'} (
                  {filteredPrescriptions.length})
                </h2>
              </div>

              {filteredPrescriptions.length > 0 ? (
                filteredPrescriptions.map((prescription) => (
                  <PrescriptionCard key={prescription.id} prescription={prescription} />
                ))
              ) : (
                <Card>
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💊</div>
                    <h3
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '0.5rem',
                      }}
                    >
                      No prescriptions found
                    </h3>
                    <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                      No prescriptions match your current search criteria.
                    </p>
                    <Button>Create New Prescription</Button>
                  </div>
                </Card>
              )}
            </div>
          </>
        )}

        {currentTab === 'inventory' && (
          <Card>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                }}
              >
                Medication Inventory Management
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                Track medication stock levels, expiry dates, and reorder points. Inventory
                management system will be implemented here.
              </p>
              <Button variant="primary">Manage Inventory</Button>
            </div>
          </Card>
        )}

        {currentTab === 'reports' && (
          <Card>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                }}
              >
                Pharmacy Reports & Analytics
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                Comprehensive pharmacy analytics, medication usage patterns, and financial reporting
                will be available here.
              </p>
              <Button variant="primary">View Reports Dashboard</Button>
            </div>
          </Card>
        )}

        <PrescriptionModal />
      </div>
    </Layout>
  );
};

export default PrescriptionsPage;
