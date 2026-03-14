<template>
  <NuxtLayout name="admin" page-title="ตารางสอน" page-description="จัดการตารางสอนรายวิชาและคาบเรียน">
    <div class="mb-6 flex items-center justify-between gap-3">
      <div class="flex-1 text-sm text-secondary-600">ทั้งหมด {{ pagination.total }} รายการ</div>
      <div class="flex items-center gap-2">
        <UIButton variant="secondary" icon="lucide:refresh-cw" @click="fetchAll">รีเฟรช</UIButton>
        <UIButton variant="primary" icon="lucide:plus" @click="openCreateModal">เพิ่มคาบเรียน</UIButton>
      </div>
    </div>

    <UICard v-if="errorMessage" class="mb-4">
      <p class="text-sm text-danger-600">{{ errorMessage }}</p>
    </UICard>

    <UICard class="mb-4">
      <div class="flex flex-nowrap items-center gap-2 overflow-x-auto">
        <select v-model="filterClassroomId" class="input min-w-[220px]" @change="onFilterChange">
          <option value="">ทุกห้องเรียน</option>
          <option v-for="opt in classroomOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <select v-model="filterYearId" class="input min-w-[220px]" @change="onFilterChange">
          <option value="">ทุกปีการศึกษา</option>
          <option v-for="opt in yearOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <select v-model="filterSemester" class="input min-w-[160px]" @change="onFilterChange">
          <option value="">ทุกเทอม</option>
          <option value="1">เทอม 1</option>
          <option value="2">เทอม 2</option>
          <option value="3">เทอม 3</option>
        </select>
        <UIButton
          v-if="filterClassroomId || filterYearId || filterSemester"
          variant="detail"
          class="shrink-0 whitespace-nowrap"
          @click="clearFilters"
        >
          ล้างตัวกรอง
        </UIButton>
      </div>
    </UICard>

    <UICard>
      <UITable
        :columns="columns"
        :data="pagedRows"
        :loading="loading"
        :actions="{ view: true, edit: true, delete: true }"
        :pagination="pagination"
        @view="handleView"
        @edit="handleEdit"
        @delete="openDeleteModal"
        @page-change="handlePageChange"
      />
    </UICard>

    <UIModal
      v-model="showModal"
      :title="editTarget ? 'แก้ไขคาบเรียน' : 'เพิ่มคาบเรียน'"
      size="xl"
      :show-default-footer="true"
      :loading="saving"
      @confirm="handleSave"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UISelect
          v-model="form.classroomId"
          label="ห้องเรียน"
          :options="classroomOptions"
          placeholder="เลือกห้องเรียน"
          required
        />
        <UISelect
          v-model="form.academicYearId"
          label="ปีการศึกษา"
          :options="yearOptions"
          placeholder="เลือกปีการศึกษา"
          required
        />
        <UISelect
          v-model="form.semesterNo"
          label="ภาคเรียน"
          :options="semesterOptions"
          placeholder="เลือกภาคเรียน"
          required
        />
        <UISelect
          v-model="form.dayOfWeek"
          label="วัน"
          :options="dayOptions"
          placeholder="เลือกวัน"
          required
        />
        <UIInput v-model="form.periodNo" label="คาบที่" type="number" min="1" placeholder="เช่น 1" required />
        <UIInput v-model="form.startTime" label="เวลาเริ่ม" type="time" required />
        <UIInput v-model="form.endTime" label="เวลาสิ้นสุด" type="time" required />
        <UISelect
          v-model="form.subjectId"
          class="md:col-span-2"
          label="รายวิชา"
          :options="subjectOptions"
          placeholder="เลือกรายวิชา"
          required
        />
        <UISelect
          v-model="form.teacherId"
          class="md:col-span-2"
          label="ครูผู้สอน"
          :options="teacherOptions"
          placeholder="เลือกครูผู้สอน"
          required
        />
        <UIInput v-model="form.note" class="md:col-span-2" label="หมายเหตุ" placeholder="หมายเหตุเพิ่มเติม" />
      </div>
    </UIModal>

    <UIModal
      v-model="showDeleteModal"
      title="ยืนยันการลบ"
      size="md"
      :show-default-footer="true"
      :loading="deleting"
      @confirm="confirmDelete"
    >
      <p class="text-sm text-secondary-700">
        ต้องการลบคาบเรียน
        <span class="font-semibold text-secondary-900">{{ deleteTarget?.subjectName }}</span>
        ใช่หรือไม่?
      </p>
    </UIModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

