<template>
  <NuxtLayout name="admin" page-title="บันทึกผลการเรียน" page-description="จัดการและติดตามผลการเรียนของนักเรียน">
    <div class="space-y-5">
      <UICard v-if="errorMessage">
        <p class="text-sm text-danger-600">{{ errorMessage }}</p>
      </UICard>

      <div class="summary-strip">
        <div class="summary-item summary-item--pass">
          <span class="s-value">{{ passCount }}</span>
          <span class="s-label">ผ่าน</span>
        </div>
        <div class="summary-item summary-item--fail">
          <span class="s-value">{{ failCount }}</span>
          <span class="s-label">ไม่ผ่าน</span>
        </div>
        <div class="summary-item summary-item--pending">
          <span class="s-value">{{ pendingCount }}</span>
          <span class="s-label">รอผล</span>
        </div>
        <div class="summary-item">
          <span class="s-value">{{ avgTotal }}</span>
          <span class="s-label">ค่าเฉลี่ยรวม</span>
        </div>
      </div>

      <UICard>
        <div class="filter-bar">
          <div class="search-wrap">
            <input v-model="search" class="input search-input" placeholder="ค้นหาชื่อ / รหัสนักเรียน" />
          </div>
          <select v-model="filterClassroom" class="input filter-select">
            <option value="">ทุกห้องเรียน</option>
            <option v-for="item in classroomOptions" :key="item" :value="item">{{ item }}</option>
          </select>
          <select v-model="filterCourse" class="input filter-select">
            <option value="">ทุกรายวิชา</option>
            <option v-for="item in courseOptions" :key="item" :value="item">{{ item }}</option>
          </select>
          <select v-model="filterSemester" class="input filter-select">
            <option value="">ทุกภาคเรียน</option>
            <option value="1">ภาคเรียน 1</option>
            <option value="2">ภาคเรียน 2</option>
          </select>
          <UIButton v-if="search || filterClassroom || filterCourse || filterSemester" variant="detail" @click="clearFilters">
            ล้างตัวกรอง
          </UIButton>
        </div>
      </UICard>

      <UICard>
        <div class="table-header">
          <span class="table-title">รายการผลการเรียน ({{ filteredRows.length }} รายการ)</span>
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

        <div v-if="loading || pageLoading" class="py-10 text-center text-secondary-500">กำลังโหลดข้อมูล...</div>

        <div v-else class="table-scroll">
          <table class="grade-table">
            <thead>
              <tr>
                <th>รหัส</th>
                <th>นักเรียน</th>
                <th>ห้อง</th>
                <th>รายวิชา</th>
                <th>ภาคเรียน</th>
                <th class="score-col">กลางภาค</th>
                <th class="score-col">ปลายภาค</th>
                <th class="score-col">กิจกรรม</th>
                <th class="score-col">รวม</th>
                <th>เกรด</th>
                <th>ผล</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in pagedRows" :key="row.id" class="grade-row">
                <td class="td-id">{{ row.studentId }}</td>
                <td class="td-name">{{ row.studentName }}</td>
                <td>{{ row.classroom }}</td>
                <td class="td-course">{{ row.courseName }}</td>
                <td class="td-score">{{ row.semester }}</td>
                <td class="td-score">{{ displayScore(row.midScore) }}</td>
                <td class="td-score">{{ displayScore(row.finalScore) }}</td>
                <td class="td-score">{{ displayScore(row.activityScore) }}</td>
                <td class="td-score td-total">{{ displayScore(getTotal(row)) }}</td>
                <td class="td-score">
                  <span class="grade-badge" :class="`grade-${gradeClass(getGrade(row))}`">{{ getGrade(row) }}</span>
                </td>
                <td class="td-score">
                  <span class="status-badge" :class="`status-${getStatus(row)}`">{{ getStatus(row) }}</span>
                </td>
                <td class="actions-td">
                  <div class="action-btns">
                    <UIButton
                      v-if="detailRecordId(row)"
                      variant="detail"
                      size="sm"
                      @click="openDetail(row)"
                    >
                      ดู
                    </UIButton>
                    <UIButton variant="edit" size="sm" @click="openEdit(row)">แก้ไข</UIButton>
                  </div>
                </td>
              </tr>
              <tr v-if="!pagedRows.length">
                <td colspan="12" class="empty-td">ไม่พบข้อมูลผลการเรียน</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="totalPages > 1" class="pagination">
          <span class="page-info">{{ rangeStart }}-{{ rangeEnd }} จาก {{ filteredRows.length }} รายการ</span>
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
        title="แก้ไขคะแนน"
        size="sm"
        :show-default-footer="false"
      >
        <div v-if="editTarget" class="score-form">
          <div class="score-student">
            <span class="score-name">{{ editTarget.studentName }}</span>
            <span class="score-course">{{ editTarget.courseName }} - เทอม {{ editTarget.semester }}</span>
          </div>

          <div class="score-fields">
            <div class="form-group">
              <label class="form-label">กลางภาค</label>
              <input v-model.number="scoreForm.midScore" type="number" class="input" min="0" max="100" step="0.01" />
            </div>
            <div class="form-group">
              <label class="form-label">ปลายภาค</label>
              <input v-model.number="scoreForm.finalScore" type="number" class="input" min="0" max="100" step="0.01" />
            </div>
            <div class="form-group">
              <label class="form-label">กิจกรรม</label>
              <input v-model.number="scoreForm.activityScore" type="number" class="input" min="0" max="100" step="0.01" />
            </div>
          </div>

          <div class="score-preview">รวม: {{ displayScore(previewTotal) }} | เกรด: {{ previewGrade }}</div>
        </div>

        <template #footer>
          <UIButton variant="detail" :disabled="submitting" @click="showModal = false">ยกเลิก</UIButton>
          <UIButton variant="primary" :loading="submitting" @click="saveScore">บันทึก</UIButton>
        </template>
      </UIModal>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

