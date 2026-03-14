<template>
  <NuxtLayout name="admin" page-title="ฝ่ายงาน" page-description="จัดการข้อมูลฝ่ายงานทั้งหมดในโรงเรียน">
    <div class="space-y-5">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p v-if="errorMessage" class="text-sm text-danger-600">{{ errorMessage }}</p>
        </div>
        <UIButton variant="primary" icon="lucide:plus" @click="openAdd">เพิ่มฝ่ายงาน</UIButton>
      </div>

      <UICard>
        <div class="filter-bar">
          <select v-model="filterDepartmentId" class="input filter-select">
            <option value="">ทุกฝ่ายงาน</option>
            <option v-for="row in rows" :key="row.id" :value="row.id">{{ row.name }}</option>
          </select>
          <select v-model="filterHead" class="input filter-select">
            <option value="">ทุกหัวหน้าฝ่าย</option>
            <option v-for="opt in headOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <UIButton
            v-if="filterDepartmentId || filterHead"
            variant="detail"
            class="shrink-0 whitespace-nowrap"
            @click="clearFilters"
          >
            ล้างตัวกรอง
          </UIButton>
        </div>
      </UICard>

      <UICard>
        <div v-if="loadingState" class="py-10 text-center text-secondary-500">กำลังโหลดข้อมูล...</div>
        <div v-else-if="filteredRows.length === 0" class="py-10 text-center text-secondary-500">ไม่พบข้อมูลฝ่ายงาน</div>

        <div v-else class="overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead>
              <tr class="border-b border-secondary-200 text-left text-secondary-600">
                <th class="py-3 pr-3 font-medium">รหัส</th>
                <th class="py-3 pr-3 font-medium">ชื่อฝ่ายงาน</th>
                <th class="py-3 pr-3 font-medium">หัวหน้าฝ่าย</th>
                <th class="py-3 pr-3 font-medium">คำอธิบาย</th>
                <th class="py-3 text-right font-medium">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredRows" :key="row.id" class="border-b border-secondary-100 text-secondary-800">
                <td class="py-3 pr-3">{{ row.code }}</td>
                <td class="py-3 pr-3 font-medium">{{ row.name }}</td>
                <td class="py-3 pr-3">{{ row.head || '-' }}</td>
                <td class="py-3 pr-3">{{ row.description || '-' }}</td>
                <td class="py-3">
                  <div class="action-btns">
                    <UIButton variant="detail" size="sm" icon="lucide:eye" class="action-btn" @click="openDetail(row)">รายละเอียด</UIButton>
                    <UIButton variant="edit" size="sm" icon="lucide:pencil" class="action-btn" @click="openEdit(row)">แก้ไข</UIButton>
                    <UIButton variant="delete" size="sm" icon="lucide:trash-2" class="action-btn" @click="openDelete(row)">ลบ</UIButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UICard>

      <UIModal
        v-model="showModal"
        :title="isEditing ? 'แก้ไขฝ่ายงาน' : 'เพิ่มฝ่ายงาน'"
        size="md"
        :show-default-footer="false"
      >
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">ชื่อฝ่ายงาน <span class="req">*</span></label>
            <input v-model="form.name" class="input" placeholder="เช่น ฝ่ายวิชาการ" />
            <span v-if="formErrors.name" class="field-error">{{ formErrors.name }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">รหัสฝ่าย <span class="req">*</span></label>
            <input v-model="form.code" class="input" placeholder="เช่น ACAD" />
            <span v-if="formErrors.code" class="field-error">{{ formErrors.code }}</span>
          </div>
          <div class="form-group form-group--full">
            <label class="form-label">หัวหน้าฝ่าย (เฉพาะครู/บุคลากร)</label>
            <select v-model="form.head" class="input">
              <option value="">-- เลือกหัวหน้าฝ่าย --</option>
              <option v-for="opt in headOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div class="form-group form-group--full">
            <label class="form-label">คำอธิบาย</label>
            <textarea v-model="form.description" class="input form-textarea" placeholder="อธิบายหน้าที่ความรับผิดชอบ" />
          </div>
        </div>
        <template #footer>
          <UIButton variant="detail" :disabled="submitting" @click="showModal = false">ยกเลิก</UIButton>
          <UIButton variant="primary" :loading="submitting" @click="saveRow">บันทึก</UIButton>
        </template>
      </UIModal>

      <UIModal
        v-model="showConfirm"
        title="ยืนยันการลบ?"
        size="sm"
        :show-default-footer="false"
      >
        <p class="text-sm text-secondary-700">ต้องการลบฝ่ายงาน {{ deleteTarget?.name || '-' }} ใช่หรือไม่?</p>
        <template #footer>
          <UIButton variant="detail" :disabled="submitting" @click="showConfirm = false">ยกเลิก</UIButton>
          <UIButton variant="danger" :loading="submitting" @click="confirmDelete">ลบ</UIButton>
        </template>
      </UIModal>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type BaseResponse<T> = { data: T }

type DepartmentApiItem = {
  id: string
  school_id: string
  code: string
  name: string
  head: string | null
  description: string | null
  is_active: boolean
}

type PersonApiItem = {
  id: string
  first_name: string | null
  last_name: string | null
}

type DepartmentRow = {
  id: string
  name: string
  code: string
  head: string
  description: string
}

type Option = {
  value: string
  label: string
}

definePageMeta({ layout: false, middleware: 'auth' })

const { apiFetch } = useApi()
const authStore = useAuthStore()

const rows = ref<DepartmentRow[]>([])
const headOptions = ref<Option[]>([])
const loadingState = ref(false)
const submitting = ref(false)
const errorMessage = ref('')

function displayName(item: PersonApiItem) {
  const first = (item.first_name || '').trim()
  const last = (item.last_name || '').trim()
  return `${first} ${last}`.trim()
}

function mapRow(item: DepartmentApiItem): DepartmentRow {
  return {
    id: item.id,
    code: item.code,
    name: item.name,
    head: (item.head || '').trim(),
    description: (item.description || '').trim()
  }
}

async function loadRows() {
  const schoolId = authStore.user?.schoolId
  if (!schoolId) return
  try {
    const res = await apiFetch<BaseResponse<DepartmentApiItem[]>>('/back-office/departments', {
      params: { school_id: schoolId, only_active: false }
    })
    const payload: any = (res as any)?.data ?? res
    rows.value = (Array.isArray(payload) ? payload : []).map(mapRow)
  } catch {
    rows.value = []
  }
}

async function loadHeadOptions() {
  try {
    const [staffsRes, teachersRes] = await Promise.all([
      apiFetch<BaseResponse<PersonApiItem[]>>('/back-office/staffs', { params: { only_active: true } }),
      apiFetch<BaseResponse<PersonApiItem[]>>('/back-office/teachers', { params: { only_active: true } })
    ])

    const staffs: any = (staffsRes as any)?.data ?? staffsRes
    const teachers: any = (teachersRes as any)?.data ?? teachersRes
    const merged = [...(Array.isArray(staffs) ? staffs : []), ...(Array.isArray(teachers) ? teachers : [])]

    const seen = new Set<string>()
    const options: Option[] = []
    for (const item of merged) {
      const name = displayName(item)
      if (!name || seen.has(name)) continue
      seen.add(name)
      options.push({ value: name, label: name })
    }
    headOptions.value = options.sort((a, b) => a.label.localeCompare(b.label, 'th'))
  } catch {
    headOptions.value = []
  }
}

if (import.meta.client) {
  onMounted(async () => {
    loadingState.value = true
    try {
      await authStore.restoreSession()
      await Promise.all([loadRows(), loadHeadOptions()])
    } finally {
      loadingState.value = false
    }
  })
}

const filterDepartmentId = ref('')
const filterHead = ref('')

function clearFilters() {
  filterDepartmentId.value = ''
  filterHead.value = ''
}

const filteredRows = computed(() => {
  return rows.value.filter((row) => {
    if (filterDepartmentId.value && row.id !== filterDepartmentId.value) return false
    if (filterHead.value && row.head !== filterHead.value) return false
    return true
  })
})

const showModal = ref(false)
const isEditing = ref(false)
let editTarget: DepartmentRow | null = null

const emptyForm = (): DepartmentRow => ({ id: '', name: '', code: '', head: '', description: '' })
const form = ref<DepartmentRow>(emptyForm())
const formErrors = ref({ name: '', code: '' })

function validate() {
  formErrors.value = { name: '', code: '' }
  let ok = true
  if (!form.value.name.trim()) {
    formErrors.value.name = 'กรุณาระบุชื่อฝ่ายงาน'
    ok = false
  }
  if (!form.value.code.trim()) {
    formErrors.value.code = 'กรุณาระบุรหัสฝ่าย'
    ok = false
  }
  return ok
}

function openAdd() {
  isEditing.value = false
  editTarget = null
  form.value = emptyForm()
  formErrors.value = { name: '', code: '' }
  showModal.value = true
}

function openEdit(row: DepartmentRow) {
  isEditing.value = true
  editTarget = row
  form.value = { ...row }
  formErrors.value = { name: '', code: '' }
  showModal.value = true
}

function openDetail(row: DepartmentRow) {
  navigateTo(`/admin/departments/${row.id}`)
}

async function saveRow() {
  if (!validate()) return
  const schoolId = authStore.user?.schoolId
  if (!schoolId) return

  const payload = {
    school_id: schoolId,
    code: form.value.code.trim(),
    name: form.value.name.trim(),
    head: form.value.head.trim() || null,
    description: form.value.description.trim() || null,
    is_active: true
  }

  submitting.value = true
  try {
    if (isEditing.value && editTarget) {
      const res = await apiFetch<BaseResponse<DepartmentApiItem>>(`/back-office/departments/${editTarget.id}`, {
        method: 'PATCH',
        body: payload
      })
      const payloadData: any = (res as any)?.data ?? res
      const idx = rows.value.findIndex((item) => item.id === editTarget!.id)
      if (idx !== -1) rows.value[idx] = mapRow(payloadData)
    } else {
      const res = await apiFetch<BaseResponse<DepartmentApiItem>>('/back-office/departments', {
        method: 'POST',
        body: payload
      })
      const payloadData: any = (res as any)?.data ?? res
      rows.value.push(mapRow(payloadData))
    }
    showModal.value = false
  } catch {
    formErrors.value.code = formErrors.value.code || 'บันทึกข้อมูลไม่สำเร็จ'
  } finally {
    submitting.value = false
  }
}

const showConfirm = ref(false)
const deleteTarget = ref<DepartmentRow | null>(null)

function openDelete(row: DepartmentRow) {
  deleteTarget.value = row
  showConfirm.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) {
    showConfirm.value = false
    return
  }

  submitting.value = true
  try {
    await apiFetch(`/back-office/departments/${deleteTarget.value.id}`, { method: 'DELETE' })
    rows.value = rows.value.filter((r) => r.id !== deleteTarget.value!.id)
    deleteTarget.value = null
  } catch {
    errorMessage.value = 'ลบข้อมูลไม่สำเร็จ'
  } finally {
    submitting.value = false
    showConfirm.value = false
  }
}
</script>

<style scoped>
.filter-bar {
  display: flex;
  gap: 10px;
  flex-wrap: nowrap;
  align-items: center;
  overflow-x: auto;
}

.filter-select {
  min-width: 220px;
}

.action-btns {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  flex-wrap: nowrap;
}

.action-btn {
  white-space: nowrap;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group--full {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
}

.req {
  color: #ef4444;
}

.form-textarea {
  min-height: 72px;
  resize: vertical;
}

.field-error {
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 2px;
}
</style>
