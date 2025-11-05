import { BaseEntity } from './common';

// HR Management Types
export interface Employee extends BaseEntity {
  employeeId: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  hireDate: Date;
  status: EmployeeStatus;
}

export interface Attendance extends BaseEntity {
  employeeId: string;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: AttendanceStatus;
  notes?: string;
}

export interface Leave extends BaseEntity {
  employeeId: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  status: LeaveStatus;
  reason: string;
}

export interface Payroll extends BaseEntity {
  employeeId: string;
  period: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: PayrollStatus;
}

export interface Department extends BaseEntity {
  departmentId: string;
  name: string;
  description?: string;
  headOfDepartment?: string;
}

export interface Role extends BaseEntity {
  roleId: string;
  title: string;
  description?: string;
  permissions: string[];
}

export interface Shift extends BaseEntity {
  shiftId: string;
  name: string;
  startTime: string;
  endTime: string;
  status: ShiftStatus;
}

export interface PerformanceReview extends BaseEntity {
  reviewId: string;
  employeeId: string;
  reviewPeriod: string;
  rating: number;
  status: ReviewStatus;
  comments?: string;
}

export interface LeaveRequest extends BaseEntity {
  requestId: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  status: LeaveStatus;
  reason: string;
}

export interface Training extends BaseEntity {
  trainingId: string;
  title: string;
  description?: string;
  status: TrainingStatus;
  startDate: Date;
  endDate: Date;
}

export interface HRStats {
  totalEmployees: number;
  activeEmployees: number;
  onLeave: number;
  newHires: number;
  turnoverRate: number;
}

export interface HRFilters {
  department?: string;
  status?: EmployeeStatus;
  role?: string;
}

export type EmployeeStatus = 'active' | 'inactive' | 'on_leave' | 'terminated';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';
export type LeaveType = 'sick' | 'casual' | 'annual' | 'maternity' | 'paternity' | 'unpaid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type PayrollStatus = 'draft' | 'processed' | 'paid' | 'cancelled';
export type ShiftStatus = 'active' | 'inactive';
export type ReviewStatus = 'pending' | 'completed' | 'approved';
export type TrainingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