definePageMeta({ layout: false, middleware: 'auth' })

type BaseResponse<T> = { data: T }

type StudentApiItem = {
  id: string
  current_classroom_id: string | null
  student_code: string | null
  first_name: string | null
  last_name: string | null
}

type ClassroomApiItem = {
  id: string
  name: string
  grade_level: string | null
  room_no: string | null
}

type SubjectApiItem = {
  id: string
  subject_code: string | null
  name: string
}

type SubjectAssignmentApiItem = {
  id: string
  subject_id: string
  classroom_id: string
  semester_no: number
  academic_year_id?: string
}

type StudentEnrollmentApiItem = {
  id: string
  subject_assignment_id: string
}

type GradeItemApiItem = {
  id: string
  subject_assignment_id: string
  name: string | null
  max_score?: number | null
  weight_percentage?: number | null
}

type GradeRecordApiItem = {
  id: string
  enrollment_id: string
  grade_item_id: string
  score: number | null
}

type GradeRow = {
  id: string
  studentUUID: string
  studentId: string
  studentName: string
  classroom: string
  courseCode: string
  courseName: string
  semester: string
  year: string
  subjectAssignmentId: string
  enrollmentId: string
  midItemId: string
  finalItemId: string
  activityItemId: string
  midRecordId: string
  finalRecordId: string
  activityRecordId: string
  midScore: number | null
  finalScore: number | null
  activityScore: number | null
}

const loading = ref(false)
const { apiFetch } = useApi()
const authStore = useAuthStore()
const { success, error } = useToast()

const rows = ref<GradeRow[]>([])
const pageLoading = ref(false)
const submitting = ref(false)
const errorMessage = ref('')

const showModal = ref(false)
const editTarget = ref<GradeRow | null>(null)
const scoreForm = ref({
  midScore: null as number | null,
  finalScore: null as number | null,
  activityScore: null as number | null
})

function toNullableNumber(value: unknown): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) return null
  return value
}

function displayName(firstName: string | null, lastName: string | null) {
  const first = (firstName || '').trim()
  const last = (lastName || '').trim()
  return `${first} ${last}`.trim() || 'ไม่ระบุชื่อ'
}

