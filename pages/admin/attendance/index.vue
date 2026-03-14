<template>
  <NuxtLayout name="admin" page-title="การเข้าเรียน" page-description="บันทึกและตรวจสอบการเข้าเรียนของนักเรียนรายวัน">
    <div class="space-y-5">
      <div class="flex items-start justify-between gap-3">
        <div v-if="sessionInitialized && rows.length" class="summary-strip">
          <div class="summary-item summary-item--present">
            <span class="s-value">{{ statusCount('มาเรียน') }}</span>
            <span class="s-label">มาเรียน</span>
          </div>
          <div class="summary-item summary-item--absent">
            <span class="s-value">{{ statusCount('ขาด') }}</span>
            <span class="s-label">ขาด</span>
          </div>
          <div class="summary-item summary-item--leave">
            <span class="s-value">{{ statusCount('ลา') }}</span>
            <span class="s-label">ลา</span>
          </div>
          <div class="summary-item summary-item--late">
            <span class="s-value">{{ statusCount('สาย') }}</span>
            <span class="s-label">สาย</span>
          </div>
          <div class="summary-item">
            <span class="s-value">{{ presentPct }}%</span>
            <span class="s-label">% มาเรียน</span>
          </div>
        </div>

        <UIButton variant="primary" icon="lucide:plus" @click="openAddSession">บันทึกรายวัน</UIButton>
      </div>

      <UICard v-if="!sessionInitialized">
        <div class="setup-hint-card">
          <div class="setup-hint-title">ยังไม่ได้เริ่มเช็คชื่อรายวัน</div>
          <div class="setup-hint-desc">
            กดปุ่ม บันทึกรายวัน กรอกข้อมูลให้ครบ แล้วกดบันทึก ระบบจะแสดงรายชื่อนักเรียนทันที
          </div>
        </div>
      </UICard>

      <UICard v-else>
        <div class="table-header">
          <span class="table-title">บันทึกการเข้าเรียน ({{ rows.length }} รายการ)</span>
          <div class="table-header-right">
            <span v-if="totalPages > 1" class="page-info-inline">หน้า {{ currentPage }}/{{ totalPages }}</span>
            <div class="page-size-wrap">
              <span class="page-size-label">แสดง</span>
              <select v-model.number="pageSize" class="page-size-sel" @change="currentPage = 1">
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
              <span class="page-size-label">รายการ/หน้า</span>
            </div>
          </div>
        </div>

        <div class="table-scroll">
          <table class="att-table">
            <thead>
              <tr>
                <th>รหัส</th>
                <th>ชื่อนักเรียน</th>
                <th>ห้อง</th>
                <th>วันที่</th>
                <th>คาบ</th>
                <th>วิชา</th>
                <th>สถานะ</th>
                <th>หมายเหตุ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in pagedRows" :key="row.id">
                <td class="td-id">{{ row.studentId }}</td>
                <td class="td-name">{{ row.studentName }}</td>
                <td>{{ row.classroom }}</td>
                <td class="td-date">{{ formatDate(row.date) }}</td>
                <td class="td-center">{{ row.period }}</td>
                <td class="td-course">{{ row.courseName }}</td>
                <td>
                  <select
                    :value="row.status"
                    class="status-select"
                    :class="`status-select--${row.status}`"
                    @change="updateStatus(row, ($event.target as HTMLSelectElement).value as AttendanceStatus)"
                  >
                    <option value="มาเรียน">มาเรียน</option>
                    <option value="ขาด">ขาด</option>
                    <option value="ลา">ลา</option>
                    <option value="สาย">สาย</option>
                  </select>
                </td>
                <td class="td-note">
                  <input
                    :value="row.note"
                    class="note-input"
                    placeholder="หมายเหตุ..."
                    @blur="updateNote(row, ($event.target as HTMLInputElement).value)"
                  />
                </td>
                <td>
                  <div class="action-btns">
                    <UIButton variant="detail" size="sm" @click="navigateTo(`/admin/attendance/${row.id}?student_id=${row.studentUUID}`)">
                      ดู
                    </UIButton>
                    <UIButton variant="delete" size="sm" @click="deleteRow(row)">ลบ</UIButton>
                  </div>
                </td>
              </tr>
              <tr v-if="!rows.length">
                <td colspan="9" class="empty-td">ไม่พบข้อมูลที่ตรงเงื่อนไข</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="totalPages > 1" class="pagination">
          <span class="page-info">{{ rangeStart }}-{{ rangeEnd }} จาก {{ rows.length }} รายการ</span>
          <div class="page-btns">
            <button type="button" class="page-btn" :disabled="currentPage === 1" @click="currentPage = 1"><<</button>
            <button type="button" class="page-btn" :disabled="currentPage === 1" @click="currentPage--"><</button>
            <button
              v-for="p in pageNumbers"
              :key="String(p)"
              type="button"
              class="page-btn"
              :class="{ 'page-btn--active': p === currentPage, 'page-btn--dots': p === '...' }"
              :disabled="p === '...'"
              @click="typeof p === 'number' && (currentPage = p)"
            >
              {{ p }}
            </button>
            <button type="button" class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">></button>
            <button type="button" class="page-btn" :disabled="currentPage === totalPages" @click="currentPage = totalPages">>></button>
          </div>
        </div>
      </UICard>

      <UIModal
        v-model="showModal"
        title="บันทึกการเข้าเรียนรายวัน"
        size="lg"
        :show-default-footer="false"
      >
        <div class="session-row">
          <div class="form-group">
            <label class="form-label">วันที่ <span class="req">*</span></label>
            <input v-model="sessionForm.date" type="date" class="input" />
            <span v-if="formErrors.date" class="field-error">{{ formErrors.date }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">ห้องเรียน <span class="req">*</span></label>
            <select v-model="sessionForm.classroomId" class="input">
              <option value="">-- เลือกห้อง --</option>
              <option v-for="c in classroomRows" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <span v-if="formErrors.classroom" class="field-error">{{ formErrors.classroom }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">คาบที่</label>
            <select v-model.number="sessionForm.period" class="input">
              <option v-for="p in periodOptions" :key="p" :value="p">คาบ {{ p }}</option>
            </select>
          </div>
          <div class="form-group form-group--wide">
            <label class="form-label">วิชา <span class="req">*</span></label>
            <select v-model="sessionForm.subjectAssignmentId" class="input">
              <option value="">-- เลือกรายวิชา --</option>
              <option v-for="c in sessionCourseOptions" :key="c.id" :value="c.id">{{ c.label }}</option>
            </select>
            <span v-if="formErrors.subject" class="field-error">{{ formErrors.subject }}</span>
          </div>
        </div>
        <template #footer>
          <UIButton variant="detail" :disabled="submitting" @click="showModal = false">ยกเลิก</UIButton>
          <UIButton variant="primary" :loading="submitting" @click="saveSession">บันทึก</UIButton>
        </template>
      </UIModal>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: false, middleware: 'auth' })