definePageMeta({
  layout: false,
  middleware: 'auth'
})

const { apiFetch } = useApi()
const { success, error } = useToast()

type BaseResponse<T> = { data: T }

type SubjectApiItem = {
  id: string
  subject_code: string | null
  name: string
}

type TeacherApiItem = {
  id: string
  teacher_code: string | null
  first_name: string | null
  last_name: string | null
}

type ClassroomApiItem = {
  id: string
  name: string
  grade_level: string | null
  room_no: string | null
}

type AcademicYearApiItem = {
  id: string
  year: string
  term: string
  is_current: boolean
}

type SubjectAssignmentApiItem = {
  id: string
  subject_id: string
  teacher_id: string
  classroom_id: string
  academic_year_id: string
  semester_no: number
  is_active: boolean
}

type ScheduleApiItem = {
  id: string
  subject_assignment_id: string
  day_of_week: string
  start_time: string | null
  end_time: string | null
  period_no: number | null
  note: string | null
  is_active: boolean
}

type TimetableRow = {
  id: string
  subjectAssignmentId: string
  subjectId: string
  teacherId: string
  classroomId: string
  academicYearId: string
  semesterNo: number
  dayOfWeek: string
  dayLabel: string
  periodNo: number
  startTime: string
  endTime: string
  subjectName: string
  teacherName: string
  classroomName: string
  yearLabel: string
  note: string
}

type Option = {
  value: string
  label: string
}

const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const errorMessage = ref('')

const rows = ref<TimetableRow[]>([])
const subjectRows = ref<SubjectApiItem[]>([])
const teacherRows = ref<TeacherApiItem[]>([])
const classroomRows = ref<ClassroomApiItem[]>([])
const academicYearRows = ref<AcademicYearApiItem[]>([])
const assignmentRows = ref<SubjectAssignmentApiItem[]>([])
const scheduleRows = ref<ScheduleApiItem[]>([])

const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 1 })

const columns = [
  { key: 'dayLabel', label: 'วัน' },
  { key: 'periodNo', label: 'คาบ' },
  { key: 'subjectName', label: 'รายวิชา' },
  { key: 'teacherName', label: 'ครูผู้สอน' },
  { key: 'classroomName', label: 'ห้องเรียน' },
  { key: 'yearLabel', label: 'ปีการศึกษา' },
  { key: 'semesterNo', label: 'เทอม' },
  { key: 'startTime', label: 'เริ่ม' },
  { key: 'endTime', label: 'สิ้นสุด' }
]

const filterClassroomId = ref('')
const filterYearId = ref('')
const filterSemester = ref('')

const showModal = ref(false)
const editTarget = ref<TimetableRow | null>(null)

const showDeleteModal = ref(false)
const deleteTarget = ref<TimetableRow | null>(null)

const form = reactive({
  classroomId: '',
  academicYearId: '',
  semesterNo: '1',
  dayOfWeek: 'monday',
  periodNo: '',
  startTime: '',
  endTime: '',
  subjectId: '',
  teacherId: '',
  note: ''
})

const dayMap: Record<string, string> = {
  monday: 'จันทร์',
  tuesday: 'อังคาร',
  wednesday: 'พุธ',
  thursday: 'พฤหัสบดี',
  friday: 'ศุกร์',
  saturday: 'เสาร์',
  sunday: 'อาทิตย์'
}

const dayOptions: Option[] = [
  { value: 'monday', label: 'จันทร์' },
  { value: 'tuesday', label: 'อังคาร' },
  { value: 'wednesday', label: 'พุธ' },
  { value: 'thursday', label: 'พฤหัสบดี' },
  { value: 'friday', label: 'ศุกร์' },
  { value: 'saturday', label: 'เสาร์' },
  { value: 'sunday', label: 'อาทิตย์' }
]

const semesterOptions: Option[] = [
  { value: '1', label: 'เทอม 1' },
  { value: '2', label: 'เทอม 2' },
  { value: '3', label: 'เทอม 3' }
]