function displayScore(value: number | null) {
  if (value === null || Number.isNaN(value)) return '-'
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

function itemCategory(name: string): 'mid' | 'final' | 'activity' | 'other' {
  const key = name.trim().toLowerCase()
  if (!key) return 'other'
  if (key.includes('กลาง') || key.includes('mid')) return 'mid'
  if (key.includes('ปลาย') || key.includes('final')) return 'final'
  if (key.includes('กิจกรรม') || key.includes('activity') || key.includes('เก็บ')) return 'activity'
  return 'other'
}

function getTotal(r: GradeRow): number | null {
  if (r.midScore === null && r.finalScore === null && r.activityScore === null) return null
  return (r.midScore ?? 0) + (r.finalScore ?? 0) + (r.activityScore ?? 0)
}

function getGrade(r: GradeRow): string {
  const total = getTotal(r)
  if (total === null) return 'รอผล'
  if (total >= 80) return '4'
  if (total >= 75) return '3.5'
  if (total >= 70) return '3'
  if (total >= 65) return '2.5'
  if (total >= 60) return '2'
  if (total >= 55) return '1.5'
  if (total >= 50) return '1'
  return '0'
}

function getStatus(r: GradeRow): 'ผ่าน' | 'ไม่ผ่าน' | 'รอผล' {
  const total = getTotal(r)
  if (total === null) return 'รอผล'
  return total >= 50 ? 'ผ่าน' : 'ไม่ผ่าน'
}

function detailRecordId(row: GradeRow) {
  return row.midRecordId || row.finalRecordId || row.activityRecordId || ''
}

function gradeClass(grade: string) {
  return grade.replace('.', '-')
}

function normalizeScoreInput(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null
    const parsed = Number.parseFloat(trimmed)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

async function fetchList<T>(path: string, params: Record<string, any> = {}) {
  const res = await apiFetch<BaseResponse<T[]>>(path, { params })
  const payload: any = (res as any)?.data ?? res
  return Array.isArray(payload) ? (payload as T[]) : []
}

async function loadRows() {
  pageLoading.value = true
  errorMessage.value = ''
  try {
    const schoolId = authStore.user?.schoolId
    const schoolParams = schoolId ? { school_id: schoolId } : {}

    const [students, classrooms, subjects, assignments, years] = await Promise.all([
      fetchList<StudentApiItem>('/back-office/students', { only_active: true }),
      fetchList<ClassroomApiItem>('/back-office/classrooms', schoolParams),
      fetchList<SubjectApiItem>('/back-office/subjects', schoolParams),
      fetchList<SubjectAssignmentApiItem>('/back-office/subject-assignments', { only_active: true }),
      fetchList<any>('/back-office/academic-years', { only_active: true })
    ])

    const classroomNameByID = new Map(
      classrooms.map((item) => [item.id, item.name || `${item.grade_level || ''} ${item.room_no || ''}`.trim() || item.id] as const)
    )
    const subjectByID = new Map(subjects.map((item) => [item.id, item] as const))
    const yearLabelByID = new Map(
      years.map((item: any) => [item.id, `${item.year || ''} / ${item.term || ''}`.trim()] as const)
    )
    const assignmentByID = new Map(assignments.map((item) => [item.id, item] as const))

    const rowsByStudent = await Promise.all(
      students.map(async (student) => {
        const [enrollments, gradeItems, gradeRecords] = await Promise.all([
          fetchList<StudentEnrollmentApiItem>(`/back-office/students/${student.id}/enrollments`),
          fetchList<GradeItemApiItem>(`/back-office/students/${student.id}/grade-items`),
          fetchList<GradeRecordApiItem>(`/back-office/students/${student.id}/grade-records`)
        ])

        const gradeItemsByID = new Map(gradeItems.map((item) => [item.id, item] as const))
        const recordsByEnrollment = new Map<string, GradeRecordApiItem[]>()

        for (const record of gradeRecords) {
          const list = recordsByEnrollment.get(record.enrollment_id) || []
          list.push(record)
          recordsByEnrollment.set(record.enrollment_id, list)
        }

        return enrollments
          .map((enrollment) => {
            const assignment = assignmentByID.get(enrollment.subject_assignment_id)
            if (!assignment) return null

            const subject = subjectByID.get(assignment.subject_id)
            const records = recordsByEnrollment.get(enrollment.id) || []

            let midItemId = ''
            let finalItemId = ''
            let activityItemId = ''
            let midRecordId = ''
            let finalRecordId = ''
            let activityRecordId = ''
            let midScore: number | null = null
            let finalScore: number | null = null
            let activityScore: number | null = null

            for (const record of records) {
              const item = gradeItemsByID.get(record.grade_item_id)
              const category = itemCategory(item?.name || '')

              if (category === 'mid') {
                midItemId = item?.id || midItemId
                midRecordId = record.id
                midScore = toNullableNumber(record.score)
              } else if (category === 'final') {
                finalItemId = item?.id || finalItemId
                finalRecordId = record.id
                finalScore = toNullableNumber(record.score)
              } else if (category === 'activity') {
                activityItemId = item?.id || activityItemId
                activityRecordId = record.id
                activityScore = toNullableNumber(record.score)
              }
            }

            return {
              id: `${student.id}:${enrollment.id}`,
              studentUUID: student.id,
              studentId: (student.student_code || '').trim() || student.id.slice(0, 8),
              studentName: displayName(student.first_name, student.last_name),
              classroom: classroomNameByID.get(student.current_classroom_id || '') || '-',
              courseCode: (subject?.subject_code || '').trim() || assignment.subject_id.slice(0, 8),
              courseName: subject?.name || '-',
              semester: String(assignment.semester_no || 1),
              year: yearLabelByID.get(assignment.academic_year_id || '') || '-',
              subjectAssignmentId: assignment.id,
              enrollmentId: enrollment.id,
              midItemId,
              finalItemId,
              activityItemId,
              midRecordId,
              finalRecordId,
              activityRecordId,
              midScore,
              finalScore,
              activityScore
            } as GradeRow
          })
          .filter((item): item is GradeRow => item !== null)
      })
    )

    rows.value = rowsByStudent.flat()
  } catch {
    errorMessage.value = 'ไม่สามารถโหลดข้อมูลผลการเรียนได้'
    rows.value = []
  } finally {
    pageLoading.value = false
  }
}

if (import.meta.client) {
  onMounted(async () => {
    await authStore.restoreSession()
    await loadRows()
  })
}

const classroomOptions = computed(() => [...new Set(rows.value.map((r) => r.classroom))].sort())
const courseOptions = computed(() => [...new Set(rows.value.map((r) => r.courseName))].sort())

const search = ref('')
const filterClassroom = ref('')
const filterCourse = ref('')
const filterSemester = ref('')

const filteredRows = computed(() => {
  const q = search.value.toLowerCase().trim()
  return rows.value.filter((r) => {
    if (q && !r.studentName.toLowerCase().includes(q) && !r.studentId.toLowerCase().includes(q)) return false
    if (filterClassroom.value && r.classroom !== filterClassroom.value) return false
    if (filterCourse.value && r.courseName !== filterCourse.value) return false
    if (filterSemester.value && r.semester !== filterSemester.value) return false
    return true
  })
})

const passCount = computed(() => filteredRows.value.filter((r) => getStatus(r) === 'ผ่าน').length)
const failCount = computed(() => filteredRows.value.filter((r) => getStatus(r) === 'ไม่ผ่าน').length)
const pendingCount = computed(() => filteredRows.value.filter((r) => getStatus(r) === 'รอผล').length)
const avgTotal = computed(() => {
  const scored = filteredRows.value.filter((r) => getTotal(r) !== null)
  if (!scored.length) return '-'
  const sum = scored.reduce((acc, r) => acc + (getTotal(r) ?? 0), 0)
  return (sum / scored.length).toFixed(1)
})

function clearFilters() {
  search.value = ''
  filterClassroom.value = ''
  filterCourse.value = ''
  filterSemester.value = ''
}

const pageSize = ref(10)
const currentPage = ref(1)
watch(() => filteredRows.value.length, () => {
  currentPage.value = 1
})
watch(pageSize, () => {
  currentPage.value = 1
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value)))
const rangeStart = computed(() => (filteredRows.value.length === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1))
const rangeEnd = computed(() => Math.min(currentPage.value * pageSize.value, filteredRows.value.length))
const pagedRows = computed(() => filteredRows.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value))
const pageNumbers = computed<(number | '...')[]>(() => {
  const total = totalPages.value
  const cur = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = []
  const add = (n: number | '...') => {
    if (pages[pages.length - 1] !== n) pages.push(n)
  }
  add(1)
  if (cur > 3) add('...')
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) add(i)
  if (cur < total - 2) add('...')
  add(total)
  return pages
})

