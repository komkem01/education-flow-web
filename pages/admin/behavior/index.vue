<template>
  <NuxtLayout name="admin" page-title="บันทึกพฤติกรรม" page-description="บันทึกและติดตามพฤติกรรมนักเรียนรายคน">
    <div class="space-y-5">
      <div class="flex items-center justify-between gap-3">
        <div class="summary-strip">
          <div class="summary-item summary-item--good">
            <span class="s-value">{{ goodCount }}</span>
            <span class="s-label">บันทึกดี</span>
          </div>
          <div class="summary-item summary-item--bad">
            <span class="s-value">{{ badCount }}</span>
            <span class="s-label">บันทึกโทษ</span>
          </div>
          <div class="summary-item summary-item--points">
            <span class="s-value">{{ totalPoints > 0 ? '+' : '' }}{{ totalPoints }}</span>
            <span class="s-label">คะแนนสุทธิ</span>
          </div>
        </div>

        <UIButton variant="primary" icon="lucide:plus" @click="openAdd">บันทึกพฤติกรรม</UIButton>
      </div>

      <UICard>
        <div class="filter-bar">
          <input v-model="search" class="input filter-input search-input" placeholder="ค้นหาชื่อ / รหัสนักเรียน" />
          <select v-model="filterType" class="input filter-input">
            <option value="">ทุกประเภท</option>
            <option value="good">บันทึกดี</option>
            <option value="bad">บันทึกโทษ</option>
          </select>
          <select v-model="filterClassroom" class="input filter-input">
            <option value="">ทุกห้องเรียน</option>
            <option v-for="item in classroomOptions" :key="item" :value="item">{{ item }}</option>
          </select>
          <input v-model="filterDate" type="date" class="input filter-input" />
          <UIButton
            v-if="search || filterType || filterClassroom || filterDate"
            variant="detail"
            @click="clearFilters"
          >
            ล้างตัวกรอง
          </UIButton>
        </div>
      </UICard>

      <UICard>
        <div v-if="loading" class="py-10 text-center text-secondary-500">กำลังโหลดข้อมูล...</div>

        <div v-else-if="filteredRows.length === 0" class="py-10 text-center text-secondary-500">ไม่พบข้อมูลพฤติกรรม</div>

        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[980px] border-collapse">
            <thead>
              <tr class="border-b border-secondary-200 text-left text-sm text-secondary-600">
                <th class="py-3 pr-3 font-medium">วันที่</th>
                <th class="py-3 pr-3 font-medium">รหัส</th>
                <th class="py-3 pr-3 font-medium">นักเรียน</th>
                <th class="py-3 pr-3 font-medium">ห้อง</th>
                <th class="py-3 pr-3 font-medium">ประเภท</th>
                <th class="py-3 pr-3 font-medium">หมวดหมู่</th>
                <th class="py-3 pr-3 font-medium">คะแนน</th>
                <th class="py-3 pr-3 font-medium">ผู้บันทึก</th>
                <th class="py-3 text-right font-medium">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredRows" :key="row.id" class="border-b border-secondary-100 text-sm text-secondary-800">
                <td class="py-3 pr-3">{{ formatDateTH(row.recorded_on) }}</td>
                <td class="py-3 pr-3 font-mono text-xs">{{ row.studentCode }}</td>
                <td class="py-3 pr-3">{{ row.studentName }}</td>
                <td class="py-3 pr-3">{{ row.classroom }}</td>
                <td class="py-3 pr-3">
                  <UIBadge :variant="row.behavior_type === 'good' ? 'success' : 'danger'">
                    {{ row.behavior_type === 'good' ? 'ดี' : 'โทษ' }}
                  </UIBadge>
                </td>
                <td class="py-3 pr-3">{{ row.category || '-' }}</td>
                <td class="py-3 pr-3" :class="row.points >= 0 ? 'text-success-700' : 'text-danger-700'">
                  {{ row.points > 0 ? '+' : '' }}{{ row.points }}
                </td>
                <td class="py-3 pr-3">{{ row.recordedByLabel }}</td>
                <td class="py-3">
                  <div class="action-btns">
                    <UIButton variant="detail" size="sm" @click="openView(row)">ดู</UIButton>
                    <UIButton variant="edit" size="sm" @click="openEdit(row)">แก้ไข</UIButton>
                    <UIButton variant="delete" size="sm" @click="openDelete(row)">ลบ</UIButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UICard>

      <UIModal
        v-model="showModal"
        :title="isEditing ? 'แก้ไขบันทึกพฤติกรรม' : 'บันทึกพฤติกรรม'"
        size="lg"
        :show-default-footer="false"
      >
        <div class="form-grid">
          <div class="space-y-1">
            <label class="label">รหัสนักเรียน <span class="text-danger-600">*</span></label>
            <select v-model="form.student_id" class="input" :disabled="isEditing" @change="fillStudentMeta">
              <option value="">-- เลือกนักเรียน --</option>
              <option v-for="s in studentOptions" :key="s.id" :value="s.id">{{ s.code }} - {{ s.name }}</option>
            </select>
            <p v-if="formErrors.student_id" class="error-message">{{ formErrors.student_id }}</p>
          </div>

          <div class="space-y-1">
            <label class="label">ประเภท</label>
            <select v-model="form.behavior_type" class="input" @change="form.category = ''">
              <option value="good">บันทึกดี</option>
              <option value="bad">บันทึกโทษ</option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="label">หมวดหมู่</label>
            <select v-model="form.category" class="input">
              <option value="">-- เลือกหมวดหมู่ --</option>
              <option v-for="item in (form.behavior_type === 'good' ? GOOD_CATEGORIES : BAD_CATEGORIES)" :key="item" :value="item">
                {{ item }}
              </option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="label">คะแนน</label>
            <input v-model.number="form.points" type="number" class="input" />
          </div>

          <div class="space-y-1 form-full">
            <label class="label">รายละเอียด <span class="text-danger-600">*</span></label>
            <textarea v-model="form.description" class="input form-textarea" placeholder="ระบุรายละเอียดพฤติกรรม" />
            <p v-if="formErrors.description" class="error-message">{{ formErrors.description }}</p>
          </div>

          <div class="space-y-1">
            <label class="label">วันที่</label>
            <input v-model="form.recorded_on" type="date" class="input" />
          </div>

          <div class="space-y-1">
            <label class="label">ชื่อนักเรียน</label>
            <input :value="formStudentName" class="input" readonly />
          </div>
        </div>

        <template #footer>
          <UIButton variant="detail" :disabled="submitting" @click="showModal = false">ยกเลิก</UIButton>
          <UIButton variant="primary" :loading="submitting" @click="saveBehavior">บันทึก</UIButton>
        </template>
      </UIModal>

      <UIModal
        v-model="showDeleteModal"
        title="ยืนยันการลบ?"
        size="sm"
        :show-default-footer="false"
      >
        <p class="text-sm text-secondary-700">ต้องการลบบันทึกของ {{ deleteTarget?.studentName || '-' }} ใช่หรือไม่?</p>
        <template #footer>
          <UIButton variant="detail" :disabled="submitting" @click="showDeleteModal = false">ยกเลิก</UIButton>
          <UIButton variant="danger" :loading="submitting" @click="confirmDelete">ลบ</UIButton>
        </template>
      </UIModal>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: false, middleware: 'auth' })

