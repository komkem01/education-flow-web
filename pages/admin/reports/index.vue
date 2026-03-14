<template>
  <NuxtLayout name="admin" page-title="รายงานและสรุปข้อมูล" page-description="สรุปภาพรวมจากข้อมูลจริงในระบบ">
    <div class="space-y-5">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-sm text-secondary-600">สรุปสถิติสำคัญและส่งออกข้อมูลในรูปแบบ CSV</p>
        </div>

        <div class="filters">
          <select v-model="selectedAcademicYearId" class="input filter-input">
            <option value="">ทุกปีการศึกษา</option>
            <option v-for="item in filterAcademicYears" :key="item.id" :value="item.id">{{ item.label }}</option>
          </select>
          <select v-model="selectedSemesterNo" class="input filter-input">
            <option value="">ทุกเทอม</option>
            <option v-for="no in filterSemesters" :key="no" :value="String(no)">เทอม {{ no }}</option>
          </select>
          <UIButton
            variant="detail"
            icon="lucide:refresh-cw"
            class="shrink-0 whitespace-nowrap"
            :loading="loading"
            @click="loadSummary"
          >
            รีเฟรช
          </UIButton>
        </div>
      </div>

      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-icon stat-icon--blue">👩‍🏫</div>
          <div class="stat-body">
            <div class="stat-value">{{ summary.teachers_total }}</div>
            <div class="stat-label">ครูทั้งหมด</div>
            <div class="stat-sub">ใช้งานอยู่ {{ summary.teachers_active }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon--green">🎒</div>
          <div class="stat-body">
            <div class="stat-value">{{ summary.students_total }}</div>
            <div class="stat-label">นักเรียนทั้งหมด</div>
            <div class="stat-sub">สถานะปกติ {{ summary.students_active }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon--purple">📚</div>
          <div class="stat-body">
            <div class="stat-value">{{ summary.subjects_total }}</div>
            <div class="stat-label">รายวิชา</div>
            <div class="stat-sub">ข้อมูลจากหลังบ้าน</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon--amber">📊</div>
          <div class="stat-body">
            <div class="stat-value">{{ summary.grade_records_total }}</div>
            <div class="stat-label">บันทึกผลการเรียน</div>
            <div class="stat-sub">ผ่าน {{ summary.grade_pass_total }} / ไม่ผ่าน {{ summary.grade_fail_total }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon--teal">📋</div>
          <div class="stat-body">
            <div class="stat-value">{{ summary.attendance_total }}</div>
            <div class="stat-label">บันทึกการเข้าเรียน</div>
            <div class="stat-sub">มาเรียน {{ summary.attendance_present }} / ขาด {{ summary.attendance_absent }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon--red">⚡</div>
          <div class="stat-body">
            <div class="stat-value">{{ summary.behavior_total }}</div>
            <div class="stat-label">บันทึกพฤติกรรม</div>
            <div class="stat-sub">ดี {{ summary.behavior_good }} / โทษ {{ summary.behavior_bad }}</div>
          </div>
        </div>
      </div>

      <div class="reports-grid">
        <div v-for="r in reportTypes" :key="r.id" class="report-card">
          <div class="report-icon">{{ r.icon }}</div>
          <div class="report-info">
            <div class="report-title">{{ r.title }}</div>
            <div class="report-desc">{{ r.desc }}</div>
          </div>
          <div class="report-actions">
            <UIButton variant="edit" size="sm" @click="exportReport(r.id)">Export CSV</UIButton>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth'
})

type BaseResponse<T> = { data: T }

type SummaryData = {
  teachers_total: number
  teachers_active: number
  students_total: number
  students_active: number
  subjects_total: number
  courses_total: number
  grade_records_total: number
  grade_pass_total: number
  grade_fail_total: number
  attendance_total: number
  attendance_present: number
  attendance_absent: number
  behavior_total: number
  behavior_good: number
  behavior_bad: number
}

type AcademicYearFilter = {
  id: string
  year: string
  term: string
  label: string
}

type FilterData = {
  academic_years: AcademicYearFilter[]
  semesters: number[]
}

const { apiFetch } = useApi()
const { success, error } = useToast()

const loading = ref(false)

const summary = ref<SummaryData>({
  teachers_total: 0,
  teachers_active: 0,
  students_total: 0,
  students_active: 0,
  subjects_total: 0,
  courses_total: 0,
  grade_records_total: 0,
  grade_pass_total: 0,
  grade_fail_total: 0,
  attendance_total: 0,
  attendance_present: 0,
  attendance_absent: 0,
  behavior_total: 0,
  behavior_good: 0,
  behavior_bad: 0
})

const filterAcademicYears = ref<AcademicYearFilter[]>([])
const filterSemesters = ref<number[]>([1, 2])
const selectedAcademicYearId = ref('')
const selectedSemesterNo = ref('')

const reportTypes = [
  { id: 'teacher-summary', icon: '👩‍🏫', title: 'สรุปข้อมูลครู', desc: 'จำนวนครูและสถานะการใช้งาน' },
  { id: 'student-summary', icon: '🎒', title: 'สรุปข้อมูลนักเรียน', desc: 'จำนวนนักเรียนและสถานะการใช้งาน' },
  { id: 'grade-report', icon: '📊', title: 'รายงานผลการเรียน', desc: 'จำนวนผลการเรียนผ่าน/ไม่ผ่าน' },
  { id: 'attendance-report', icon: '📋', title: 'รายงานการเข้าเรียน', desc: 'สถิติการมาเรียนและขาดเรียน' },
  { id: 'behavior-report', icon: '⚡', title: 'รายงานพฤติกรรม', desc: 'สถิติพฤติกรรมเชิงบวกและเชิงลบ' }
]

async function loadFilters() {
  try {
    const res = await apiFetch<BaseResponse<FilterData>>('/reports/filters')
    filterAcademicYears.value = res.data?.academic_years || []
    filterSemesters.value = res.data?.semesters || [1, 2]
  } catch {
    // Keep default filters when backend does not provide filter endpoint.
    filterAcademicYears.value = []
    filterSemesters.value = [1, 2]
  }
}

async function loadSummary() {
  loading.value = true
  try {
    const params: Record<string, string> = {}
    if (selectedAcademicYearId.value) params.academic_year_id = selectedAcademicYearId.value
    if (selectedSemesterNo.value) params.semester_no = selectedSemesterNo.value

    const res = await apiFetch<BaseResponse<{ summary: SummaryData }>>('/reports/summary', { params })
    const next = res.data?.summary
    if (next) {
      summary.value = { ...summary.value, ...next }
    }
  } catch {
    error('ไม่สามารถโหลดข้อมูลสรุปรายงานได้')
  } finally {
    loading.value = false
  }
}

function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const escapeCsv = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`
  const csv = [headers.map(escapeCsv).join(','), ...rows.map((row) => row.map(escapeCsv).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function exportReport(type: string) {
  if (type === 'teacher-summary') {
    downloadCsv('teacher-summary.csv', ['teachers_total', 'teachers_active'], [[summary.value.teachers_total, summary.value.teachers_active]])
  } else if (type === 'student-summary') {
    downloadCsv('student-summary.csv', ['students_total', 'students_active'], [[summary.value.students_total, summary.value.students_active]])
  } else if (type === 'grade-report') {
    downloadCsv(
      'grade-report.csv',
      ['grade_records_total', 'pass', 'fail'],
      [[summary.value.grade_records_total, summary.value.grade_pass_total, summary.value.grade_fail_total]]
    )
  } else if (type === 'attendance-report') {
    downloadCsv(
      'attendance-report.csv',
      ['attendance_total', 'present', 'absent'],
      [[summary.value.attendance_total, summary.value.attendance_present, summary.value.attendance_absent]]
    )
  } else {
    downloadCsv(
      'behavior-report.csv',
      ['behavior_total', 'good', 'bad'],
      [[summary.value.behavior_total, summary.value.behavior_good, summary.value.behavior_bad]]
    )
  }

  success('Export สำเร็จ')
}

watch([selectedAcademicYearId, selectedSemesterNo], () => {
  loadSummary()
})

onMounted(async () => {
  await loadFilters()
  await loadSummary()
})
</script>

<style scoped>
.filters {
  display: flex;
  gap: 10px;
  flex-wrap: nowrap;
  align-items: center;
  overflow-x: auto;
}

.filter-input {
  min-width: 220px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.stat-card {
  background: #fff;
  border: 1px solid #e8eaed;
  border-radius: 12px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
}

.stat-icon--blue {
  background: #dbeafe;
}

.stat-icon--green {
  background: #d1fae5;
}

.stat-icon--purple {
  background: #ede9fe;
}

.stat-icon--amber {
  background: #fef3c7;
}

.stat-icon--teal {
  background: #ccfbf1;
}

.stat-icon--red {
  background: #fee2e2;
}

.stat-body {
  flex: 1;
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.1;
}

.stat-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #374151;
  margin-top: 2px;
}

.stat-sub {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 2px;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.report-card {
  background: #fff;
  border: 1px solid #e8eaed;
  border-radius: 12px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.report-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.report-info {
  flex: 1;
}

.report-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
}

.report-desc {
  font-size: 0.78rem;
  color: #6b7280;
  margin-top: 2px;
}

.report-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

@media (max-width: 1100px) {
  .stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 740px) {
  .reports-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }
}
</style>