type AttendanceStatus = 'มาเรียน' | 'ขาด' | 'ลา' | 'สาย'

type BaseResponse<T> = { data: T }

type AttendanceRow = {
  id: string
  studentUUID: string
  studentId: string
  studentName: string
  classroom: string
  date: string
  period: number
  courseName: string
  status: AttendanceStatus
  note: string
  enrollmentID: string
  scheduleID: string
}

type StudentApiItem = {
  id: string
  student_code: string | null
  first_name: string | null
  last_name: string | null
  current_classroom_id: string | null
}

type ClassroomApiItem = {
  id: string
  name: string
}

type AttendanceApiItem = {
  id: string
  enrollment_id: string
  schedule_id: string
  check_date: string | null
  status: string
  note: string | null
}

type EnrollmentApiItem = {
  id: string
  subject_assignment_id: string
  status: string
}

type SubjectAssignmentApiItem = {
  id: string
  subject_id: string
  classroom_id: string
  is_active: boolean
}

type SubjectApiItem = {
  id: string
  name: string
}

type ScheduleApiItem = {
  id: string
  subject_assignment_id: string
  period_no: number | null
  day_of_week: string
  is_active: boolean
}

const { apiFetch } = useApi()
const authStore = useAuthStore()
const { success, error } = useToast()