const subjectOptions = computed<Option[]>(() =>
  subjectRows.value
    .map((item) => {
      const code = (item.subject_code || '').trim()
      return {
        value: item.id,
        label: code ? `${code} - ${item.name}` : item.name
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'th'))
)

const teacherOptions = computed<Option[]>(() =>
  teacherRows.value
    .map((item) => ({
      value: item.id,
      label: `${(item.first_name || '').trim()} ${(item.last_name || '').trim()}`.trim() || item.teacher_code || 'ไม่ระบุชื่อครู'
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'th'))
)

const classroomOptions = computed<Option[]>(() =>
  classroomRows.value
    .map((item) => ({ value: item.id, label: item.name || `${item.grade_level || ''} ${item.room_no || ''}`.trim() || 'ไม่ระบุห้องเรียน' }))
    .sort((a, b) => a.label.localeCompare(b.label, 'th'))
)

const yearOptions = computed<Option[]>(() =>
  academicYearRows.value
    .map((item) => ({ value: item.id, label: `${item.year} / ${item.term}` }))
    .sort((a, b) => a.label.localeCompare(b.label, 'th'))
)

const filteredRows = computed(() => {
  return rows.value.filter((row) => {
    if (filterClassroomId.value && row.classroomId !== filterClassroomId.value) return false
    if (filterYearId.value && row.academicYearId !== filterYearId.value) return false
    if (filterSemester.value && String(row.semesterNo) !== filterSemester.value) return false
    return true
  })
})

const pagedRows = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.limit
  const end = start + pagination.value.limit
  return filteredRows.value.slice(start, end)
})

const updatePagination = () => {
  pagination.value.total = filteredRows.value.length
  pagination.value.totalPages = Math.max(1, Math.ceil(filteredRows.value.length / pagination.value.limit))
  if (pagination.value.page > pagination.value.totalPages) {
    pagination.value.page = pagination.value.totalPages
  }
}

const normalizeTimeForInput = (value: string | null) => {
  if (!value) return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  return trimmed.length >= 5 ? trimmed.slice(0, 5) : trimmed
}

const normalizeTimeForApi = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.length === 5) return `${trimmed}:00`
  return trimmed
}

const resetForm = () => {
  form.classroomId = filterClassroomId.value || ''
  form.academicYearId = filterYearId.value || ''
  form.semesterNo = filterSemester.value || '1'
  form.dayOfWeek = 'monday'
  form.periodNo = ''
  form.startTime = ''
  form.endTime = ''
  form.subjectId = ''
  form.teacherId = ''
  form.note = ''
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
}

const onFilterChange = () => {
  pagination.value.page = 1
}

const clearFilters = () => {
  filterClassroomId.value = ''
  filterYearId.value = ''
  filterSemester.value = ''
}

const handleView = (row: TimetableRow) => {
  navigateTo(`/admin/timetable/${row.id}`)
}

const openCreateModal = () => {
  editTarget.value = null
  resetForm()
  showModal.value = true
}

const handleEdit = (row: TimetableRow) => {
  editTarget.value = row
  form.classroomId = row.classroomId
  form.academicYearId = row.academicYearId
  form.semesterNo = String(row.semesterNo)
  form.dayOfWeek = row.dayOfWeek
  form.periodNo = String(row.periodNo)
  form.startTime = normalizeTimeForInput(row.startTime)
  form.endTime = normalizeTimeForInput(row.endTime)
  form.subjectId = row.subjectId
  form.teacherId = row.teacherId
  form.note = row.note === '-' ? '' : row.note
  showModal.value = true
}

const openDeleteModal = (row: TimetableRow) => {
  deleteTarget.value = row
  showDeleteModal.value = true
}