type BaseResponse<T> = { data: T }

type StudentApiItem = {
  id: string
  student_code?: string | null
  first_name?: string | null
  last_name?: string | null
  current_classroom_id?: string | null
  classroom_id?: string | null
}

type ClassroomApiItem = {
  id: string
  name: string
}

type BehaviorApiItem = {
  id: string
  school_id: string
  student_id: string
  recorded_by_member_id: string
  behavior_type: 'good' | 'bad'
  category: string | null
  description: string | null
  points: number
  recorded_on: string
  is_active: boolean
}

type StudentOption = {
  id: string
  code: string
  name: string
  classroom: string
}

type BehaviorViewRow = BehaviorApiItem & {
  studentCode: string
  studentName: string
  classroom: string
  recordedByLabel: string
}

const GOOD_CATEGORIES = ['ช่วยเหลือผู้อื่น', 'มีจิตอาสา', 'เรียนดีเด่น', 'กีฬาเด่น', 'รักษาความสะอาด', 'ประพฤติดีเด่น']
const BAD_CATEGORIES = ['ทะเลาะวิวาท', 'แต่งกายผิดระเบียบ', 'หนีเรียน', 'ใช้โทรศัพท์ในห้องเรียน', 'ทำลายทรัพย์สิน', 'มาสาย']

const { apiFetch } = useApi()
const authStore = useAuthStore()
const { success, error } = useToast()

const loading = ref(false)
const submitting = ref(false)

const rows = ref<BehaviorViewRow[]>([])
const studentOptions = ref<StudentOption[]>([])
const studentsById = ref<Record<string, StudentOption>>({})

