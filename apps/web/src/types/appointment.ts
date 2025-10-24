import { BaseEntity } from './common';
import { Patient } from './patient';
import { Staff } from './staff';

export interface Appointment extends BaseEntity {
  appointmentId: string;
  appointmentNumber: string;
  patient: Patient;
  doctor: Staff;
  appointmentDate: Date;
  appointmentTime: string;
  duration: number; // in minutes
  appointmentType: AppointmentType;
  department: string;
  reason: string;
  notes?: string;
  status: AppointmentStatus;
  priority: AppointmentPriority;

  // Scheduling details
  scheduledBy: string;
  scheduledDate: Date;
  confirmedBy?: string;
  confirmedDate?: Date;

  // Visit details
  checkInTime?: Date;
  checkOutTime?: Date;
  waitingTime?: number;
  consultationTime?: number;

  // Follow-up
  followUpRequired: boolean;
  followUpDate?: Date;
  followUpNotes?: string;

  // Payment
  consultationFee: number;
  isPaid: boolean;
  paymentMethod?: string;
  paymentReference?: string;

  // Communication
  reminderSent: boolean;
  reminderDate?: Date;
  patientNotified: boolean;
  notificationPreference: NotificationPreference;

  // Cancellation
  cancelledBy?: string;
  cancellationDate?: Date;
  cancellationReason?: string;
  cancellationFee?: number;

  // Rescheduling
  rescheduledFrom?: string; // Original appointment ID
  rescheduledTo?: string; // New appointment ID
  rescheduledBy?: string;
  reschedulingReason?: string;

  metadata?: {
    referredBy?: string;
    insurance?: {
      provider: string;
      policyNumber: string;
      authorizationCode?: string;
    };
    symptoms?: string[];
    allergies?: string[];
    medications?: string[];
    vitalSigns?: {
      bloodPressure?: string;
      heartRate?: number;
      temperature?: number;
      weight?: number;
      height?: number;
    };
  };
}

export type AppointmentType =
  | 'consultation'
  | 'follow_up'
  | 'emergency'
  | 'routine_checkup'
  | 'diagnostic'
  | 'procedure'
  | 'vaccination'
  | 'surgery_consultation'
  | 'second_opinion'
  | 'telemedicine';

export type AppointmentStatus =
  | 'SCHEDULED'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'RESCHEDULED';

export type AppointmentPriority = 'low' | 'normal' | 'high' | 'urgent' | 'emergency';

export type NotificationPreference = 'sms' | 'email' | 'phone' | 'push_notification' | 'none';

// Doctor availability and scheduling
export interface DoctorAvailability extends BaseEntity {
  doctorId: string;
  doctor: Staff;
  date: Date;
  timeSlots: TimeSlot[];
  isAvailable: boolean;
  unavailabilityReason?: string;
  maxAppointments: number;
  currentAppointments: number;
  breakTimes: BreakTime[];
  specialNotes?: string;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  isAvailable: boolean;
  appointmentId?: string;
  slotType: SlotType;
  maxBookings?: number;
  currentBookings?: number;
}

export type SlotType = 'consultation' | 'procedure' | 'emergency' | 'break' | 'blocked';

export interface BreakTime {
  id: string;
  startTime: string;
  endTime: string;
  breakType: BreakType;
  description?: string;
}

export type BreakType = 'lunch' | 'tea' | 'surgery' | 'emergency' | 'personal';

// Appointment booking and management

// Calendar and scheduling
export interface Calendar {
  id: string;
  doctorId: string;
  doctor: Staff;
  date: Date;
  appointments: Appointment[];
  availability: DoctorAvailability;
  workingHours: {
    startTime: string;
    endTime: string;
  };
  blockedTimes: BlockedTime[];
  notes?: string;
}

export interface BlockedTime {
  id: string;
  startTime: string;
  endTime: string;
  reason: string;
  blockedBy: string;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
}

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly';
  interval: number;
  endDate?: Date;
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
  dayOfMonth?: number;
}

// Queue management
export interface AppointmentQueue {
  id: string;
  doctorId: string;
  doctor: Staff;
  date: Date;
  appointments: QueuedAppointment[];
  currentAppointment?: string;
  averageWaitTime: number;
  estimatedDelay: number;
}

export interface QueuedAppointment {
  appointmentId: string;
  appointment: Appointment;
  queueNumber: number;
  estimatedTime: string;
  waitingTime: number;
  status: QueueStatus;
  priority: number;
}

export type QueueStatus = 'waiting' | 'called' | 'in_consultation' | 'completed' | 'skipped';

// Search and filtering
export interface AppointmentSearchFilters {
  dateFrom?: Date;
  dateTo?: Date;
  doctorId?: string;
  patientId?: string;
  department?: string;
  status?: AppointmentStatus;
  appointmentType?: AppointmentType;
  priority?: AppointmentPriority;
  searchTerm?: string;
}

// Statistics and reporting
export interface AppointmentStats {
  totalAppointments: number;
  todayAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;

  appointmentsByType: Record<AppointmentType, number>;
  appointmentsByStatus: Record<AppointmentStatus, number>;
  appointmentsByDepartment: Record<string, number>;
  appointmentsByDoctor: Array<{
    doctorId: string;
    doctorName: string;
    appointmentCount: number;
    completionRate: number;
  }>;

  averageWaitTime: number;
  averageConsultationTime: number;
  patientSatisfactionScore: number;

  dailyAppointments: Array<{
    date: string;
    scheduled: number;
    completed: number;
    cancelled: number;
    noShow: number;
  }>;

  monthlyTrends: Array<{
    month: string;
    appointments: number;
    revenue: number;
    completionRate: number;
  }>;

  peakHours: Array<{
    hour: number;
    appointmentCount: number;
  }>;

  revenueMetrics: {
    totalRevenue: number;
    pendingPayments: number;
    averageConsultationFee: number;
    revenueByDepartment: Record<string, number>;
  };
}

// Notifications and reminders
export interface AppointmentReminder {
  id: string;
  appointmentId: string;
  patientId: string;
  reminderType: ReminderType;
  scheduledTime: Date;
  message: string;
  status: ReminderStatus;
  attempts: number;
  lastAttempt?: Date;
  deliveryMethod: NotificationPreference;
  response?: string;
}

export type ReminderType = 'confirmation' | '24_hour' | '2_hour' | '30_minute' | 'follow_up';

export type ReminderStatus = 'scheduled' | 'sent' | 'delivered' | 'failed' | 'cancelled';

// Telemedicine integration
export interface TelemedicineAppointment {
  appointmentId: string;
  meetingLink: string;
  meetingId: string;
  meetingPassword?: string;
  platform: 'zoom' | 'teams' | 'google_meet' | 'custom';
  recordingEnabled: boolean;
  recordingUrl?: string;
  technicalRequirements: string[];
  connectionStatus: ConnectionStatus;
  sessionNotes?: string;
}

export type ConnectionStatus = 'pending' | 'connected' | 'disconnected' | 'failed' | 'completed';
