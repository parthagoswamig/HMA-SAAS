'use client';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import React, { useState } from 'react';

interface ReportData {
  id: string;
  name: string;
  category: 'FINANCIAL' | 'CLINICAL' | 'OPERATIONAL' | 'PATIENT' | 'STAFF' | 'QUALITY';
  description: string;
  lastGenerated: string;
  generatedBy: string;
  status: 'READY' | 'GENERATING' | 'SCHEDULED' | 'ERROR';
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ON_DEMAND';
  format: 'PDF' | 'EXCEL' | 'CSV' | 'JSON';
  size?: string;
  downloadCount: number;
}

interface AnalyticsMetric {
  label: string;
  value: string | number;
  change?: string;
  trend: 'up' | 'down' | 'neutral';
  color: string;
  icon: string;
}

const ReportsPage = () => {
  const [currentTab, setCurrentTab] = useState<'analytics' | 'reports' | 'generator' | 'scheduler'>(
    'analytics'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [dateRange, setDateRange] = useState('month');

  const [reports] = useState<ReportData[]>([
    {
      id: '1',
      name: 'Monthly Financial Summary',
      category: 'FINANCIAL',
      description:
        'Comprehensive financial overview including revenue, expenses, and profitability metrics',
      lastGenerated: '2024-12-01',
      generatedBy: 'John Admin',
      status: 'READY',
      frequency: 'MONTHLY',
      format: 'PDF',
      size: '2.5MB',
      downloadCount: 45,
    },
    {
      id: '2',
      name: 'Patient Satisfaction Survey',
      category: 'QUALITY',
      description: 'Analysis of patient feedback and satisfaction scores across departments',
      lastGenerated: '2024-11-30',
      generatedBy: 'Sarah Manager',
      status: 'READY',
      frequency: 'MONTHLY',
      format: 'EXCEL',
      size: '1.2MB',
      downloadCount: 23,
    },
    {
      id: '3',
      name: 'Daily Operational Metrics',
      category: 'OPERATIONAL',
      description: 'Daily KPIs including bed occupancy, staff utilization, and resource usage',
      lastGenerated: '2024-12-05',
      generatedBy: 'Mike Analyst',
      status: 'READY',
      frequency: 'DAILY',
      format: 'CSV',
      size: '850KB',
      downloadCount: 112,
    },
    {
      id: '4',
      name: 'Clinical Outcomes Report',
      category: 'CLINICAL',
      description: 'Patient outcomes, readmission rates, and clinical quality indicators',
      lastGenerated: '2024-11-28',
      generatedBy: 'Dr. Clinical Lead',
      status: 'GENERATING',
      frequency: 'WEEKLY',
      format: 'PDF',
      downloadCount: 34,
    },
    {
      id: '5',
      name: 'Staff Performance Dashboard',
      category: 'STAFF',
      description: 'Staff productivity, attendance, and performance metrics by department',
      lastGenerated: '2024-12-04',
      generatedBy: 'HR Manager',
      status: 'SCHEDULED',
      frequency: 'WEEKLY',
      format: 'EXCEL',
      downloadCount: 18,
    },
  ]);

  const [analyticsMetrics] = useState<AnalyticsMetric[]>([
    {
      label: 'Total Revenue',
      value: '$2.4M',
      change: '+12%',
      trend: 'up',
      color: '#10b981',
      icon: '💰',
    },
    {
      label: 'Patient Visits',
      value: '8,432',
      change: '+8%',
      trend: 'up',
      color: '#3b82f6',
      icon: '👥',
    },
    {
      label: 'Bed Occupancy',
      value: '87%',
      change: '+3%',
      trend: 'up',
      color: '#f59e0b',
      icon: '🏥',
    },
    {
      label: 'Staff Utilization',
      value: '94%',
      change: '-2%',
      trend: 'down',
      color: '#8b5cf6',
      icon: '👨‍⚕️',
    },
    {
      label: 'Patient Satisfaction',
      value: '4.2/5',
      change: '+0.3',
      trend: 'up',
      color: '#10b981',
      icon: '⭐',
    },
    {
      label: 'Average Stay',
      value: '3.2 days',
      change: '-0.5',
      trend: 'down',
      color: '#06b6d4',
      icon: '📅',
    },
    {
      label: 'Emergency Cases',
      value: '234',
      change: '+15%',
      trend: 'up',
      color: '#dc2626',
      icon: '🚨',
    },
    {
      label: 'Lab Tests',
      value: '1,847',
      change: '+22%',
      trend: 'up',
      color: '#7c3aed',
      icon: '🧪',
    },
  ]);

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || report.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READY':
        return '#10b981';
      case 'GENERATING':
        return '#3b82f6';
      case 'SCHEDULED':
        return '#f59e0b';
      case 'ERROR':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'FINANCIAL':
        return '#10b981';
      case 'CLINICAL':
        return '#3b82f6';
      case 'OPERATIONAL':
        return '#f59e0b';
      case 'PATIENT':
        return '#8b5cf6';
      case 'STAFF':
        return '#06b6d4';
      case 'QUALITY':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const MetricCard = ({ metric }: { metric: AnalyticsMetric }) => (
    <Card variant="elevated" style={{ background: 'white', border: `1px solid ${metric.color}15` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: metric.color,
              marginBottom: '0.25rem',
            }}
          >
            {metric.value}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
            {metric.label}
          </div>
          {metric.change && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.75rem',
                color:
                  metric.trend === 'up'
                    ? '#10b981'
                    : metric.trend === 'down'
                      ? '#ef4444'
                      : '#6b7280',
              }}
            >
              <span style={{ marginRight: '0.25rem' }}>
                {metric.trend === 'up' ? '↗️' : metric.trend === 'down' ? '↘️' : '→'}
              </span>
              {metric.change} from last period
            </div>
          )}
        </div>
        <div style={{ fontSize: '2rem', opacity: 0.7 }}>{metric.icon}</div>
      </div>
    </Card>
  );

  const ReportCard = ({ report }: { report: ReportData }) => (
    <Card variant="elevated" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  margin: '0 0 0.25rem 0',
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                }}
              >
                {report.name}
              </h3>
              <p style={{ margin: '0', fontSize: '0.875rem', color: '#6b7280' }}>
                {report.description}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  backgroundColor: `${getCategoryColor(report.category)}15`,
                  color: getCategoryColor(report.category),
                }}
              >
                {report.category}
              </span>
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  backgroundColor: `${getStatusColor(report.status)}15`,
                  color: getStatusColor(report.status),
                }}
              >
                {report.status}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Last Generated:</strong>{' '}
                {new Date(report.lastGenerated).toLocaleDateString()}
              </p>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Generated By:</strong> {report.generatedBy}
              </p>
            </div>

            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Frequency:</strong> {report.frequency}
              </p>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Format:</strong> {report.format}
              </p>
            </div>

            <div>
              {report.size && (
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                  <strong>Size:</strong> {report.size}
                </p>
              )}
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Downloads:</strong> {report.downloadCount}
              </p>
            </div>
          </div>
        </div>

        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginLeft: '1rem' }}
        >
          {report.status === 'READY' && (
            <Button size="sm" variant="primary">
              📄 Download
            </Button>
          )}
          {report.status === 'GENERATING' && (
            <Button size="sm" variant="outline" disabled>
              ⏳ Generating...
            </Button>
          )}
          <Button size="sm" variant="outline">
            🔄 Regenerate
          </Button>
          <Button size="sm" variant="secondary">
            ⚙️ Configure
          </Button>
        </div>
      </div>
    </Card>
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
              Reports & Analytics
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>
              Comprehensive reporting and analytics dashboard for data-driven insights
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary">📊 Export Dashboard</Button>
            <Button onClick={() => setCurrentTab('generator')}>+ Create Report</Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
            {[
              { key: 'analytics', label: '📊 Analytics Overview', count: null },
              { key: 'reports', label: '📄 Reports Library', count: reports.length },
              { key: 'generator', label: '🔧 Report Generator', count: null },
              {
                key: 'scheduler',
                label: '⏰ Scheduler',
                count: reports.filter((r) => r.frequency !== 'ON_DEMAND').length,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setCurrentTab(tab.key as 'analytics' | 'reports' | 'generator' | 'scheduler')}
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

        {/* Analytics Overview Tab */}
        {currentTab === 'analytics' && (
          <>
            {/* Date Range Selector */}
            <Card style={{ marginBottom: '2rem' }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                  Analytics Overview
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['week', 'month', 'quarter', 'year'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setDateRange(period)}
                      style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        background: dateRange === period ? '#667eea' : 'white',
                        color: dateRange === period ? 'white' : '#374151',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        textTransform: 'capitalize',
                      }}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Analytics Metrics Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem',
              }}
            >
              {analyticsMetrics.map((metric, index) => (
                <MetricCard key={index} metric={metric} />
              ))}
            </div>

            {/* Charts Section */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '1.5rem',
              }}
            >
              <Card title="Revenue Trend">
                <div
                  style={{
                    height: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f8fafc',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ textAlign: 'center', color: '#6b7280' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📈</div>
                    <p>Interactive revenue chart would be displayed here</p>
                    <p style={{ fontSize: '0.875rem' }}>
                      Integration with charting library (Chart.js, D3, etc.)
                    </p>
                  </div>
                </div>
              </Card>

              <Card title="Patient Volume">
                <div
                  style={{
                    height: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f8fafc',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ textAlign: 'center', color: '#6b7280' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                    <p>Patient volume analytics chart</p>
                    <p style={{ fontSize: '0.875rem' }}>
                      Daily, weekly, monthly patient visit trends
                    </p>
                  </div>
                </div>
              </Card>

              <Card title="Department Performance">
                <div
                  style={{
                    height: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f8fafc',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ textAlign: 'center', color: '#6b7280' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏥</div>
                    <p>Department performance metrics</p>
                    <p style={{ fontSize: '0.875rem' }}>Comparative analysis across departments</p>
                  </div>
                </div>
              </Card>

              <Card title="Quality Indicators">
                <div
                  style={{
                    height: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f8fafc',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ textAlign: 'center', color: '#6b7280' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
                    <p>Quality and satisfaction metrics</p>
                    <p style={{ fontSize: '0.875rem' }}>
                      Patient satisfaction and clinical quality indicators
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}

        {/* Reports Library Tab */}
        {currentTab === 'reports' && (
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
                  placeholder="Search reports..."
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
                    <option value="FINANCIAL">Financial</option>
                    <option value="CLINICAL">Clinical</option>
                    <option value="OPERATIONAL">Operational</option>
                    <option value="PATIENT">Patient</option>
                    <option value="STAFF">Staff</option>
                    <option value="QUALITY">Quality</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button variant="outline" size="sm">
                    📤 Export All
                  </Button>
                  <Button variant="secondary" size="sm">
                    🗂️ Archive
                  </Button>
                </div>
              </div>
            </Card>

            {/* Reports List */}
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
                  Available Reports ({filteredReports.length})
                </h2>
              </div>

              {filteredReports.length > 0 ? (
                filteredReports.map((report) => <ReportCard key={report.id} report={report} />)
              ) : (
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
                      No reports found
                    </h3>
                    <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                      No reports match your current search criteria.
                    </p>
                    <Button onClick={() => setCurrentTab('generator')}>Create New Report</Button>
                  </div>
                </Card>
              )}
            </div>
          </>
        )}

        {/* Report Generator Tab */}
        {currentTab === 'generator' && (
          <Card>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '2rem',
              }}
            >
              Custom Report Generator
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
              }}
            >
              {/* Quick Reports */}
              <div>
                <h4
                  style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '1rem',
                  }}
                >
                  Quick Reports
                </h4>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {[
                    {
                      name: 'Daily Census Report',
                      icon: '🏥',
                      desc: 'Current bed occupancy and patient census',
                    },
                    {
                      name: 'Financial Summary',
                      icon: '💰',
                      desc: 'Revenue, expenses, and profit analysis',
                    },
                    {
                      name: 'Patient Outcomes',
                      icon: '📊',
                      desc: 'Clinical quality and outcome metrics',
                    },
                    {
                      name: 'Staff Performance',
                      icon: '👨‍⚕️',
                      desc: 'Staff productivity and utilization',
                    },
                  ].map((report) => (
                    <div
                      key={report.name}
                      style={{
                        padding: '1rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#667eea';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div
                        style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}
                      >
                        <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>
                          {report.icon}
                        </span>
                        <strong style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                          {report.name}
                        </strong>
                      </div>
                      <p style={{ margin: '0', fontSize: '0.75rem', color: '#6b7280' }}>
                        {report.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Report Builder */}
              <div>
                <h4
                  style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '1rem',
                  }}
                >
                  Custom Report Builder
                </h4>
                <div
                  style={{
                    padding: '2rem',
                    border: '2px dashed #d1d5db',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔧</div>
                  <h4
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Advanced Report Builder
                  </h4>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                    Create custom reports with drag-and-drop interface, filters, and scheduling
                    options.
                  </p>
                  <Button variant="primary">Launch Report Builder</Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Scheduler Tab */}
        {currentTab === 'scheduler' && (
          <Card>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
                Report Scheduler
              </h3>
              <Button variant="primary">+ Schedule New Report</Button>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {reports
                .filter((r) => r.frequency !== 'ON_DEMAND')
                .map((report) => (
                  <div
                    key={report.id}
                    style={{
                      padding: '1.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h4
                        style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: '#1f2937',
                          marginBottom: '0.5rem',
                        }}
                      >
                        {report.name}
                      </h4>
                      <div
                        style={{
                          display: 'flex',
                          gap: '2rem',
                          fontSize: '0.875rem',
                          color: '#6b7280',
                        }}
                      >
                        <span>
                          <strong>Frequency:</strong> {report.frequency}
                        </span>
                        <span>
                          <strong>Next Run:</strong>{' '}
                          {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </span>
                        <span>
                          <strong>Recipients:</strong> 3 users
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button size="sm" variant="outline">
                        ⚙️ Configure
                      </Button>
                      <Button
                        size="sm"
                        variant={report.status === 'SCHEDULED' ? 'secondary' : 'primary'}
                      >
                        {report.status === 'SCHEDULED' ? '⏸️ Pause' : '▶️ Resume'}
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ReportsPage;