const search = ref('')
const filterType = ref('')
const filterClassroom = ref('')
const filterDate = ref('')

const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const editTargetId = ref('')
const deleteTarget = ref<BehaviorViewRow | null>(null)

const form = ref({
  student_id: '',
  behavior_type: 'good' as 'good' | 'bad',
  category: '',
  description: '',
  points: 1,
  recorded_on: new Date().toISOString().slice(0, 10)
})

const formErrors = ref({ student_id: '', description: '' })

const classroomOptions = computed(() => {
  return [...new Set(rows.value.map((r) => r.classroom).filter(Boolean))].sort()
})

const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase()
  return rows.value.filter((r) => {
    if (q) {
      const studentMatch = r.studentName.toLowerCase().includes(q)
      const codeMatch = r.studentCode.toLowerCase().includes(q)
      if (!studentMatch && !codeMatch) return false
    }
    if (filterType.value && r.behavior_type !== filterType.value) return false
    if (filterClassroom.value && r.classroom !== filterClassroom.value) return false
    if (filterDate.value && r.recorded_on !== filterDate.value) return false
    return true
  })
})

const goodCount = computed(() => filteredRows.value.filter((r) => r.behavior_type === 'good').length)
const badCount = computed(() => filteredRows.value.filter((r) => r.behavior_type === 'bad').length)
const totalPoints = computed(() => filteredRows.value.reduce((sum, item) => sum + item.points, 0))

const formStudentName = computed(() => {
  const picked = studentsById.value[form.value.student_id]
  return picked?.name || ''
})

function clearFilters() {
  search.value = ''
  filterType.value = ''
  filterClassroom.value = ''
  filterDate.value = ''
}

function formatDateTH(value: string) {
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return value
  return dt.toLocaleDateString('th-TH')
}

function resolveRecorderName(memberId: string) {
  if (memberId === authStore.user?.id) {
    return authStore.user?.fullName || authStore.user?.email || 'ผู้ใช้งานระบบ'
  }
  return memberId.slice(0, 8)
}

function mapDataList<T>(value: unknown): T[] {
  const payload: any = (value as any)?.data ?? value
  if (Array.isArray(payload)) return payload as T[]
  if (Array.isArray(payload?.items)) return payload.items as T[]
  return []
}

function mapBehaviorRow(item: BehaviorApiItem): BehaviorViewRow {
  const student = studentsById.value[item.student_id]
  return {
    ...item,
    studentCode: student?.code || item.student_id.slice(0, 8),
    studentName: student?.name || 'ไม่พบข้อมูลนักเรียน',
    classroom: student?.classroom || '-',
    recordedByLabel: resolveRecorderName(item.recorded_by_member_id)
  }
}

async function loadStudentOptions() {
  const schoolId = authStore.user?.schoolId
  if (!schoolId) return

  const [studentsRes, classroomsRes] = await Promise.all([
    apiFetch<BaseResponse<StudentApiItem[]>>('/students', { params: { only_active: true } }),
    apiFetch<BaseResponse<ClassroomApiItem[]>>('/classrooms', { params: { school_id: schoolId } })
  ])

  const classroomMap: Record<string, string> = {}
  for (const item of mapDataList<ClassroomApiItem>(classroomsRes)) {
    classroomMap[item.id] = item.name
  }

  const mapped = mapDataList<StudentApiItem>(studentsRes).map((item) => {
    const first = (item.first_name || '').trim()
    const last = (item.last_name || '').trim()
    const fullName = `${first} ${last}`.trim() || 'ไม่ระบุชื่อ'
    const code = (item.student_code || '').trim() || item.id.slice(0, 8)
    const classroomId = item.current_classroom_id || item.classroom_id || ''
    const classroom = classroomMap[classroomId] || '-'
    return {
      id: item.id,
      code,
      name: fullName,
      classroom
    }
  })

  studentOptions.value = mapped
  studentsById.value = Object.fromEntries(mapped.map((item) => [item.id, item]))
}

async function loadRows() {
  const schoolId = authStore.user?.schoolId
  if (!schoolId) {
    rows.value = []
    return
  }

  const res = await apiFetch<BaseResponse<BehaviorApiItem[]>>('/back-office/student-behaviors', {
    params: {
      school_id: schoolId,
      only_active: true
    }
  })

  rows.value = mapDataList<BehaviorApiItem>(res).map(mapBehaviorRow)
}

