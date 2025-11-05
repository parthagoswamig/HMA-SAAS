import { BaseEntity, Address, ContactInfo, Gender, Status, UserRole } from './common';

// Staff related interfaces
export interface Staff extends BaseEntity {
  // Basic Information
  staffId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  age: number;
  gender: Gender;

  // Contact Information
  contactInfo: ContactInfo;
  address: Address;

  // Professional Information
  role: UserRole;
  department: Department;
  specializations: Specialization[];
  qualifications: Qualification[];
  experience: number; // years of experience
  joiningDate: Date;

  // Employment Details
  employmentType: 'full_time' | 'part_time' | 'contract' | 'consultant' | 'locum';
  status: Status;
  isActive: boolean;

  // Medical Registration (for doctors)
  medicalRegistration?: MedicalRegistration;

  // Privileges and Permissions
  privileges: Privilege[];
  permissions: string[];

  // Schedule Information
  workingHours: WorkingHours;
  shifts: Shift[];

  // Performance Metrics
  performanceMetrics?: PerformanceMetrics;

  // Financial Information
  salaryInfo?: SalaryInfo;

  // Additional Information
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  bloodGroup?: string;
  languages: string[];
  notes?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: string;
  location?: string;
  isActive: boolean;
}

export interface Specialization {
  id: string;
  name: string;
  code: string;
  category: 'medical' | 'surgical' | 'diagnostic' | 'therapeutic' | 'administrative';
  description?: string;
}

export interface Qualification {
  id: string;
  degree: string;
  institution: string;
  university: string;
  year: number;
  grade?: string;
  certificateNumber?: string;
  isVerified: boolean;
}

export interface MedicalRegistration {
  registrationNumber: string;
  council: string; // e.g., "Medical Council of India", "State Medical Council"
  issueDate: Date;
  expiryDate?: Date;
  isActive: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

export interface Privilege {
  id: string;
  code: string;
  name: string;
  category: 'clinical' | 'surgical' | 'diagnostic' | 'administrative';
  description: string;
  scope: 'department' | 'hospital' | 'specific_location';
  grantedDate: Date;
  expiryDate?: Date;
  grantedBy: string;
  isActive: boolean;
}

export interface WorkingHours {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

export interface DaySchedule {
  isWorking: boolean;
  shifts: {
    startTime: string;
    endTime: string;
    breakStart?: string;
    breakEnd?: string;
  }[];
}

export interface Shift extends BaseEntity {
  staffId: string;
  shiftType: 'morning' | 'afternoon' | 'evening' | 'night' | 'on_call';
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  department: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  actualStartTime?: string;
  actualEndTime?: string;
  breakDuration?: number; // in minutes
  overtimeHours?: number;
  notes?: string;
}

export interface PerformanceMetrics {
  // Patient Care Metrics
  totalPatientsHandled: number;
  averagePatientRating: number;
  patientComplaintCount: number;
  patientComplimentCount: number;

  // Productivity Metrics
  averageConsultationTime: number; // in minutes
  proceduresPerformed: number;
  revenueGenerated?: number;

  // Quality Metrics
  diagnosisAccuracy?: number; // percentage
  treatmentSuccessRate?: number; // percentage
  complicationRate?: number; // percentage

  // Professional Development
  trainingHoursCompleted: number;
  certificationsEarned: number;
  researchPapersPublished?: number;

  // Attendance & Punctuality
  attendancePercentage: number;
  punctualityScore: number;
  leaveDaysTaken: number;

  // Peer & Supervisor Ratings
  peerRating?: number;
  supervisorRating?: number;

  // Period Information
  evaluationPeriod: {
    startDate: Date;
    endDate: Date;
  };
}

export interface SalaryInfo {
  baseSalary: number;
  allowances: {
    hra?: number;
    medical?: number;
    transport?: number;
    other?: number;
  };
  incentives?: {
    performanceBonus?: number;
    procedureBonus?: number;
    overtimePay?: number;
  };
  deductions?: {
    tax?: number;
    pf?: number;
    insurance?: number;
    other?: number;
  };
  netSalary: number;
  payrollFrequency: 'monthly' | 'bi_weekly' | 'weekly';
  currency: string;
  lastUpdated: Date;
}

// Leave Management
export interface LeaveRequest extends BaseEntity {
  staffId: string;
  leaveType: 'casual' | 'sick' | 'annual' | 'maternity' | 'paternity' | 'emergency' | 'unpaid';
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  appliedDate: Date;
  approvedBy?: string;
  approvedDate?: Date;
  rejectionReason?: string;
  documents?: string[]; // file paths for supporting documents
  isEmergency: boolean;
  handoverNotes?: string;
  coveringStaff?: string[];
}

export interface Attendance extends BaseEntity {
  staffId: string;
  date: Date;
  clockIn?: Date;
  clockOut?: Date;
  totalHours?: number;
  breakDuration?: number; // in minutes
  overtimeHours?: number;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave' | 'holiday';
  location?: string;
  notes?: string;
  approvedBy?: string;
}

// Training and Development
export interface Training extends BaseEntity {
  title: string;
  description: string;
  category: 'mandatory' | 'optional' | 'certification' | 'skill_development';
  duration: number; // in hours
  startDate: Date;
  endDate?: Date;
  instructor: string;
  location: string;
  maxParticipants?: number;
  currentParticipants: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  completionCriteria?: string;
  certificateAwarded: boolean;
}

export interface StaffTraining extends BaseEntity {
  staffId: string;
  trainingId: string;
  enrollmentDate: Date;
  completionDate?: Date;
  status: 'enrolled' | 'in_progress' | 'completed' | 'dropped' | 'failed';
  score?: number;
  feedback?: string;
  certificateUrl?: string;
}

// Search and Filter types
export interface StaffSearchParams {
  query?: string;
  staffId?: string;
  employeeId?: string;
  department?: string;
  role?: UserRole;
  specialization?: string;
  status?: Status;
  employmentType?: 'full_time' | 'part_time' | 'contract' | 'consultant' | 'locum';
  joiningDate?: {
    from?: Date;
    to?: Date;
  };
  experience?: {
    min?: number;
    max?: number;
  };
  location?: string;
  isActive?: boolean;
}

export interface StaffListItem {
  id: string;
  staffId: string;
  employeeId: string;
  fullName: string;
  role: UserRole;
  department: string;
  specializations: string[];
  contactPhone: string;
  email?: string;
  experience: number;
  joiningDate: Date;
  status: Status;
  isActive: boolean;
  currentShift?: 'morning' | 'afternoon' | 'evening' | 'night' | 'off';
  attendanceToday?: 'present' | 'absent' | 'late' | 'on_leave';
}

// Staff statistics
export interface StaffStats {
  totalStaff: number;
  activeStaff: number;
  staffOnLeave: number;
  newHiresThisMonth: number;
  averageExperience: number;

  // Role Distribution
  roleDistribution: Record<UserRole, number>;

  // Department Distribution
  departmentDistribution: Record<string, number>;

  // Employment Type Distribution
  employmentTypeDistribution: {
    full_time: number;
    part_time: number;
    contract: number;
    consultant: number;
    locum: number;
  };

  // Attendance Metrics
  attendanceMetrics: {
    presentToday: number;
    absentToday: number;
    lateToday: number;
    onLeaveToday: number;
    averageAttendance: number;
  };

  // Performance Metrics
  performanceMetrics: {
    averageRating: number;
    topPerformers: string[];
    trainingCompletionRate: number;
  };

  // Trends
  hiringTrends: {
    month: string;
    hired: number;
    resigned: number;
  }[];
}
