// Tuition related types
export type TuitionStatus = 'paid' | 'pending' | 'failed' | 'overdue';
export type PaymentMethod = 'cash' | 'transfer' | 'card' | 'ewallet';

export interface CourseItem {
  id: string;
  code: string;
  name: string;
  credits: number;
  pricePerCredit: number;
  total: number;
}

export interface TuitionRecord {
  id: string;
  studentId?: string;
  studentName: string;
  studentCode: string;
  email: string;
  phone: string;
  major: string;
  semester: string;
  amount: number;
  status: TuitionStatus;
  createdDate: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: PaymentMethod;
  transactionRef?: string;
  confirmedBy?: string;
  confirmedAt?: string;
  failureReason?: string;
  courses: CourseItem[];
  discount: number;
  note?: string;
}

export interface TuitionStats {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  failedAmount: number;
  totalRecords: number;
  paidCount: number;
  pendingCount: number;
  failedCount: number;
}

export interface CreateTuitionRequest {
  studentCode: string;
  semester: string;
  amount: number;
  dueDate: string;
  courses: CourseItem[];
  discount?: number;
  note?: string;
}

export interface UpdateTuitionRequest {
  status?: TuitionStatus;
  paymentMethod?: PaymentMethod;
  transactionRef?: string;
  note?: string;
}