async function fetchAll() {
  loading.value = true
  try {
    await loadStudentOptions()
    await loadRows()
  } catch {
    error('ไม่สามารถโหลดข้อมูลพฤติกรรมได้')
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = {
    student_id: '',
    behavior_type: 'good',
    category: '',
    description: '',
    points: 1,
    recorded_on: new Date().toISOString().slice(0, 10)
  }
  formErrors.value = { student_id: '', description: '' }
}

function fillStudentMeta() {
  formErrors.value.student_id = ''
}

function validateForm() {
  formErrors.value = { student_id: '', description: '' }

  if (!form.value.student_id) {
    formErrors.value.student_id = 'กรุณาเลือกนักเรียน'
  }
  if (!form.value.description.trim()) {
    formErrors.value.description = 'กรุณาระบุรายละเอียด'
  }

  return !formErrors.value.student_id && !formErrors.value.description
}

function openAdd() {
  isEditing.value = false
  editTargetId.value = ''
  resetForm()
  showModal.value = true
}

function openView(row: BehaviorViewRow) {
  navigateTo(`/admin/behavior/${row.id}`)
}

function openEdit(row: BehaviorViewRow) {
  isEditing.value = true
  editTargetId.value = row.id
  form.value = {
    student_id: row.student_id,
    behavior_type: row.behavior_type,
    category: row.category || '',
    description: row.description || '',
    points: row.points,
    recorded_on: row.recorded_on
  }
  formErrors.value = { student_id: '', description: '' }
  showModal.value = true
}

async function saveBehavior() {
  if (!validateForm()) return
  const schoolId = authStore.user?.schoolId
  if (!schoolId) {
    error('ไม่พบ school_id ของผู้ใช้งาน')
    return
  }

  const payload = {
    school_id: schoolId,
    student_id: form.value.student_id,
    behavior_type: form.value.behavior_type,
    category: form.value.category.trim() || null,
    description: form.value.description.trim(),
    points: Number.isFinite(form.value.points) ? form.value.points : 0,
    recorded_on: form.value.recorded_on,
    is_active: true
  }

  submitting.value = true
  try {
    if (isEditing.value && editTargetId.value) {
      const res = await apiFetch<BaseResponse<BehaviorApiItem>>(`/back-office/student-behaviors/${editTargetId.value}`, {
        method: 'PATCH',
        body: payload
      })
      const next = ((res as any)?.data ?? res) as BehaviorApiItem
      const idx = rows.value.findIndex((item) => item.id === editTargetId.value)
      if (idx !== -1) {
        rows.value[idx] = mapBehaviorRow(next)
      }
      success('แก้ไขบันทึกพฤติกรรมเรียบร้อย')
    } else {
      const res = await apiFetch<BaseResponse<BehaviorApiItem>>('/back-office/student-behaviors', {
        method: 'POST',
        body: payload
      })
      const next = ((res as any)?.data ?? res) as BehaviorApiItem
      rows.value.unshift(mapBehaviorRow(next))
      success('บันทึกพฤติกรรมเรียบร้อย')
    }

    showModal.value = false
  } catch {
    error('ไม่สามารถบันทึกข้อมูลพฤติกรรมได้')
  } finally {
    submitting.value = false
  }
}

function openDelete(row: BehaviorViewRow) {
  deleteTarget.value = row
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return

  submitting.value = true
  try {
    await apiFetch(`/back-office/student-behaviors/${deleteTarget.value.id}`, {
      method: 'DELETE'
    })
    rows.value = rows.value.filter((item) => item.id !== deleteTarget.value?.id)
    showDeleteModal.value = false
    deleteTarget.value = null
    success('ลบบันทึกพฤติกรรมเรียบร้อย')
  } catch {
    error('ไม่สามารถลบบันทึกพฤติกรรมได้')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await authStore.restoreSession()
  await fetchAll()
})
</script>

<style scoped>
.summary-strip {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.summary-item {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  min-width: 118px;
}

.summary-item--good {
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.summary-item--bad {
  border-color: #fecaca;
  background: #fef2f2;
}

.summary-item--points {
  border-color: #bfdbfe;
  background: #eff6ff;
}

.s-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

.s-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.filter-bar {
  display: grid;
  grid-template-columns: 2fr repeat(3, minmax(140px, 1fr)) auto;
  gap: 10px;
}

.search-input {
  min-width: 220px;
}

.filter-input {
  width: 100%;
}

.action-btns {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  flex-wrap: nowrap;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-full {
  grid-column: 1 / -1;
}

.form-textarea {
  min-height: 96px;
  resize: vertical;
}

@media (max-width: 1024px) {
  .filter-bar {
    grid-template-columns: 1fr 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
