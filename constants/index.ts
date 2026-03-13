export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  ME: '/auth/me',
  PERMISSIONS: '/auth/permissions',

  // Schools
  SCHOOLS: '/schools',
  SCHOOL_DETAIL: (id: string) => `/schools/${id}`,

  // Academic Years
  ACADEMIC_YEARS: '/academic-years',
  ACADEMIC_YEAR_DETAIL: (id: string) => `/academic-years/${id}`,

  // Admins
  ADMINS: '/admins',
  ADMIN_DETAIL: (id: string) => `/admins/${id}`,

  // Staff
  STAFF: '/staffs',
  STAFF_DETAIL: (id: string) => `/staffs/${id}`,

  // Teachers
  TEACHERS: '/teachers',
  TEACHER_DETAIL: (id: string) => `/teachers/${id}`,
  TEACHER_EDUCATIONS: (teacherId: string) => `/teachers/${teacherId}/educations`,
  TEACHER_EXPERIENCES: (teacherId: string) => `/teachers/${teacherId}/experiences`,

  // Students
  STUDENTS: '/students',
  STUDENT_DETAIL: (id: string) => `/students/${id}`,
  STUDENT_ENROLLMENTS: '/student-enrollments',

  // Parents
  PARENTS: '/parents',
  PARENT_DETAIL: (id: string) => `/parents/${id}`,
  PARENT_STUDENTS: (parentId: string) => `/parents/${parentId}/students`,

  // Classrooms
  CLASSROOMS: '/classrooms',
  CLASSROOM_DETAIL: (id: string) => `/classrooms/${id}`,

  // Subjects
  SUBJECTS: '/subjects',
  SUBJECT_DETAIL: (id: string) => `/subjects/${id}`,
  SUBJECT_ASSIGNMENTS: '/subject-assignments',

  // Approvals
  APPROVALS: '/approvals',
  APPROVAL_DETAIL: (id: string) => `/approvals/${id}`,
  APPROVE_REQUEST: (id: string) => `/approvals/${id}/approve`,
  REJECT_REQUEST: (id: string) => `/approvals/${id}/reject`,

  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATION_READ: (id: string) => `/notifications/${id}/read`,
  NOTIFICATION_READ_ALL: '/notifications/read-all'
} as const

export const ROUTE_PATHS = {
  // Public
  LOGIN: '/login',

  // Super Admin
  SUPER_ADMIN_DASHBOARD: '/super-admin',
  SUPER_ADMIN_SCHOOLS: '/super-admin/schools',
  
  // Admin
  ADMIN_DASHBOARD: '/admin',
  ADMIN_SCHOOLS: '/admin/schools',
  ADMIN_STAFF: '/admin/staff',
  ADMIN_TEACHERS: '/admin/teachers',
  ADMIN_STUDENTS: '/admin/students',
  ADMIN_CLASSROOMS: '/admin/classrooms',
  ADMIN_SUBJECTS: '/admin/subjects',
  ADMIN_APPROVALS: '/admin/approvals',
  ADMIN_SETTINGS: '/admin/settings',

  // Staff
  STAFF_DASHBOARD: '/staff',
  STAFF_TEACHERS: '/staff/teachers',
  STAFF_STUDENTS: '/staff/students',
  STAFF_PARENTS: '/staff/parents',
  STAFF_APPROVALS: '/staff/approvals',
  STAFF_DOCUMENTS: '/staff/documents',

  // Teacher
  TEACHER_DASHBOARD: '/teacher',
  TEACHER_SUBJECTS: '/teacher/subjects',
  TEACHER_STUDENTS: '/teacher/students',
  TEACHER_GRADES: '/teacher/grades',
  TEACHER_ATTENDANCE: '/teacher/attendance',
  TEACHER_PROFILE: '/teacher/profile',

  // Student
  STUDENT_DASHBOARD: '/student',
  STUDENT_SCHEDULE: '/student/schedule',
  STUDENT_GRADES: '/student/grades',
  STUDENT_ATTENDANCE: '/student/attendance',

  // Parent
  PARENT_DASHBOARD: '/parent',
  PARENT_CHILDREN: '/parent/children',
  PARENT_PAYMENTS: '/parent/payments'
} as const