const loading = ref(false)
const submitting = ref(false)
const rows = ref<AttendanceRow[]>([])
const sessionInitialized = ref(false)
const classroomRows = ref<ClassroomApiItem[]>([])
const studentRows = ref<Array<{ id: string; code: string; name: string; classroomId: string; classroomName: string }>>([])
const enrollmentsByStudent = ref<Record<string, EnrollmentApiItem[]>>({})
const subjectAssignments = ref<SubjectAssignmentApiItem[]>([])
const schedules = ref<ScheduleApiItem[]>([])
const subjectsByID = ref<Record<string, string>>({})

const showModal = ref(false)
const sessionForm = ref({ date: '', classroomId: '', subjectAssignmentId: '', period: 1 })
const formErrors = ref({ date: '', classroom: '', subject: '' })

const classroomNameByID = computed(() => Object.fromEntries(classroomRows.value.map((r) => [r.id, r.name])))
const periodOptions = computed(() => {
  const unique = Array.from(new Set(schedules.value.map((s) => s.period_no || 0).filter((p) => p > 0))).sort((a, b) => a - b)
  if (unique.length) return unique
  return [1, 2, 3, 4, 5, 6, 7, 8]
})

const sessionCourseOptions = computed(() => {
  if (!sessionForm.value.classroomId) return [] as Array<{ id: string; label: string }>

  return subjectAssignments.value
    .filter((a) => a.classroom_id === sessionForm.value.classroomId && a.is_active)
    .map((a) => ({ id: a.id, label: subjectsByID.value[a.subject_id] || a.id.slice(0, 8) }))
})

const pageSize = ref(10)
const currentPage = ref(1)
watch(() => rows.value.length, () => {
  currentPage.value = 1
})
watch(pageSize, () => {
  currentPage.value = 1
})

const totalPages = computed(() => Math.max(1, Math.ceil(rows.value.length / pageSize.value)))
const rangeStart = computed(() => (rows.value.length === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1))
const rangeEnd = computed(() => Math.min(currentPage.value * pageSize.value, rows.value.length))
const pagedRows = computed(() => rows.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value))
const pageNumbers = computed<(number | '...')[]>(() => {
  const total = totalPages.value
  const cur = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = []
  const push = (n: number | '...') => {
    if (pages[pages.length - 1] !== n) pages.push(n)
  }

  push(1)
  if (cur > 3) push('...')
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) push(i)
  if (cur < total - 2) push('...')
  push(total)
  return pages
})

function statusCount(status: AttendanceStatus) {
  return rows.value.filter((r) => r.status === status).length
}

const presentPct = computed(() => {
  if (!rows.value.length) return 0
  return Math.round((statusCount('มาเรียน') / rows.value.length) * 100)
})

function formatDate(value: string) {
  if (!value) return ''
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return value
  return dt.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })
}

function trimName(firstName: string | null, lastName: string | null) {
  const first = (firstName || '').trim()
  const last = (lastName || '').trim()
  return `${first} ${last}`.trim() || 'ไม่ระบุชื่อ'
}

function apiStatusToUI(status: string): AttendanceStatus {
  if (status === 'absent') return 'ขาด'
  if (status === 'late') return 'สาย'
  if (status === 'sick' || status === 'business') return 'ลา'
  return 'มาเรียน'
}

function uiStatusToAPI(status: AttendanceStatus): string {
  if (status === 'ขาด') return 'absent'
  if (status === 'สาย') return 'late'
  if (status === 'ลา') return 'sick'
  return 'present'
}

function dayOfWeekFromDate(date: string): string {
  const day = new Date(date).getDay()
  const map = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return map[day] || 'monday'
}

function asList<T>(response: unknown): T[] {
  const payload: any = (response as any)?.data ?? response
  return Array.isArray(payload) ? payload : []
}

async function safeApiFetch<T>(path: string, fallback: T, options?: Parameters<typeof apiFetch<T>>[1]) {
  try {
    return await apiFetch<T>(path, options)
  } catch {
    return fallback
  }
}

