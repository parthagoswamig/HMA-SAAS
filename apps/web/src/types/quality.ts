import { BaseEntity } from './common';

// Quality Management Types
export interface QualityIndicator extends BaseEntity {
  indicatorId: string;
  name: string;
  category: IndicatorCategory;
  target: number;
  actual: number;
  unit: string;
  period: string;
  status: IndicatorStatus;
}

export interface Audit extends BaseEntity {
  auditId: string;
  auditType: AuditType;
  department: string;
  auditDate: Date;
  auditor: string;
  findings: AuditFinding[];
  status: AuditStatus;
  score?: number;
}

export interface AuditFinding extends BaseEntity {
  findingId: string;
  description: string;
  severity: Severity;
  category: string;
  correctiveAction?: string;
  status: FindingStatus;
}

export interface CorrectiveAction extends BaseEntity {
  actionId: string;
  findingId: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  status: ActionStatus;
  completedDate?: Date;
}

export interface QualityStats {
  totalAudits: number;
  completedAudits: number;
  pendingActions: number;
  averageScore: number;
}

export type IndicatorCategory = 'clinical' | 'operational' | 'financial' | 'patient_safety';
export type IndicatorStatus = 'on_track' | 'at_risk' | 'off_track';
export type AuditType = 'internal' | 'external' | 'regulatory' | 'quality';
export type AuditStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';
export type Severity = 'critical' | 'major' | 'minor' | 'observation';
export type FindingStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
