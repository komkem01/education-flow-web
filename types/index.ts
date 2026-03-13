// ========================================
// User & Authentication Types
// ========================================

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  STAFF = 'staff',
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent'
}

export interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  fullName: string
  roles: UserRole[]
  schoolId: string
  schoolName?: string
  permissions?: string[]
  schoolScope?: {
    schoolIds?: string[]
    canManageAllSchools?: boolean
  }
  avatar?: string
  phoneNumber?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  tokens: AuthTokens
}

// ========================================
// School Types
// ========================================

export interface School {
  id: string
  code: string
  name: string
  nameEn?: string
  address: string
  subDistrict: string
  district: string
  province: string
  postalCode: string
  phoneNumber: string
  email: string
  website?: string
  logo?: string
  director: string
  isActive: boolean
  academicYearId: string
  createdAt: string
  updatedAt: string
}

export interface AcademicYear {
  id: string
  schoolId: string
  name: string
  year: number
  semester: number
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ========================================
// Admin Types
// ========================================

export interface Admin extends User {
  schoolId: string
  position?: string
  department?: string
}

// ========================================
// Staff Types
// ========================================

export interface Staff extends User {
  schoolId: string
  employeeCode: string
  position: string
  department: string
  hireDate: string
  salary?: number
  isActive: boolean
}

export enum StaffDepartment {
  ACADEMIC = 'academic',
  REGISTRAR = 'registrar',
  STUDENT_AFFAIRS = 'student_affairs',
  FINANCE = 'finance',
  GENERAL_AFFAIRS = 'general_affairs',
  IT = 'it',
  OTHER = 'other'
}

// ========================================
// Teacher Types
// ========================================

export interface Teacher extends User {
  schoolId: string
  teacherCode: string
  position: string
  department: string
  subjects: string[]
  hireDate: string
  educationLevel: string
  major: string
  salary?: number
  isActive: boolean
  isApproved: boolean
}

export interface TeacherEducation {
  id: string
  teacherId: string
  degree: string
  major: string
  university: string
  graduationYear: number
  gpa?: number
}

export interface TeacherWorkExperience {
  id: string
  teacherId: string
  position: string
  organization: string
  startDate: string
  endDate?: string
  description?: string
}

// ========================================
// Student Types
// ========================================

export interface Student extends User {
  schoolId: string
  studentCode: string
  classroomId: string
  gradeLevel: number
  enrollmentDate: string
  birthDate: string
  gender: string
  nationality: string
  religion: string
  bloodType?: string
  allergies?: string
  medicalConditions?: string
  emergencyContact: string
  emergencyPhone: string
  isActive: boolean
}

export interface StudentEnrollment {
  id: string
  studentId: string
  schoolId: string
  academicYearId: string
  classroomId: string
  enrollmentDate: string
  status: EnrollmentStatus
}

export enum EnrollmentStatus {
  ACTIVE = 'active',
  TRANSFERRED = 'transferred',
  GRADUATED = 'graduated',
  DROPPED = 'dropped',
  SUSPENDED = 'suspended'
}

// ========================================
// Parent Types
// ========================================

export interface Parent extends User {
  relationship: string
  occupation: string
  workPlace?: string
  income?: number
}

export interface ParentStudent {
  id: string
  parentId: string
  studentId: string
  relationship: string
  isPrimary: boolean
}

// ========================================
// Classroom & Subject Types
// ========================================

export interface Classroom {
  id: string
  schoolId: string
  academicYearId: string
  name: string
  gradeLevel: number
  section: string
  capacity: number
  currentStudents: number
  homeRoomTeacherId?: string
  isActive: boolean
}

export interface Subject {
  id: string
  schoolId: string
  code: string
  name: string
  nameEn?: string
  description?: string
  credits: number
  gradeLevel: number
  isRequired: boolean
  isActive: boolean
}

export interface SubjectAssignment {
  id: string
  subjectId: string
  teacherId: string
  classroomId: string
  academicYearId: string
  schedule: string
  isActive: boolean
}

// ========================================
// Approval & Request Types
// ========================================

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export interface ApprovalRequest {
  id: string
  requestType: RequestType
  requesterId: string
  requesterName: string
  requesterRole: UserRole
  approverId?: string
  approverName?: string
  status: ApprovalStatus
  title: string
  description: string
  data: any
  reason?: string
  requestedAt: string
  reviewedAt?: string
}

export enum RequestType {
  TEACHER_REGISTRATION = 'teacher_registration',
  STUDENT_REGISTRATION = 'student_registration',
  PROFILE_UPDATE = 'profile_update',
  SUBJECT_CREATION = 'subject_creation',
  SUBJECT_UPDATE = 'subject_update',
  STUDENT_DATA_UPDATE = 'student_data_update',
  DOCUMENT_REQUEST = 'document_request',
  LEAVE_REQUEST = 'leave_request',
  INVENTORY_REQUEST = 'inventory_request',
  OTHER = 'other'
}

// ========================================
// Notification Types
// ========================================

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: any
  isRead: boolean
  createdAt: string
}

export enum NotificationType {
  APPROVAL_REQUEST = 'approval_request',
  APPROVAL_RESULT = 'approval_result',
  ANNOUNCEMENT = 'announcement',
  GRADE_UPDATE = 'grade_update',
  ATTENDANCE_ALERT = 'attendance_alert',
  PAYMENT_DUE = 'payment_due',
  OTHER = 'other'
}

// ========================================
// Common Types
// ========================================

export interface PaginationParams {
  page: number
  limit: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}