async function loadStudentEnrollments(studentID: string) {
  if (enrollmentsByStudent.value[studentID]) return enrollmentsByStudent.value[studentID]
  const res = await safeApiFetch<BaseResponse<EnrollmentApiItem[]>>(`/back-office/students/${studentID}/enrollments`, { data: [] })
  const data = asList<EnrollmentApiItem>(res)
  enrollmentsByStudent.value[studentID] = data
  return data
}

async function loadBaseData() {
  const schoolID = authStore.user?.schoolId
  const schoolQuery = schoolID ? { school_id: schoolID } : undefined

  const [studentsRes, classroomsRes, subjectsRes, assignmentsRes, schedulesRes] = await Promise.all([
    safeApiFetch<BaseResponse<StudentApiItem[]>>('/back-office/students', { data: [] }, { params: { only_active: true } }),
    safeApiFetch<BaseResponse<ClassroomApiItem[]>>('/back-office/classrooms', { data: [] }, { params: schoolQuery }),
    safeApiFetch<BaseResponse<SubjectApiItem[]>>('/back-office/subjects', { data: [] }, { params: schoolQuery }),
    safeApiFetch<BaseResponse<SubjectAssignmentApiItem[]>>('/back-office/subject-assignments', { data: [] }, { params: { only_active: true } }),
    safeApiFetch<BaseResponse<ScheduleApiItem[]>>('/back-office/schedules', { data: [] }, { params: { only_active: true } })
  ])

  classroomRows.value = asList<ClassroomApiItem>(classroomsRes)
  subjectAssignments.value = asList<SubjectAssignmentApiItem>(assignmentsRes)
  schedules.value = asList<ScheduleApiItem>(schedulesRes)

  const subjectNameMap: Record<string, string> = {}
  for (const item of asList<SubjectApiItem>(subjectsRes)) {
    subjectNameMap[item.id] = item.name
  }
  subjectsByID.value = subjectNameMap

  studentRows.value = asList<StudentApiItem>(studentsRes).map((item) => {
    const classroomID = item.current_classroom_id || ''
    return {
      id: item.id,
      code: (item.student_code || '').trim() || item.id.slice(0, 8),
      name: trimName(item.first_name, item.last_name),
      classroomId: classroomID,
      classroomName: classroomNameByID.value[classroomID] || '-'
    }
  })
}

async function patchRow(row: AttendanceRow, status: AttendanceStatus, note: string) {
  await apiFetch(`/back-office/students/${row.studentUUID}/attendance-logs/${row.id}`, {
    method: 'PATCH',
    body: {
      enrollment_id: row.enrollmentID,
      schedule_id: row.scheduleID,
      check_date: row.date,
      status: uiStatusToAPI(status),
      note
    }
  })
}

async function updateStatus(row: AttendanceRow, status: AttendanceStatus) {
  const idx = rows.value.findIndex((r) => r.id === row.id)
  if (idx === -1) return

  const prev = rows.value[idx]
  rows.value[idx] = { ...prev, status }
  try {
    await patchRow(prev, status, prev.note)
  } catch {
    rows.value[idx] = prev
    error('ไม่สามารถอัปเดตสถานะได้')
  }
}

async function updateNote(row: AttendanceRow, note: string) {
  const idx = rows.value.findIndex((r) => r.id === row.id)
  if (idx === -1) return

  const prev = rows.value[idx]
  rows.value[idx] = { ...prev, note }
  try {
    await patchRow(prev, prev.status, note)
  } catch {
    rows.value[idx] = prev
    error('ไม่สามารถอัปเดตหมายเหตุได้')
  }
}

async function deleteRow(row: AttendanceRow) {
  try {
    await apiFetch(`/back-office/students/${row.studentUUID}/attendance-logs/${row.id}`, {
      method: 'DELETE'
    })
    rows.value = rows.value.filter((r) => r.id !== row.id)
    success('ลบรายการแล้ว')
  } catch {
    error('ไม่สามารถลบรายการได้')
  }
}

function openAddSession() {
  sessionForm.value = {
    date: new Date().toISOString().slice(0, 10),
    classroomId: '',
    subjectAssignmentId: '',
    period: periodOptions.value[0] || 1
  }
  formErrors.value = { date: '', classroom: '', subject: '' }
  showModal.value = true
}

