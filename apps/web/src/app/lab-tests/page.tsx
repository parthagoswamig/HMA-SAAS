'use client';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import React, { useState } from 'react';

interface LabTest {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  doctorId: string;
  doctorName: string;
  department: string;
  orderDate: string;
  expectedDate: string;
  completedDate?: string;
  status: 'ORDERED' | 'COLLECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'ROUTINE' | 'URGENT' | 'STAT';
  category:
    | 'HEMATOLOGY'
    | 'BIOCHEMISTRY'
    | 'MICROBIOLOGY'
    | 'IMMUNOLOGY'
    | 'PATHOLOGY'
    | 'MOLECULAR';
  tests: Array<{
    id: string;
    code: string;
    name: string;
    result?: string;
    referenceRange: string;
    unit: string;
    flag?: 'HIGH' | 'LOW' | 'CRITICAL' | 'ABNORMAL';
    status: 'PENDING' | 'COMPLETED';
  }>;
  technician?: string;
  notes?: string;
  attachments?: Array<{
    fileName: string;
    fileType: string;
    uploadDate: string;
  }>;
}

const LabTestsPage = () => {
  const [currentTab, setCurrentTab] = useState<'tests' | 'results' | 'orders' | 'reports'>('tests');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);

  const [labTests] = useState<LabTest[]>([
    {
      id: '1',
      orderNumber: 'LAB-2024-001',
      patientId: 'p1',
      patientName: 'John Doe',
      patientAge: 45,
      doctorId: 'd1',
      doctorName: 'Dr. Sarah Johnson',
      department: 'Cardiology',
      orderDate: '2024-12-05',
      expectedDate: '2024-12-06',
      completedDate: '2024-12-06',
      status: 'COMPLETED',
      priority: 'ROUTINE',
      category: 'BIOCHEMISTRY',
      technician: 'John Smith, MLT',
      tests: [
        {
          id: '1',
          code: 'TC',
          name: 'Total Cholesterol',
          result: '220',
          referenceRange: '< 200',
          unit: 'mg/dL',
          flag: 'HIGH',
          status: 'COMPLETED',
        },
        {
          id: '2',
          code: 'TG',
          name: 'Triglycerides',
          result: '180',
          referenceRange: '< 150',
          unit: 'mg/dL',
          flag: 'HIGH',
          status: 'COMPLETED',
        },
        {
          id: '3',
          code: 'HDL',
          name: 'HDL Cholesterol',
          result: '35',
          referenceRange: '> 40',
          unit: 'mg/dL',
          flag: 'LOW',
          status: 'COMPLETED',
        },
      ],
      notes: 'Fasting sample collected',
    },
    {
      id: '2',
      orderNumber: 'LAB-2024-002',
      patientId: 'p2',
      patientName: 'Emily Chen',
      patientAge: 28,
      doctorId: 'd2',
      doctorName: 'Dr. Michael Brown',
      department: 'Internal Medicine',
      orderDate: '2024-12-04',
      expectedDate: '2024-12-05',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      category: 'HEMATOLOGY',
      technician: 'Maria Garcia, MT',
      tests: [
        {
          id: '4',
          code: 'CBC',
          name: 'Complete Blood Count',
          referenceRange: 'Various',
          unit: 'Various',
          status: 'PENDING',
        },
        {
          id: '5',
          code: 'ESR',
          name: 'Erythrocyte Sedimentation Rate',
          result: '45',
          referenceRange: '< 20',
          unit: 'mm/hr',
          flag: 'HIGH',
          status: 'COMPLETED',
        },
      ],
    },
    {
      id: '3',
      orderNumber: 'LAB-2024-003',
      patientId: 'p3',
      patientName: 'Robert Wilson',
      patientAge: 65,
      doctorId: 'd3',
      doctorName: 'Dr. Lisa Anderson',
      department: 'Surgery',
      orderDate: '2024-12-03',
      expectedDate: '2024-12-04',
      status: 'ORDERED',
      priority: 'STAT',
      category: 'MICROBIOLOGY',
      tests: [
        {
          id: '6',
          code: 'BC',
          name: 'Blood Culture',
          referenceRange: 'Negative',
          unit: 'Qualitative',
          status: 'PENDING',
        },
        {
          id: '7',
          code: 'UA',
          name: 'Urine Analysis',
          referenceRange: 'Normal',
          unit: 'Various',
          status: 'PENDING',
        },
      ],
      notes: 'Pre-operative workup',
    },
  ]);

  const filteredTests = labTests.filter((test) => {
    const matchesSearch =
      test.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.doctorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || test.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || test.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '#10b981';
      case 'IN_PROGRESS':
        return '#3b82f6';
      case 'COLLECTED':
        return '#8b5cf6';
      case 'ORDERED':
        return '#f59e0b';
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

  const getFlagColor = (flag?: string) => {
    switch (flag) {
      case 'CRITICAL':
        return '#dc2626';
      case 'HIGH':
        return '#f59e0b';
      case 'LOW':
        return '#3b82f6';
      case 'ABNORMAL':
        return '#8b5cf6';
      default:
        return '#10b981';
    }
  };

  const TestCard = ({ test }: { test: LabTest }) => (
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
                {test.orderNumber}
              </h3>
              <p style={{ margin: '0', fontSize: '0.875rem', color: '#6b7280' }}>
                {test.patientName} • {test.patientAge} years
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  backgroundColor: `${getStatusColor(test.status)}15`,
                  color: getStatusColor(test.status),
                }}
              >
                {test.status.replace('_', ' ')}
              </span>
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  backgroundColor: `${getPriorityColor(test.priority)}15`,
                  color: getPriorityColor(test.priority),
                }}
              >
                {test.priority}
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
                <strong>Order Date:</strong> {new Date(test.orderDate).toLocaleDateString()}
              </p>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Expected:</strong> {new Date(test.expectedDate).toLocaleDateString()}
              </p>
              {test.completedDate && (
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                  <strong>Completed:</strong> {new Date(test.completedDate).toLocaleDateString()}
                </p>
              )}
            </div>

            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Doctor:</strong> {test.doctorName}
              </p>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Department:</strong> {test.department}
              </p>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Category:</strong> {test.category}
              </p>
            </div>

            {test.technician && (
              <div>
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                  <strong>Technician:</strong> {test.technician}
                </p>
              </div>
            )}
          </div>

          {/* Test Summary */}
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
              Tests ({test.tests.length})
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '0.5rem',
              }}
            >
              {test.tests.slice(0, 3).map((t) => (
                <div key={t.id} style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>
                      <strong>{t.code}:</strong> {t.name.slice(0, 20)}
                      {t.name.length > 20 ? '...' : ''}
                    </span>
                    {t.flag && (
                      <span
                        style={{
                          padding: '0.125rem 0.25rem',
                          borderRadius: '4px',
                          fontSize: '0.625rem',
                          fontWeight: '600',
                          backgroundColor: `${getFlagColor(t.flag)}15`,
                          color: getFlagColor(t.flag),
                        }}
                      >
                        {t.flag}
                      </span>
                    )}
                  </div>
                  {t.result && (
                    <div style={{ marginTop: '0.125rem' }}>
                      Result: {t.result} {t.unit}
                    </div>
                  )}
                </div>
              ))}
              {test.tests.length > 3 && (
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' }}>
                  +{test.tests.length - 3} more tests...
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
              setSelectedTest(test);
              setShowTestModal(true);
            }}
          >
            View Results
          </Button>
          <Button size="sm" variant="primary">
            Edit Order
          </Button>
          <Button size="sm" variant="secondary">
            Print Report
          </Button>
        </div>
      </div>
    </Card>
  );

  const TestResultModal = () =>
    showTestModal &&
    selectedTest && (
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
              Lab Test Results - {selectedTest.orderNumber}
            </h2>
            <Button variant="outline" size="sm" onClick={() => setShowTestModal(false)}>
              ✕
            </Button>
          </div>

          <div style={{ padding: '1.5rem' }}>
            {/* Patient & Order Info */}
            <div style={{ marginBottom: '2rem' }}>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem',
                }}
              >
                Order Information
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                }}
              >
                <div>
                  <strong>Patient:</strong> {selectedTest.patientName}
                  <br />
                  <strong>Age:</strong> {selectedTest.patientAge}
                  <br />
                  <strong>Order Date:</strong>{' '}
                  {new Date(selectedTest.orderDate).toLocaleDateString()}
                </div>
                <div>
                  <strong>Doctor:</strong> {selectedTest.doctorName}
                  <br />
                  <strong>Department:</strong> {selectedTest.department}
                  <br />
                  <strong>Priority:</strong>
                  <span
                    style={{
                      marginLeft: '0.5rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: `${getPriorityColor(selectedTest.priority)}15`,
                      color: getPriorityColor(selectedTest.priority),
                    }}
                  >
                    {selectedTest.priority}
                  </span>
                </div>
                <div>
                  <strong>Category:</strong> {selectedTest.category}
                  <br />
                  <strong>Status:</strong>
                  <span
                    style={{
                      marginLeft: '0.5rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: `${getStatusColor(selectedTest.status)}15`,
                      color: getStatusColor(selectedTest.status),
                    }}
                  >
                    {selectedTest.status}
                  </span>
                  {selectedTest.technician && (
                    <>
                      <br />
                      <strong>Technician:</strong> {selectedTest.technician}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Test Results */}
            <div style={{ marginBottom: '2rem' }}>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem',
                }}
              >
                Test Results
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
                        Test Code
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
                        Test Name
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
                        Result
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
                        Reference Range
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
                        Unit
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
                        Flag
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
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTest.tests.map((test) => (
                      <tr key={test.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                          <strong>{test.code}</strong>
                        </td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{test.name}</td>
                        <td
                          style={{
                            padding: '0.75rem',
                            fontSize: '0.875rem',
                            fontWeight: test.result ? '600' : 'normal',
                            color: test.flag ? getFlagColor(test.flag) : '#1f2937',
                          }}
                        >
                          {test.result || 'Pending'}
                        </td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
                          {test.referenceRange}
                        </td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
                          {test.unit}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          {test.flag && (
                            <span
                              style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                backgroundColor: `${getFlagColor(test.flag)}15`,
                                color: getFlagColor(test.flag),
                              }}
                            >
                              {test.flag}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <span
                            style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              backgroundColor:
                                test.status === 'COMPLETED' ? '#10b98115' : '#f59e0b15',
                              color: test.status === 'COMPLETED' ? '#10b981' : '#f59e0b',
                            }}
                          >
                            {test.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes */}
            {selectedTest.notes && (
              <div style={{ marginBottom: '2rem' }}>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '1rem',
                  }}
                >
                  Notes
                </h3>
                <div
                  style={{
                    padding: '0.75rem',
                    background: '#f8fafc',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    color: '#6b7280',
                  }}
                >
                  {selectedTest.notes}
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
              <Button variant="outline" onClick={() => setShowTestModal(false)}>
                Close
              </Button>
              <Button variant="secondary">Print Report</Button>
              <Button variant="primary">Send to Doctor</Button>
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
              Laboratory Tests
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>
              Manage lab test orders, results, and reporting
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary">📊 Analytics</Button>
            <Button onClick={() => setCurrentTab('orders')}>+ New Test Order</Button>
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
                {labTests.length}
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Orders</div>
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
                {labTests.filter((t) => t.status === 'COMPLETED').length}
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Completed</div>
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
                {labTests.filter((t) => t.status === 'IN_PROGRESS').length}
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>In Progress</div>
            </div>
          </Card>

          <Card
            variant="elevated"
            style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: 'white',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {labTests.filter((t) => t.priority === 'STAT').length}
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Stat Orders</div>
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
            {[
              { key: 'tests', label: '🧪 All Tests', count: labTests.length },
              {
                key: 'results',
                label: '📋 Results',
                count: labTests.filter((t) => t.status === 'COMPLETED').length,
              },
              { key: 'orders', label: '➕ New Order', count: null },
              { key: 'reports', label: '📊 Reports', count: null },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setCurrentTab(tab.key as 'tests' | 'results' | 'orders' | 'reports')}
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

        {(currentTab === 'tests' || currentTab === 'results') && (
          <>
            {/* Filters */}
            <Card style={{ marginBottom: '2rem' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  alignItems: 'end',
                }}
              >
                <Input
                  placeholder="Search tests, patients, or doctors..."
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
                    <option value="ORDERED">Ordered</option>
                    <option value="COLLECTED">Collected</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

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
                    Category Filter
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
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
                    <option value="all">All Categories</option>
                    <option value="HEMATOLOGY">Hematology</option>
                    <option value="BIOCHEMISTRY">Biochemistry</option>
                    <option value="MICROBIOLOGY">Microbiology</option>
                    <option value="IMMUNOLOGY">Immunology</option>
                    <option value="PATHOLOGY">Pathology</option>
                    <option value="MOLECULAR">Molecular</option>
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

            {/* Tests List */}
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
                  Lab Tests ({filteredTests.length})
                </h2>
              </div>

              {filteredTests.length > 0 ? (
                filteredTests.map((test) => <TestCard key={test.id} test={test} />)
              ) : (
                <Card>
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧪</div>
                    <h3
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '0.5rem',
                      }}
                    >
                      No lab tests found
                    </h3>
                    <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                      No tests match your current search criteria.
                    </p>
                    <Button onClick={() => setCurrentTab('orders')}>Create New Test Order</Button>
                  </div>
                </Card>
              )}
            </div>
          </>
        )}

        {currentTab === 'orders' && (
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
                Create New Lab Test Order
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                Lab test order form will be implemented here with patient selection, test selection,
                and priority settings.
              </p>
              <Button variant="primary">Open Order Form</Button>
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
                Laboratory Reports & Analytics
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                Comprehensive lab analytics, turnaround time reports, and quality metrics will be
                available here.
              </p>
              <Button variant="primary">View Reports Dashboard</Button>
            </div>
          </Card>
        )}

        <TestResultModal />
      </div>
    </Layout>
  );
};

export default LabTestsPage;
