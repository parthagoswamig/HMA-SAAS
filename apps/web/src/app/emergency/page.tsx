'use client';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import React, { useState } from 'react';

interface EmergencyAlert {
  id: string;
  alertId: string;
  type:
    | 'CODE_BLUE'
    | 'CODE_RED'
    | 'CODE_GRAY'
    | 'MASS_CASUALTY'
    | 'SECURITY'
    | 'FIRE'
    | 'EVACUATION'
    | 'NATURAL_DISASTER';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  location: string;
  department: string;
  reportedBy: string;
  reportedAt: string;
  status: 'ACTIVE' | 'RESPONDING' | 'RESOLVED' | 'CANCELLED';
  responseTeam: string[];
  estimatedArrival?: string;
  resolvedAt?: string;
  notes: string;
  actionsTaken: string[];
  affectedAreas: string[];
  resourcesUsed: string[];
}

const EmergencyPage = () => {
  const [currentTab, setCurrentTab] = useState<
    'dashboard' | 'alerts' | 'beds' | 'contacts' | 'patients' | 'triage'
  >('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [alertFilter, setAlertFilter] = useState('ALL');
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);

  const getAlertTypeColor = (type: string) => {
    const colors = {
      CODE_BLUE: '#ef4444',
      CODE_RED: '#dc2626',
      CODE_GRAY: '#6b7280',
      MASS_CASUALTY: '#7c2d12',
      SECURITY: '#f59e0b',
      FIRE: '#ea580c',
      EVACUATION: '#8b5cf6',
      NATURAL_DISASTER: '#059669',
    };
    return colors[type as keyof typeof colors] || '#6b7280';
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      CRITICAL: '#ef4444',
      HIGH: '#f59e0b',
      MEDIUM: '#3b82f6',
      LOW: '#10b981',
    };
    return colors[severity as keyof typeof colors] || '#6b7280';
  };

  const getBedStatusColor = (status: string) => {
    const colors = {
      AVAILABLE: '#10b981',
      OCCUPIED: '#f59e0b',
      RESERVED: '#3b82f6',
      MAINTENANCE: '#ef4444',
      CLEANING: '#6b7280',
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  const AlertModal = () => (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
            Emergency Alert Details
          </h2>
          <button
            onClick={() => setShowAlertModal(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280',
            }}
          >
            ×
          </button>
        </div>

        {selectedAlert && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Alert Header */}
            <div>
              <div
                style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}
              >
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                  {selectedAlert.title}
                </h3>
                <span
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'white',
                    backgroundColor: getAlertTypeColor(selectedAlert.type),
                  }}
                >
                  {selectedAlert.type.replace('_', ' ')}
                </span>
                <span
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'white',
                    backgroundColor: getSeverityColor(selectedAlert.severity),
                  }}
                >
                  {selectedAlert.severity}
                </span>
              </div>
              <p style={{ color: '#6b7280', fontSize: '1rem', margin: 0 }}>
                {selectedAlert.description}
              </p>
            </div>

            {/* Location & Details */}
            <div>
              <h4
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem',
                }}
              >
                Location & Details
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <span style={{ fontWeight: '600' }}>Location:</span> {selectedAlert.location}
                </div>
                <div>
                  <span style={{ fontWeight: '600' }}>Department:</span> {selectedAlert.department}
                </div>
                <div>
                  <span style={{ fontWeight: '600' }}>Reported By:</span> {selectedAlert.reportedBy}
                </div>
                <div>
                  <span style={{ fontWeight: '600' }}>Time:</span>{' '}
                  {new Date(selectedAlert.reportedAt).toLocaleString()}
                </div>
                <div>
                  <span style={{ fontWeight: '600' }}>Alert ID:</span> {selectedAlert.alertId}
                </div>
                <div>
                  <span style={{ fontWeight: '600' }}>Status:</span>
                  <span
                    style={{
                      marginLeft: '0.5rem',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: 'white',
                      backgroundColor:
                        selectedAlert.status === 'RESOLVED'
                          ? '#10b981'
                          : selectedAlert.status === 'RESPONDING'
                            ? '#f59e0b'
                            : '#ef4444',
                    }}
                  >
                    {selectedAlert.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Response Team */}
            <div>
              <h4
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem',
                }}
              >
                Response Team
              </h4>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {selectedAlert.responseTeam.map((member, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>{member}</span>
                    <span style={{ fontSize: '0.75rem', color: '#10b981' }}>✓ Responding</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Taken */}
            <div>
              <h4
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem',
                }}
              >
                Actions Taken
              </h4>
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                {selectedAlert.actionsTaken.map((action, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#10b981' }}>✓</span>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resources Used */}
            <div>
              <h4
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem',
                }}
              >
                Resources Used
              </h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {selectedAlert.resourcesUsed.map((resource, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#e0f2fe',
                      color: '#0e7490',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                    }}
                  >
                    {resource}
                  </span>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <h4
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem',
                }}
              >
                Notes
              </h4>
              <p
                style={{
                  padding: '1rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  margin: 0,
                  lineHeight: '1.6',
                }}
              >
                {selectedAlert.notes}
              </p>
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
              {selectedAlert.status === 'ACTIVE' && (
                <Button variant="primary">🚨 Update Status</Button>
              )}
              <Button variant="outline">📋 Add Notes</Button>
              <Button variant="secondary" onClick={() => setShowAlertModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
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
              Emergency Management
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>
              Monitor emergency alerts, bed availability, and critical patient status
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="primary" onClick={() => setShowAlertModal(true)}>
              🚨 New Alert
            </Button>
            <Button variant="outline">📊 Reports</Button>
          </div>
        </div>

        {/* Emergency Status Overview */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <Card style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2rem', color: '#ef4444', marginBottom: '0.5rem' }}>🚨</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                {[].filter(/* TODO: API */ (a) => a.status === 'ACTIVE').length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#dc2626' }}>Active Alerts</div>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2rem', color: '#10b981', marginBottom: '0.5rem' }}>🛏️</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                {[].filter(/* TODO: API */ (b) => b.status === 'AVAILABLE').length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Available Beds</div>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2rem', color: '#f59e0b', marginBottom: '0.5rem' }}>👥</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                {[].filter(/* TODO: API */ (p) => p.severity === 'CRITICAL').length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Critical Patients</div>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2rem', color: '#3b82f6', marginBottom: '0.5rem' }}>📞</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                {[].filter(/* TODO: API */ (c) => c.isOnDuty).length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>On-Duty Staff</div>
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
            {[
              { key: 'dashboard', label: '🏥 Dashboard', desc: 'Overview' },
              { key: 'alerts', label: '🚨 Active Alerts', desc: 'Emergency Alerts' },
              { key: 'beds', label: '🛏️ Bed Status', desc: 'Availability' },
              { key: 'contacts', label: '📞 Contacts', desc: 'Emergency Staff' },
              { key: 'patients', label: '👥 Critical Patients', desc: 'Monitoring' },
              { key: 'triage', label: '⚡ Triage', desc: 'ED Queue' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() =>
                  setCurrentTab(
                    tab.key as 'dashboard' | 'alerts' | 'beds' | 'contacts' | 'patients' | 'triage'
                  )
                }
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
                <div>{tab.label}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{tab.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {currentTab === 'dashboard' && (
          <div style={{ display: 'grid', gap: '2rem' }}>
            {/* Recent Alerts */}
            <Card>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem',
                }}
              >
                Recent Emergency Alerts
              </h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {[].slice(/* TODO: API */ 0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    style={{
                      padding: '1rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          alignItems: 'center',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <span
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: 'white',
                            backgroundColor: getAlertTypeColor(alert.type),
                          }}
                        >
                          {alert.type.replace('_', ' ')}
                        </span>
                        <span
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: 'white',
                            backgroundColor: getSeverityColor(alert.severity),
                          }}
                        >
                          {alert.severity}
                        </span>
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {alert.location}
                        </span>
                      </div>
                      <h4
                        style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', margin: 0 }}
                      >
                        {alert.title}
                      </h4>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                        Reported {new Date(alert.reportedAt).toLocaleString()}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Critical Patients Summary */}
            <Card>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem',
                }}
              >
                Critical Patients
              </h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {[].map(
                  /* TODO: API */ (patient) => (
                    <div
                      key={patient.id}
                      style={{
                        padding: '1rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <h4
                          style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#1f2937',
                            margin: 0,
                          }}
                        >
                          {patient.name} ({patient.bedNumber})
                        </h4>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: 'white',
                            backgroundColor:
                              patient.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b',
                          }}
                        >
                          {patient.severity}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                          gap: '0.5rem',
                          fontSize: '0.875rem',
                          color: '#6b7280',
                        }}
                      >
                        <div>BP: {patient.vitalSigns.bloodPressure}</div>
                        <div>HR: {patient.vitalSigns.heartRate}</div>
                        <div>Temp: {patient.vitalSigns.temperature}°F</div>
                        <div>SpO2: {patient.vitalSigns.oxygenSaturation}%</div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Alerts Tab */}
        {currentTab === 'alerts' && (
          <>
            {/* Alert Filters */}
            <Card style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <Input
                    placeholder="Search alerts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  value={alertFilter}
                  onChange={(e) => setAlertFilter(e.target.value)}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: 'white',
                    minWidth: '150px',
                  }}
                >
                  <option value="ALL">All Alerts</option>
                  <option value="ACTIVE">Active</option>
                  <option value="RESPONDING">Responding</option>
                  <option value="RESOLVED">Resolved</option>
                </select>

                <Button variant="outline">🔄 Refresh</Button>
              </div>
            </Card>

            {/* Alerts List */}
            <div style={{ display: 'grid', gap: '1rem' }}>
              {[].map(
                /* TODO: API */ (alert) => (
                  <Card
                    key={alert.id}
                    style={{
                      cursor: 'pointer',
                      border:
                        alert.severity === 'CRITICAL' ? '2px solid #ef4444' : '1px solid #e5e7eb',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center',
                            marginBottom: '0.75rem',
                          }}
                        >
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: 'white',
                              backgroundColor: getAlertTypeColor(alert.type),
                            }}
                          >
                            {alert.type.replace('_', ' ')}
                          </span>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: 'white',
                              backgroundColor: getSeverityColor(alert.severity),
                            }}
                          >
                            {alert.severity}
                          </span>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: 'white',
                              backgroundColor:
                                alert.status === 'RESOLVED'
                                  ? '#10b981'
                                  : alert.status === 'RESPONDING'
                                    ? '#f59e0b'
                                    : '#ef4444',
                            }}
                          >
                            {alert.status}
                          </span>
                        </div>

                        <h3
                          style={{
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: '#1f2937',
                            marginBottom: '0.5rem',
                          }}
                        >
                          {alert.title}
                        </h3>
                        <p
                          style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}
                        >
                          {alert.description}
                        </p>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            color: '#6b7280',
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: '600' }}>Location:</span> {alert.location}
                          </div>
                          <div>
                            <span style={{ fontWeight: '600' }}>Reported:</span>{' '}
                            {new Date(alert.reportedAt).toLocaleString()}
                          </div>
                          <div>
                            <span style={{ fontWeight: '600' }}>By:</span> {alert.reportedBy}
                          </div>
                          <div>
                            <span style={{ fontWeight: '600' }}>Response Team:</span>{' '}
                            {alert.responseTeam.length} members
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAlert(alert);
                            setShowAlertModal(true);
                          }}
                        >
                          View Details
                        </Button>
                        {alert.status === 'ACTIVE' && (
                          <Button size="sm" variant="primary">
                            🚨 Respond
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              )}
            </div>
          </>
        )}

        {/* Bed Status Tab */}
        {currentTab === 'beds' && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {[].map(
              /* TODO: API */ (bed) => (
                <Card key={bed.id}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          gap: '1rem',
                          alignItems: 'center',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <h3
                          style={{
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: '#1f2937',
                            margin: 0,
                          }}
                        >
                          {bed.bedNumber} - {bed.wardName}
                        </h3>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: 'white',
                            backgroundColor: getBedStatusColor(bed.status),
                          }}
                        >
                          {bed.status}
                        </span>
                        <span
                          style={{
                            padding: '0.125rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.625rem',
                            fontWeight: '600',
                            color:
                              bed.priority === 'HIGH'
                                ? '#dc2626'
                                : bed.priority === 'MEDIUM'
                                  ? '#f59e0b'
                                  : '#10b981',
                            backgroundColor:
                              bed.priority === 'HIGH'
                                ? '#fef2f2'
                                : bed.priority === 'MEDIUM'
                                  ? '#fef3c7'
                                  : '#f0fdf4',
                          }}
                        >
                          {bed.priority} PRIORITY
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '0.5rem',
                          marginBottom: '0.75rem',
                          fontSize: '0.875rem',
                          color: '#6b7280',
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: '600' }}>Location:</span> {bed.location}
                        </div>
                        <div>
                          <span style={{ fontWeight: '600' }}>Type:</span> {bed.bedType}
                        </div>
                        {bed.patientName && (
                          <div>
                            <span style={{ fontWeight: '600' }}>Patient:</span> {bed.patientName}
                          </div>
                        )}
                        {bed.nurseAssigned && (
                          <div>
                            <span style={{ fontWeight: '600' }}>Nurse:</span> {bed.nurseAssigned}
                          </div>
                        )}
                        <div>
                          <span style={{ fontWeight: '600' }}>Last Cleaned:</span>{' '}
                          {new Date(bed.lastCleaned).toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <span style={{ fontWeight: '600', fontSize: '0.875rem', color: '#6b7280' }}>
                          Equipment:
                        </span>
                        <div
                          style={{
                            display: 'flex',
                            gap: '0.5rem',
                            flexWrap: 'wrap',
                            marginTop: '0.25rem',
                          }}
                        >
                          {bed.equipmentAvailable.map((equipment, index) => (
                            <span
                              key={index}
                              style={{
                                padding: '0.125rem 0.5rem',
                                backgroundColor: '#e0f2fe',
                                color: '#0e7490',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                              }}
                            >
                              {equipment}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginLeft: '1rem' }}>
                      <Button size="sm" variant="outline">
                        📋 Details
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            )}
          </div>
        )}

        {/* Other tabs placeholder */}
        {['contacts', 'patients', 'triage'].includes(currentTab) && (
          <Card>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {currentTab === 'contacts' && '📞'}
                {currentTab === 'patients' && '👥'}
                {currentTab === 'triage' && '⚡'}
              </div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                }}
              >
                {currentTab === 'contacts' && 'Emergency Contacts Directory'}
                {currentTab === 'patients' && 'Critical Patient Monitoring'}
                {currentTab === 'triage' && 'Emergency Department Triage'}
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                {currentTab === 'contacts' &&
                  'Access emergency contact information for key personnel and response teams.'}
                {currentTab === 'patients' &&
                  'Monitor critical patients with real-time vital signs and alerts.'}
                {currentTab === 'triage' &&
                  'Manage emergency department triage queue and patient prioritization.'}
              </p>
              <Button variant="primary">
                {currentTab === 'contacts' && '📞 View Contacts'}
                {currentTab === 'patients' && '👥 Monitor Patients'}
                {currentTab === 'triage' && '⚡ Manage Triage'}
              </Button>
            </div>
          </Card>
        )}

        {/* Alert Modal */}
        {showAlertModal && <AlertModal />}
      </div>
    </Layout>
  );
};

export default EmergencyPage;