function openDetail(row: GradeRow) {
  const recordId = detailRecordId(row)
  if (!recordId) return
  navigateTo(`/admin/grades/${recordId}?student_id=${encodeURIComponent(row.studentUUID)}`)
}

function openEdit(row: GradeRow) {
  editTarget.value = row
  scoreForm.value = {
    midScore: row.midScore,
    finalScore: row.finalScore,
    activityScore: row.activityScore
  }
  showModal.value = true
}

const previewTotal = computed(() => {
  if (!editTarget.value) return null
  if (scoreForm.value.midScore === null && scoreForm.value.finalScore === null && scoreForm.value.activityScore === null) return null
  return (scoreForm.value.midScore ?? 0) + (scoreForm.value.finalScore ?? 0) + (scoreForm.value.activityScore ?? 0)
})

const previewGrade = computed(() => {
  const value = previewTotal.value
  if (value === null) return 'รอผล'
  if (value >= 80) return '4'
  if (value >= 75) return '3.5'
  if (value >= 70) return '3'
  if (value >= 65) return '2.5'
  if (value >= 60) return '2'
  if (value >= 55) return '1.5'
  if (value >= 50) return '1'
  return '0'
})

async function ensureGradeItem(
  studentID: string,
  assignmentID: string,
  currentItemID: string,
  name: string,
  maxScore: number,
  weightPercentage: number
) {
  if (currentItemID) return currentItemID
  const created = await apiFetch<BaseResponse<GradeItemApiItem>>(`/back-office/students/${studentID}/grade-items`, {
    method: 'POST',
    body: {
      subject_assignment_id: assignmentID,
      name,
      max_score: maxScore,
      weight_percentage: weightPercentage
    }
  })
  const payload: any = (created as any)?.data ?? created
  return String(payload.id || '')
}

