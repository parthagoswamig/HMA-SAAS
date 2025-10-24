'use client';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import React, { useState } from 'react';

interface TelemedicineConsultation {
  id: string;
  consultationId: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientEmail: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  appointmentDate: string;
  duration: number;
  status: 'SCHEDULED' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  consultationType: 'VIDEO' | 'AUDIO' | 'CHAT';
  chiefComplaint: string;
  symptoms: string[];
  vitalSigns?: {
    temperature?: number;
    bloodPressure?: string;
    heartRate?: number;
    oxygenSaturation?: number;
  };
  prescriptions: Prescription[];
  followUpRequired: boolean;
  followUpDate?: string;
  notes: string;
  rating?: number;
  feedback?: string;
  sessionUrl?: string;
  recordingAvailable: boolean;
}

interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  prescribedDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DISCONTINUED';
}

const TelemedicinePage = () => {
  const [currentTab, setCurrentTab] = useState<
    'consultations' | 'waiting-room' | 'sessions' | 'analytics' | 'settings'
  >('consultations');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('TODAY');
  const [selectedConsultation, setSelectedConsultation] = useState<TelemedicineConsultation | null>(
    null
  );
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);

  const filteredConsultations = [].filter(
    /* TODO: API */ (consultation) => {
      const matchesSearch =
        consultation.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.consultationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || consultation.status === statusFilter;

      const today = new Date().toDateString();
      const consultationDate = new Date(consultation.appointmentDate).toDateString();
      const matchesDate =
        dateFilter === 'ALL' ||
        (dateFilter === 'TODAY' && consultationDate === today) ||
        (dateFilter === 'UPCOMING' && new Date(consultation.appointmentDate) > new Date());

      return matchesSearch && matchesStatus && matchesDate;
    }
  );

  const getStatusColor = (status: string) => {
    const colors = {
      SCHEDULED: '#3b82f6',
      WAITING: '#f59e0b',
      IN_PROGRESS: '#10b981',
      COMPLETED: '#6b7280',
      CANCELLED: '#ef4444',
      NO_SHOW: '#dc2626',
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  const getConsultationTypeIcon = (type: string) => {
    const icons = {
      VIDEO: '🎥',
      AUDIO: '🎵',
      CHAT: '💬',
    };
    return icons[type as keyof typeof icons] || '📞';
  };

  const ConsultationModal = () => (
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
          maxWidth: '900px',
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
            Consultation Details
          </h2>
          <button
            onClick={() => setShowConsultationModal(false)}
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

        {selectedConsultation && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Header Info */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
              }}
            >
              <div>
                <span style={{ fontWeight: '600' }}>Consultation ID:</span>{' '}
                {selectedConsultation.consultationId}
              </div>
              <div>
                <span style={{ fontWeight: '600' }}>Date & Time:</span>{' '}
                {new Date(selectedConsultation.appointmentDate).toLocaleString()}
              </div>
              <div>
                <span style={{ fontWeight: '600' }}>Duration:</span> {selectedConsultation.duration}{' '}
                minutes
              </div>
              <div>
                <span style={{ fontWeight: '600' }}>Status:</span>
                <span
                  style={{
                    marginLeft: '0.5rem',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'white',
                    backgroundColor: getStatusColor(selectedConsultation.status),
                  }}
                >
                  {selectedConsultation.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Patient Information */}
            <div>
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
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1rem',
                }}
              >
                <div>
                  <span style={{ fontWeight: '600' }}>Name:</span>{' '}
                  {selectedConsultation.patientName}
                </div>
                <div>
                  <span style={{ fontWeight: '600' }}>Age:</span> {selectedConsultation.patientAge}{' '}
                  years
                </div>
                <div>
                  <span style={{ fontWeight: '600' }}>Email:</span>{' '}
                  {selectedConsultation.patientEmail}
                </div>
                <div>
                  <span style={{ fontWeight: '600' }}>Phone:</span>{' '}
                  {selectedConsultation.patientPhone}
                </div>
              </div>
            </div>

            {/* Doctor Information */}
            <div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem',
                }}
              >
                Healthcare Provider
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                }}
              >
                <div>
                  <span style={{ fontWeight: '600' }}>Doctor:</span>{' '}
                  {selectedConsultation.doctorName}
                </div>
                <div>
                  <span style={{ fontWeight: '600' }}>Specialty:</span>{' '}
                  {selectedConsultation.specialty}
                </div>
                <div>
                  <span style={{ fontWeight: '600' }}>Consultation Type:</span>
                  {getConsultationTypeIcon(selectedConsultation.consultationType)}{' '}
                  {selectedConsultation.consultationType}
                </div>
              </div>
            </div>

            {/* Clinical Information */}
            <div>
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
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Chief Complaint:</div>
                <p
                  style={{
                    padding: '1rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    margin: 0,
                  }}
                >
                  {selectedConsultation.chiefComplaint}
                </p>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Symptoms:</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {selectedConsultation.symptoms.map((symptom, index) => (
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
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>

              {selectedConsultation.vitalSigns && (
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Vital Signs:</div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '0.5rem',
                    }}
                  >
                    {selectedConsultation.vitalSigns.temperature && (
                      <div>Temperature: {selectedConsultation.vitalSigns.temperature}°F</div>
                    )}
                    {selectedConsultation.vitalSigns.bloodPressure && (
                      <div>BP: {selectedConsultation.vitalSigns.bloodPressure} mmHg</div>
                    )}
                    {selectedConsultation.vitalSigns.heartRate && (
                      <div>HR: {selectedConsultation.vitalSigns.heartRate} bpm</div>
                    )}
                    {selectedConsultation.vitalSigns.oxygenSaturation && (
                      <div>O2 Sat: {selectedConsultation.vitalSigns.oxygenSaturation}%</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Prescriptions */}
            {selectedConsultation.prescriptions.length > 0 && (
              <div>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '1rem',
                  }}
                >
                  Prescriptions
                </h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {selectedConsultation.prescriptions.map((prescription) => (
                    <div
                      key={prescription.id}
                      style={{
                        padding: '1rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        backgroundColor: '#f9fafb',
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
                          {prescription.medication}
                        </h4>
                        <span
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: 'white',
                            backgroundColor:
                              prescription.status === 'ACTIVE' ? '#10b981' : '#6b7280',
                          }}
                        >
                          {prescription.status}
                        </span>
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                        <div>
                          Dosage: {prescription.dosage} • Frequency: {prescription.frequency}
                        </div>
                        <div>Duration: {prescription.duration}</div>
                        <div>Instructions: {prescription.instructions}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem',
                }}
              >
                Clinical Notes
              </h3>
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
                {selectedConsultation.notes}
              </p>
            </div>

            {/* Follow-up */}
            {selectedConsultation.followUpRequired && (
              <div>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '1rem',
                  }}
                >
                  Follow-up Required
                </h3>
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: '#fef3c7',
                    borderRadius: '8px',
                    border: '1px solid #f59e0b',
                  }}
                >
                  <div style={{ color: '#92400e' }}>
                    Follow-up appointment scheduled for:{' '}
                    {selectedConsultation.followUpDate
                      ? new Date(selectedConsultation.followUpDate).toLocaleString()
                      : 'To be scheduled'}
                  </div>
                </div>
              </div>
            )}

            {/* Patient Feedback */}
            {selectedConsultation.rating && (
              <div>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '1rem',
                  }}
                >
                  Patient Feedback
                </h3>
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '600', marginRight: '0.5rem' }}>Rating:</span>
                    <div style={{ color: '#f59e0b' }}>
                      {'⭐'.repeat(selectedConsultation.rating)}
                    </div>
                  </div>
                  {selectedConsultation.feedback && (
                    <p style={{ color: '#166534', margin: 0 }}>{selectedConsultation.feedback}</p>
                  )}
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
              {selectedConsultation.status === 'SCHEDULED' ||
              selectedConsultation.status === 'WAITING' ? (
                <Button variant="primary" onClick={() => setShowSessionModal(true)}>
                  🎥 Join Session
                </Button>
              ) : null}
              {selectedConsultation.recordingAvailable && (
                <Button variant="outline">📹 View Recording</Button>
              )}
              <Button variant="secondary" onClick={() => setShowConsultationModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const SessionModal = () => (
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
          maxWidth: '600px',
          width: '100%',
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
            Video Session
          </h2>
          <button
            onClick={() => setShowSessionModal(false)}
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

        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '100%',
              height: '300px',
              backgroundColor: '#1f2937',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
              color: 'white',
            }}
          >
            <div>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎥</div>
              <div style={{ fontSize: '1.25rem' }}>Video Call Interface</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                Integration with video conferencing platform
              </div>
            </div>
          </div>

          <div
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}
          >
            <Button variant="primary">📹 Turn on Camera</Button>
            <Button variant="outline">🎤 Mute/Unmute</Button>
            <Button variant="secondary">💬 Chat</Button>
            <Button variant="secondary">📋 Notes</Button>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Button variant="outline" onClick={() => setShowSessionModal(false)}>
              End Session
            </Button>
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
              Telemedicine Platform
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>
              Manage virtual consultations, patient sessions, and remote healthcare delivery
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="primary">🎥 New Consultation</Button>
            <Button variant="outline">📊 Analytics</Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
            {[
              { key: 'consultations', label: '📋 Consultations', desc: 'All Sessions' },
              { key: 'waiting-room', label: '⏳ Waiting Room', desc: 'Current Queue' },
              { key: 'sessions', label: '🎥 Active Sessions', desc: 'Live Calls' },
              { key: 'analytics', label: '📊 Analytics', desc: 'Platform Metrics' },
              { key: 'settings', label: '⚙️ Settings', desc: 'Configuration' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setCurrentTab(tab.key as 'consultations' | 'waiting-room' | 'sessions' | 'analytics' | 'settings')}
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

        {/* Consultations Tab */}
        {currentTab === 'consultations' && (
          <>
            {/* Search and Filters */}
            <Card style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <Input
                    placeholder="Search consultations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: 'white',
                    minWidth: '150px',
                  }}
                >
                  <option value="ALL">All Status</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="WAITING">Waiting</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>

                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: 'white',
                    minWidth: '150px',
                  }}
                >
                  <option value="ALL">All Dates</option>
                  <option value="TODAY">Today</option>
                  <option value="UPCOMING">Upcoming</option>
                </select>

                <Button variant="outline">🔄 Refresh</Button>
              </div>
            </Card>

            {/* Consultations List */}
            <div style={{ display: 'grid', gap: '1rem' }}>
              {filteredConsultations.map((consultation) => (
                <Card key={consultation.id}>
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
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: '#1f2937',
                            margin: 0,
                          }}
                        >
                          {consultation.patientName}
                        </h3>
                        <span style={{ fontSize: '1.5rem' }}>
                          {getConsultationTypeIcon(consultation.consultationType)}
                        </span>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: 'white',
                            backgroundColor: getStatusColor(consultation.status),
                          }}
                        >
                          {consultation.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '0.5rem',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <div style={{ color: '#6b7280' }}>
                          <span style={{ fontWeight: '600' }}>Doctor:</span>{' '}
                          {consultation.doctorName}
                        </div>
                        <div style={{ color: '#6b7280' }}>
                          <span style={{ fontWeight: '600' }}>Specialty:</span>{' '}
                          {consultation.specialty}
                        </div>
                        <div style={{ color: '#6b7280' }}>
                          <span style={{ fontWeight: '600' }}>Date:</span>{' '}
                          {new Date(consultation.appointmentDate).toLocaleString()}
                        </div>
                        <div style={{ color: '#6b7280' }}>
                          <span style={{ fontWeight: '600' }}>Duration:</span>{' '}
                          {consultation.duration} min
                        </div>
                      </div>

                      <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
                        <span style={{ fontWeight: '600' }}>Chief Complaint:</span>{' '}
                        {consultation.chiefComplaint}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedConsultation(consultation);
                          setShowConsultationModal(true);
                        }}
                      >
                        View Details
                      </Button>
                      {(consultation.status === 'SCHEDULED' ||
                        consultation.status === 'WAITING') && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => setShowSessionModal(true)}
                        >
                          Join Session
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Waiting Room Tab */}
        {currentTab === 'waiting-room' && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <Card>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                }}
              >
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                  Virtual Waiting Room
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: '#6b7280' }}>Patients waiting: {0}</span>
                  <Button size="sm" variant="outline">
                    Refresh
                  </Button>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {[].map(
                  /* TODO: API */ (patient) => (
                    <div
                      key={patient.id}
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
                            alignItems: 'center',
                            gap: '1rem',
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
                            {patient.patientName}
                          </h4>
                          <span style={{ fontSize: '1.25rem' }}>
                            {getConsultationTypeIcon(patient.consultationType)}
                          </span>
                          <span
                            style={{
                              padding: '0.125rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              backgroundColor:
                                patient.priority === 'HIGH'
                                  ? '#fef2f2'
                                  : patient.priority === 'MEDIUM'
                                    ? '#fef3c7'
                                    : '#f0fdf4',
                              color:
                                patient.priority === 'HIGH'
                                  ? '#dc2626'
                                  : patient.priority === 'MEDIUM'
                                    ? '#92400e'
                                    : '#166534',
                            }}
                          >
                            {patient.priority}
                          </span>
                          {patient.techCheck ? (
                            <span style={{ color: '#10b981', fontSize: '0.875rem' }}>
                              ✅ Tech Ready
                            </span>
                          ) : (
                            <span style={{ color: '#f59e0b', fontSize: '0.875rem' }}>
                              ⚠️ Tech Check
                            </span>
                          )}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                          Appointment: {patient.appointmentTime} • Wait time: {patient.waitTime}{' '}
                          minutes •{patient.chiefComplaint}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button size="sm" variant="outline">
                          Message
                        </Button>
                        <Button size="sm" variant="primary">
                          Start Session
                        </Button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Active Sessions Tab */}
        {currentTab === 'sessions' && (
          <Card>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎥</div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                }}
              >
                Active Telemedicine Sessions
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                Monitor and manage live video consultations, chat sessions, and ongoing patient
                communications in real-time.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Button variant="primary">🎥 View Active Sessions</Button>
                <Button variant="outline">📱 Mobile Sessions</Button>
                <Button variant="secondary">🔧 Technical Support</Button>
              </div>
            </div>
          </Card>
        )}

        {/* Analytics Tab */}
        {currentTab === 'analytics' && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Summary Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
              }}
            >
              <Card>
                <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <div style={{ fontSize: '2rem', color: '#3b82f6', marginBottom: '0.5rem' }}>
                    📈
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>142</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Consultations</div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981' }}>+12% from last month</div>
                </div>
              </Card>

              <Card>
                <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <div style={{ fontSize: '2rem', color: '#10b981', marginBottom: '0.5rem' }}>
                    🎯
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>94%</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Completion Rate</div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981' }}>Above target</div>
                </div>
              </Card>

              <Card>
                <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <div style={{ fontSize: '2rem', color: '#f59e0b', marginBottom: '0.5rem' }}>
                    ⭐
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>4.8</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Average Rating</div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981' }}>Excellent feedback</div>
                </div>
              </Card>

              <Card>
                <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <div style={{ fontSize: '2rem', color: '#8b5cf6', marginBottom: '0.5rem' }}>
                    ⏱️
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>28</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Avg Duration (min)</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Within guidelines</div>
                </div>
              </Card>
            </div>

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
                  Telemedicine Analytics Dashboard
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                  Comprehensive analytics for virtual consultations, patient satisfaction, technical
                  performance, and platform utilization metrics.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <Button variant="primary">📊 View Full Analytics</Button>
                  <Button variant="outline">📈 Performance Reports</Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {currentTab === 'settings' && (
          <Card>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                }}
              >
                Telemedicine Platform Settings
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                Configure video conferencing settings, quality parameters, security options,
                integration settings, and platform customizations.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Button variant="primary">⚙️ Platform Settings</Button>
                <Button variant="outline">📹 Video Configuration</Button>
                <Button variant="secondary">🔐 Security Options</Button>
              </div>
            </div>
          </Card>
        )}

        {/* Modals */}
        {showConsultationModal && <ConsultationModal />}
        {showSessionModal && <SessionModal />}
      </div>
    </Layout>
  );
};

export default TelemedicinePage;