const fetchAll = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const [subjectsRes, teachersRes, classroomsRes, yearsRes, assignmentsRes, schedulesRes] = await Promise.all([
      apiFetch<BaseResponse<SubjectApiItem[]>>('/subjects', { params: { only_active: false } }),
      apiFetch<BaseResponse<TeacherApiItem[]>>('/teachers', { params: { only_active: false } }),
      apiFetch<BaseResponse<ClassroomApiItem[]>>('/classrooms', { params: { only_active: false } }),
      apiFetch<BaseResponse<AcademicYearApiItem[]>>('/academic-years', { params: { only_active: false } }),
      apiFetch<BaseResponse<SubjectAssignmentApiItem[]>>('/subject-assignments', { params: { only_active: false } }),
      apiFetch<BaseResponse<ScheduleApiItem[]>>('/schedules', { params: { only_active: false } })
    ])

    subjectRows.value = Array.isArray(subjectsRes?.data) ? subjectsRes.data : []
    teacherRows.value = Array.isArray(teachersRes?.data) ? teachersRes.data : []
    classroomRows.value = Array.isArray(classroomsRes?.data) ? classroomsRes.data : []
    academicYearRows.value = Array.isArray(yearsRes?.data) ? yearsRes.data : []
    assignmentRows.value = Array.isArray(assignmentsRes?.data) ? assignmentsRes.data : []
    scheduleRows.value = Array.isArray(schedulesRes?.data) ? schedulesRes.data : []

    if (!filterClassroomId.value) {
      filterClassroomId.value = classroomRows.value[0]?.id || ''
    }

    if (!filterYearId.value) {
      filterYearId.value = academicYearRows.value.find((item) => item.is_current)?.id || academicYearRows.value[0]?.id || ''
    }

    const subjectById = new Map(subjectRows.value.map((item) => [item.id, item] as const))
    const teacherById = new Map(teacherRows.value.map((item) => [item.id, item] as const))
    const classroomById = new Map(classroomRows.value.map((item) => [item.id, item] as const))
    const yearById = new Map(academicYearRows.value.map((item) => [item.id, item] as const))
    const assignmentById = new Map(assignmentRows.value.map((item) => [item.id, item] as const))

    const nextRows: TimetableRow[] = []
    for (const schedule of scheduleRows.value) {
      const assignment = assignmentById.get(schedule.subject_assignment_id)
      if (!assignment || !schedule.period_no) continue

      const subject = subjectById.get(assignment.subject_id)
      const teacher = teacherById.get(assignment.teacher_id)
      const classroom = classroomById.get(assignment.classroom_id)
      const year = yearById.get(assignment.academic_year_id)

      const teacherName = `${(teacher?.first_name || '').trim()} ${(teacher?.last_name || '').trim()}`.trim() || teacher?.teacher_code || 'ไม่ระบุชื่อครู'
      const classroomName = classroom?.name || `${classroom?.grade_level || ''} ${classroom?.room_no || ''}`.trim() || 'ไม่ระบุห้องเรียน'

      nextRows.push({
        id: schedule.id,
        subjectAssignmentId: assignment.id,
        subjectId: assignment.subject_id,
        teacherId: assignment.teacher_id,
        classroomId: assignment.classroom_id,
        academicYearId: assignment.academic_year_id,
        semesterNo: assignment.semester_no,
        dayOfWeek: schedule.day_of_week,
        dayLabel: dayMap[schedule.day_of_week] || schedule.day_of_week,
        periodNo: schedule.period_no,
        startTime: normalizeTimeForInput(schedule.start_time),
        endTime: normalizeTimeForInput(schedule.end_time),
        subjectName: subject
          ? `${(subject.subject_code || '').trim() ? `${(subject.subject_code || '').trim()} - ` : ''}${subject.name}`
          : 'ไม่ระบุรายวิชา',
        teacherName,
        classroomName,
        yearLabel: year ? `${year.year} / ${year.term}` : 'ไม่ระบุปีการศึกษา',
        note: (schedule.note || '').trim() || '-'
      })
    }

    rows.value = nextRows.sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek.localeCompare(b.dayOfWeek)
      if (a.periodNo !== b.periodNo) return a.periodNo - b.periodNo
      return a.classroomName.localeCompare(b.classroomName, 'th')
    })

    updatePagination()
  } catch {
    rows.value = []
    updatePagination()
    errorMessage.value = 'ไม่สามารถโหลดข้อมูลตารางสอนได้'
    error('ไม่สามารถโหลดข้อมูลตารางสอนได้')
  } finally {
    loading.value = false
  }
}

