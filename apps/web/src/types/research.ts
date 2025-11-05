import { BaseEntity } from './common';
import { Staff } from './staff';

// Research Types
export interface ResearchProject extends BaseEntity {
  projectId: string;
  title: string;
  description: string;
  principalInvestigator: Staff;
  department: string;
  startDate: Date;
  endDate?: Date;
  status: ProjectStatus;
  budget: number;
  fundingSource: string;
}

export interface ClinicalTrial extends BaseEntity {
  trialId: string;
  trialNumber: string;
  title: string;
  phase: TrialPhase;
  status: TrialStatus;
  startDate: Date;
  endDate?: Date;
  enrollmentTarget: number;
  currentEnrollment: number;
  principalInvestigator: Staff;
}

export interface ResearchParticipant extends BaseEntity {
  participantId: string;
  trialId: string;
  enrollmentDate: Date;
  status: ParticipantStatus;
  consentDate: Date;
  withdrawalDate?: Date;
}

export interface ResearchPublication extends BaseEntity {
  publicationId: string;
  title: string;
  authors: string[];
  journal: string;
  publicationDate: Date;
  doi?: string;
  status: PublicationStatus;
}

export interface ResearchStats {
  activeProjects: number;
  activeTrials: number;
  totalParticipants: number;
  publications: number;
}

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type TrialPhase = 'phase_1' | 'phase_2' | 'phase_3' | 'phase_4';
export type TrialStatus = 'recruiting' | 'active' | 'suspended' | 'completed' | 'terminated';
export type ParticipantStatus = 'screening' | 'enrolled' | 'active' | 'completed' | 'withdrawn';
export type PublicationStatus = 'draft' | 'submitted' | 'under_review' | 'accepted' | 'published';