export const ROLE_MENU_ITEMS = {
  super_admin: [
    { label: 'แดชบอร์ดส่วนกลาง', icon: 'lucide:layout-dashboard', path: ROUTE_PATHS.SUPER_ADMIN_DASHBOARD },
    { label: 'จัดการโรงเรียนทั้งหมด', icon: 'lucide:building-2', path: ROUTE_PATHS.SUPER_ADMIN_SCHOOLS }
  ],
  admin: [
    { label: 'แดชบอร์ด', icon: 'lucide:layout-dashboard', path: ROUTE_PATHS.ADMIN_DASHBOARD },
    { label: 'ข้อมูลโรงเรียน', icon: 'lucide:school', path: ROUTE_PATHS.ADMIN_SCHOOLS },
    { label: 'จัดการบุคคลากร', icon: 'lucide:users', path: ROUTE_PATHS.ADMIN_STAFF },
    { label: 'จัดการครู', icon: 'lucide:user-check', path: ROUTE_PATHS.ADMIN_TEACHERS },
    { label: 'จัดการนักเรียน', icon: 'lucide:graduation-cap', path: ROUTE_PATHS.ADMIN_STUDENTS },
    { label: 'จัดการห้องเรียน', icon: 'lucide:door-open', path: ROUTE_PATHS.ADMIN_CLASSROOMS },
    { label: 'จัดการรายวิชา', icon: 'lucide:book-open', path: ROUTE_PATHS.ADMIN_SUBJECTS },
    { label: 'คำขออนุมัติ', icon: 'lucide:file-check', path: ROUTE_PATHS.ADMIN_APPROVALS },
    { label: 'ตั้งค่า', icon: 'lucide:settings', path: ROUTE_PATHS.ADMIN_SETTINGS }
  ],
  staff: [
    { label: 'แดชบอร์ด', icon: 'lucide:layout-dashboard', path: ROUTE_PATHS.STAFF_DASHBOARD },
    { label: 'จัดการครู', icon: 'lucide:user-check', path: ROUTE_PATHS.STAFF_TEACHERS },
    { label: 'จัดการนักเรียน', icon: 'lucide:graduation-cap', path: ROUTE_PATHS.STAFF_STUDENTS },
    { label: 'จัดการผู้ปกครอง', icon: 'lucide:users', path: ROUTE_PATHS.STAFF_PARENTS },
    { label: 'คำขออนุมัติ', icon: 'lucide:file-check', path: ROUTE_PATHS.STAFF_APPROVALS },
    { label: 'เอกสาร', icon: 'lucide:file-text', path: ROUTE_PATHS.STAFF_DOCUMENTS }
  ],
  teacher: [
    { label: 'แดชบอร์ด', icon: 'lucide:layout-dashboard', path: ROUTE_PATHS.TEACHER_DASHBOARD },
    { label: 'รายวิชาที่สอน', icon: 'lucide:book-open', path: ROUTE_PATHS.TEACHER_SUBJECTS },
    { label: 'นักเรียน', icon: 'lucide:graduation-cap', path: ROUTE_PATHS.TEACHER_STUDENTS },
    { label: 'บันทึกคะแนน', icon: 'lucide:clipboard-check', path: ROUTE_PATHS.TEACHER_GRADES },
    { label: 'เช็คชื่อ', icon: 'lucide:check-square', path: ROUTE_PATHS.TEACHER_ATTENDANCE },
    { label: 'โปรไฟล์', icon: 'lucide:user', path: ROUTE_PATHS.TEACHER_PROFILE }
  ],
  student: [
    { label: 'แดชบอร์ด', icon: 'lucide:layout-dashboard', path: ROUTE_PATHS.STUDENT_DASHBOARD },
    { label: 'ตารางเรียน', icon: 'lucide:calendar', path: ROUTE_PATHS.STUDENT_SCHEDULE },
    { label: 'ผลการเรียน', icon: 'lucide:award', path: ROUTE_PATHS.STUDENT_GRADES },
    { label: 'การเข้าเรียน', icon: 'lucide:calendar-check', path: ROUTE_PATHS.STUDENT_ATTENDANCE }
  ],
  parent: [
    { label: 'แดชบอร์ด', icon: 'lucide:layout-dashboard', path: ROUTE_PATHS.PARENT_DASHBOARD },
    { label: 'บุตรหลาน', icon: 'lucide:users', path: ROUTE_PATHS.PARENT_CHILDREN },
    { label: 'การชำระเงิน', icon: 'lucide:credit-card', path: ROUTE_PATHS.PARENT_PAYMENTS }
  ]
} as const