async function saveSession() {
  formErrors.value = { date: '', classroom: '', subject: '' }
  if (!sessionForm.value.date) {
    formErrors.value.date = 'กรุณาเลือกวันที่'
    return
  }
  if (!sessionForm.value.classroomId) {
    formErrors.value.classroom = 'กรุณาเลือกห้องเรียน'
    return
  }
  if (!sessionForm.value.subjectAssignmentId) {
    formErrors.value.subject = 'กรุณาเลือกรายวิชา'
    return
  }

  const targetDay = dayOfWeekFromDate(sessionForm.value.date)
  const schedule = schedules.value.find(
    (s) =>
      s.subject_assignment_id === sessionForm.value.subjectAssignmentId &&
      s.is_active &&
      (s.period_no || 0) === sessionForm.value.period &&
      s.day_of_week === targetDay
  ) ||
    schedules.value.find(
      (s) =>
        s.subject_assignment_id === sessionForm.value.subjectAssignmentId &&
        s.is_active &&
        (s.period_no || 0) === sessionForm.value.period
    )

  if (!schedule) {
    formErrors.value.subject = 'ไม่พบตารางสอนสำหรับวิชา/คาบ/วันที่เลือก'
    return
  }

  const classStudents = studentRows.value.filter((s) => s.classroomId === sessionForm.value.classroomId)
  if (!classStudents.length) {
    formErrors.value.classroom = 'ไม่พบข้อมูลนักเรียนในห้องนี้'
    return
  }

  const newRows: AttendanceRow[] = []
  const assignmentByID = Object.fromEntries(subjectAssignments.value.map((a) => [a.id, a])) as Record<string, SubjectAssignmentApiItem>
  const pickedAssignment = assignmentByID[sessionForm.value.subjectAssignmentId]
  const pickedCourseName = pickedAssignment ? subjectsByID.value[pickedAssignment.subject_id] || '-' : '-'

  submitting.value = true
  try {
    await Promise.all(
      classStudents.map(async (student) => {
        const enrollments = await loadStudentEnrollments(student.id)
        const enrollment = enrollments.find((e) => e.subject_assignment_id === sessionForm.value.subjectAssignmentId)
        if (!enrollment) return

        let logID = ''
        let status: AttendanceStatus = 'มาเรียน'
        let note = ''

        try {
          const created = await apiFetch<BaseResponse<AttendanceApiItem>>(`/back-office/students/${student.id}/attendance-logs`, {
            method: 'POST',
            body: {
              enrollment_id: enrollment.id,
              schedule_id: schedule.id,
              check_date: sessionForm.value.date,
              status: 'present',
              note: ''
            }
          })

          const createdData: any = (created as any)?.data ?? created
          logID = createdData?.id || ''
          if (createdData?.status) status = apiStatusToUI(createdData.status)
          note = (createdData?.note || '').trim()
        } catch {
          const logsRes = await safeApiFetch<BaseResponse<AttendanceApiItem[]>>(
            `/back-office/students/${student.id}/attendance-logs`,
            { data: [] }
          )

          const found = asList<AttendanceApiItem>(logsRes).find(
            (log) =>
              log.enrollment_id === enrollment.id &&
              log.schedule_id === schedule.id &&
              (log.check_date || '').slice(0, 10) === sessionForm.value.date
          )
          if (!found) return
          logID = found.id
          status = apiStatusToUI(found.status)
          note = (found.note || '').trim()
        }

        if (!logID) return

        newRows.push({
          id: logID,
          studentUUID: student.id,
          studentId: student.code,
          studentName: student.name,
          classroom: student.classroomName,
          date: sessionForm.value.date,
          period: sessionForm.value.period,
          courseName: pickedCourseName,
          status,
          note,
          enrollmentID: enrollment.id,
          scheduleID: schedule.id
        })
      })
    )

    if (!newRows.length) {
      formErrors.value.subject = 'ไม่พบนักเรียนที่ลงทะเบียนในรายวิชานี้สำหรับห้องที่เลือก'
      return
    }

    rows.value = newRows.sort((a, b) => a.studentId.localeCompare(b.studentId))
    sessionInitialized.value = true
    showModal.value = false
    success('บันทึกรายวันสำเร็จ')
  } catch {
    error('ไม่สามารถบันทึกรายวันได้')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await authStore.restoreSession()
    await loadBaseData()
  } catch {
    error('ไม่สามารถโหลดข้อมูลพื้นฐานการเข้าเรียนได้')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.setup-hint-card {
  border: 1px dashed #cbd5e1;
  background: #f8fafc;
  border-radius: 12px;
  padding: 14px 16px;
}

.setup-hint-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
}

.setup-hint-desc {
  margin-top: 4px;
  font-size: 0.82rem;
  color: #64748b;
}

.summary-strip {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.summary-item {
  background: #fff;
  border: 1px solid #e8eaed;
  border-radius: 12px;
  padding: 12px 20px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 90px;
}

.summary-item--present {
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.summary-item--absent {
  border-color: #fecaca;
  background: #fef2f2;
}

.summary-item--leave {
  border-color: #e9d5ff;
  background: #faf5ff;
}

.summary-item--late {
  border-color: #fde68a;
  background: #fffbeb;
}

.s-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.1;
}

.s-label {
  font-size: 0.78rem;
  color: #6b7280;
}

.table-header {
  padding: 12px 20px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.table-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
}

.table-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-info-inline {
  font-size: 0.78rem;
  color: #9ca3af;
  white-space: nowrap;
}

.page-size-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.page-size-label {
  font-size: 0.78rem;
  color: #9ca3af;
  white-space: nowrap;
}

.page-size-sel {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 3px 6px;
  font-size: 0.78rem;
  font-family: inherit;
  background: #fff;
  color: #374151;
  cursor: pointer;
  outline: none;
}

.table-scroll {
  overflow-x: auto;
}

.att-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.att-table th {
  background: #f9fafb;
  padding: 10px 14px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.78rem;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.att-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
}

.att-table tr:last-child td {
  border-bottom: none;
}

.td-id {
  font-size: 0.78rem;
  color: #9ca3af;
  white-space: nowrap;
}

.td-name {
  font-weight: 500;
  white-space: nowrap;
}

.td-date {
  white-space: nowrap;
  font-size: 0.82rem;
}

.td-center {
  text-align: center;
}

.td-course {
  max-width: 140px;
  font-size: 0.82rem;
}

.empty-td {
  text-align: center;
  color: #9ca3af;
  padding: 32px;
}

.status-select {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-family: inherit;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  outline: none;
}

.status-select--มาเรียน {
  background: #f0fdf4;
  color: #15803d;
  border-color: #bbf7d0;
}

.status-select--ขาด {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fecaca;
}

.status-select--ลา {
  background: #faf5ff;
  color: #7c3aed;
  border-color: #e9d5ff;
}

.status-select--สาย {
  background: #fffbeb;
  color: #b45309;
  border-color: #fde68a;
}

.note-input {
  padding: 3px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.78rem;
  font-family: inherit;
  outline: none;
  width: 120px;
  background: #fff;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid #e8eaed;
  gap: 12px;
  flex-wrap: wrap;
}

.page-info {
  font-size: 0.8rem;
  color: #9ca3af;
  white-space: nowrap;
}

.page-btns {
  display: flex;
  align-items: center;
  gap: 3px;
}

.page-btn {
  min-width: 30px;
  height: 30px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  color: #374151;
  font-size: 0.8rem;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.1s;
  font-weight: 500;
}

.page-btn:hover:not(:disabled):not(.page-btn--dots) {
  background: #f3f4f6;
}

.page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.page-btn--active {
  background: #111827 !important;
  border-color: #111827 !important;
  color: #fff !important;
}

.page-btn--dots {
  border-color: transparent;
  background: transparent;
  cursor: default;
  color: #9ca3af;
}

.action-btns {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  flex-wrap: nowrap;
}

.session-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1.5fr;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group--wide {
  grid-column: span 1;
}

.form-label {
  font-size: 0.82rem;
  font-weight: 500;
  color: #374151;
}

.req {
  color: #ef4444;
}

.field-error {
  font-size: 0.72rem;
  color: #ef4444;
}

@media (max-width: 1024px) {
  .session-row {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 720px) {
  .session-row {
    grid-template-columns: 1fr;
  }
}
</style>