const validateForm = () => {
  if (!form.classroomId) {
    error('กรุณาเลือกห้องเรียน')
    return false
  }
  if (!form.academicYearId) {
    error('กรุณาเลือกปีการศึกษา')
    return false
  }
  if (!form.semesterNo) {
    error('กรุณาเลือกเทอม')
    return false
  }
  if (!form.subjectId) {
    error('กรุณาเลือกรายวิชา')
    return false
  }
  if (!form.teacherId) {
    error('กรุณาเลือกครูผู้สอน')
    return false
  }
  if (!form.dayOfWeek) {
    error('กรุณาเลือกวัน')
    return false
  }
  const period = Number.parseInt(form.periodNo, 10)
  if (!Number.isFinite(period) || period < 1) {
    error('คาบเรียนต้องมากกว่าหรือเท่ากับ 1')
    return false
  }
  if (!form.startTime || !form.endTime) {
    error('กรุณาระบุเวลาเริ่มและเวลาสิ้นสุด')
    return false
  }
  if (form.startTime >= form.endTime) {
    error('เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม')
    return false
  }
  return true
}

const findOrCreateAssignment = async () => {
  const semesterNo = Number.parseInt(form.semesterNo, 10)
  const listRes = await apiFetch<BaseResponse<SubjectAssignmentApiItem[]>>('/subject-assignments', {
    params: {
      subject_id: form.subjectId,
      teacher_id: form.teacherId,
      classroom_id: form.classroomId,
      academic_year_id: form.academicYearId,
      semester_no: semesterNo,
      only_active: true
    }
  })

  const list = Array.isArray(listRes?.data) ? listRes.data : []
  if (list[0]?.id) return list[0].id

  const created = await apiFetch<BaseResponse<SubjectAssignmentApiItem>>('/subject-assignments', {
    method: 'POST',
    body: {
      subject_id: form.subjectId,
      teacher_id: form.teacherId,
      classroom_id: form.classroomId,
      academic_year_id: form.academicYearId,
      semester_no: semesterNo,
      is_active: true
    }
  })

  const payload: any = created?.data ?? created
  return String(payload?.id || '')
}

const handleSave = async () => {
  if (!validateForm()) return

  saving.value = true
  errorMessage.value = ''
  try {
    const assignmentId = await findOrCreateAssignment()
    if (!assignmentId) {
      error('ไม่สามารถสร้างข้อมูลการมอบหมายรายวิชาได้')
      return
    }

    const payload = {
      subject_assignment_id: assignmentId,
      day_of_week: form.dayOfWeek,
      start_time: normalizeTimeForApi(form.startTime),
      end_time: normalizeTimeForApi(form.endTime),
      period_no: Number.parseInt(form.periodNo, 10),
      note: form.note.trim() || null,
      is_active: true
    }

    if (editTarget.value?.id) {
      await apiFetch(`/schedules/${editTarget.value.id}`, {
        method: 'PATCH',
        body: payload
      })
      success('แก้ไขคาบเรียนสำเร็จ')
    } else {
      await apiFetch('/schedules', {
        method: 'POST',
        body: payload
      })
      success('เพิ่มคาบเรียนสำเร็จ')
    }

    showModal.value = false
    await fetchAll()
  } catch {
    errorMessage.value = 'บันทึกคาบเรียนไม่สำเร็จ'
    error('บันทึกคาบเรียนไม่สำเร็จ')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async () => {
  if (!deleteTarget.value?.id) {
    showDeleteModal.value = false
    return
  }

  deleting.value = true
  try {
    await apiFetch(`/schedules/${deleteTarget.value.id}`, {
      method: 'DELETE'
    })
    success('ลบคาบเรียนสำเร็จ')
    showDeleteModal.value = false
    deleteTarget.value = null
    await fetchAll()
  } catch {
    errorMessage.value = 'ลบคาบเรียนไม่สำเร็จ'
    error('ลบคาบเรียนไม่สำเร็จ')
  } finally {
    deleting.value = false
  }
}

watch([filterClassroomId, filterYearId, filterSemester], () => {
  onFilterChange()
  updatePagination()
})

watch(
  () => pagination.value.limit,
  () => {
    pagination.value.page = 1
    updatePagination()
  }
)

onMounted(() => {
  fetchAll()
})
</script>