async function upsertGradeRecord(
  studentID: string,
  enrollmentID: string,
  itemID: string,
  recordID: string,
  score: number | null
) {
  const payload = {
    enrollment_id: enrollmentID,
    grade_item_id: itemID,
    score,
    teacher_note: null
  }

  if (recordID) {
    const updated = await apiFetch<BaseResponse<GradeRecordApiItem>>(
      `/back-office/students/${studentID}/grade-records/${recordID}`,
      { method: 'PATCH', body: payload }
    )
    return ((updated as any)?.data ?? updated) as GradeRecordApiItem
  }

  const created = await apiFetch<BaseResponse<GradeRecordApiItem>>(`/back-office/students/${studentID}/grade-records`, {
    method: 'POST',
    body: payload
  })
  return ((created as any)?.data ?? created) as GradeRecordApiItem
}

async function saveScore() {
  if (!editTarget.value) return
  const target = editTarget.value
  if (!target.enrollmentId || !target.subjectAssignmentId) return

  const nextMidScore = normalizeScoreInput(scoreForm.value.midScore)
  const nextFinalScore = normalizeScoreInput(scoreForm.value.finalScore)
  const nextActivityScore = normalizeScoreInput(scoreForm.value.activityScore)

  submitting.value = true
  try {
    const midItemId = await ensureGradeItem(
      target.studentUUID,
      target.subjectAssignmentId,
      target.midItemId,
      'กลางภาค',
      100,
      40
    )
    const finalItemId = await ensureGradeItem(
      target.studentUUID,
      target.subjectAssignmentId,
      target.finalItemId,
      'ปลายภาค',
      100,
      50
    )
    const activityItemId = await ensureGradeItem(
      target.studentUUID,
      target.subjectAssignmentId,
      target.activityItemId,
      'กิจกรรม',
      100,
      10
    )

    const [midRecord, finalRecord, activityRecord] = await Promise.all([
      upsertGradeRecord(target.studentUUID, target.enrollmentId, midItemId, target.midRecordId, nextMidScore),
      upsertGradeRecord(target.studentUUID, target.enrollmentId, finalItemId, target.finalRecordId, nextFinalScore),
      upsertGradeRecord(target.studentUUID, target.enrollmentId, activityItemId, target.activityRecordId, nextActivityScore)
    ])

    const idx = rows.value.findIndex((item) => item.id === target.id)
    if (idx !== -1) {
      rows.value[idx] = {
        ...rows.value[idx],
        midItemId,
        finalItemId,
        activityItemId,
        midRecordId: midRecord.id,
        finalRecordId: finalRecord.id,
        activityRecordId: activityRecord.id,
        midScore: nextMidScore,
        finalScore: nextFinalScore,
        activityScore: nextActivityScore
      }
    }

    success('บันทึกคะแนนเรียบร้อย')
    showModal.value = false
  } catch {
    error('บันทึกคะแนนไม่สำเร็จ')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.filter-bar {
  display: flex;
  gap: 10px;
  flex-wrap: nowrap;
  align-items: center;
}

.search-wrap {
  flex: 1 1 360px;
  min-width: 260px;
}

.search-input {
  width: 100%;
}

.filter-select {
  width: auto;
  min-width: 170px;
  flex: 0 0 170px;
}

@media (max-width: 1024px) {
  .filter-bar {
    flex-wrap: wrap;
  }

  .search-wrap {
    flex-basis: 100%;
    min-width: 100%;
  }

  .filter-select {
    flex: 1 1 180px;
  }
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

.summary-item--pass {
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.summary-item--fail {
  border-color: #fecaca;
  background: #fef2f2;
}

.summary-item--pending {
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

.grade-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  min-width: 1100px;
}

.grade-table th {
  background: #f9fafb;
  padding: 10px 14px;
  text-align: center;
  font-weight: 600;
  color: #374151;
  font-size: 0.78rem;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.grade-table td {
  padding: 10px 14px;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
}

.grade-row:last-child td {
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

.td-course {
  max-width: 160px;
}

.td-score {
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.td-total {
  font-weight: 600;
}

.score-col {
  min-width: 72px;
}

.empty-td {
  text-align: center;
  color: #9ca3af;
  padding: 32px;
}

.grade-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  background: #f3f4f6;
  color: #374151;
}

.grade-4,
.grade-3-5,
.grade-3 {
  background: #dcfce7;
  color: #15803d;
}

.grade-2-5,
.grade-2 {
  background: #dbeafe;
  color: #1d4ed8;
}

.grade-1-5,
.grade-1 {
  background: #fef9c3;
  color: #a16207;
}

.grade-0 {
  background: #fee2e2;
  color: #b91c1c;
}

.grade-รอผล {
  background: #f3f4f6;
  color: #9ca3af;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 500;
}

.status-ผ่าน {
  background: #dcfce7;
  color: #15803d;
}

.status-ไม่ผ่าน {
  background: #fee2e2;
  color: #b91c1c;
}

.status-รอผล {
  background: #f3f4f6;
  color: #9ca3af;
}

.actions-td {
  text-align: right;
}

.action-btns {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  flex-wrap: nowrap;
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

.score-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.score-student {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 14px;
  background: #f9fafb;
  border-radius: 8px;
}

.score-name {
  font-weight: 600;
  color: #111827;
}

.score-course {
  font-size: 0.82rem;
  color: #6b7280;
}

.score-fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
}

.score-preview {
  text-align: center;
  font-size: 0.9rem;
  color: #374151;
  padding: 8px;
  background: #f0f4ff;
  border-radius: 8px;
}
</style>
