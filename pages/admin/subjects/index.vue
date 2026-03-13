<template>
  <NuxtLayout name="admin" page-title="จัดการรายวิชา" page-description="จัดการข้อมูลรายวิชาในโรงเรียน">
    <div class="mb-6 flex justify-between items-center">
      <div class="flex gap-3">
        <UIInput
          v-model="searchQuery"
          placeholder="ค้นหารายวิชา..."
          @input="handleSearch"
        />
        <UISelect
          v-model="filterGrade"
          :options="gradeOptions"
          placeholder="ระดับชั้น"
          @update:model-value="handleFilterChange"
        />
      </div>
      <UIButton variant="primary" icon="lucide:plus" @click="openCreateModal">
        เพิ่มรายวิชา
      </UIButton>
    </div>

    <UICard>
      <UITable
        :columns="columns"
        :data="subjects"
        :loading="loading"
        :actions="{ view: true, edit: true, delete: false }"
        :pagination="pagination"
        @view="handleView"
        @edit="handleEdit"
        @page-change="handlePageChange"
      >
        <template #cell-gradeLevel="{ value }">
          <UIBadge variant="primary">ม.{{ value }}</UIBadge>
        </template>

        <template #cell-isRequired="{ value }">
          <UIBadge :variant="value ? 'warning' : 'secondary'">
            {{ value ? 'วิชาบังคับ' : 'วิชาเลือก' }}
          </UIBadge>
        </template>

        <template #cell-isActive="{ value }">
          <UIBadge :variant="value ? 'success' : 'secondary'">
            {{ value ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
          </UIBadge>
        </template>
      </UITable>
    </UICard>

    <UIModal
      v-model="showSubjectModal"
      :title="editMode ? 'แก้ไขข้อมูลรายวิชา' : 'เพิ่มรายวิชา'"
      size="lg"
      :show-default-footer="true"
      :loading="saving"
      @confirm="handleSave"
    >
      <div class="grid grid-cols-2 gap-4">
        <UIInput
          v-model="form.code"
          label="รหัสรายวิชา"
          placeholder="เช่น MATH101"
          required
          :disabled="editMode"
        />
        <UIInput
          v-model="form.name"
          label="ชื่อรายวิชา"
          placeholder="เช่น คณิตศาสตร์พื้นฐาน"
          required
        />
      </div>

      <div class="grid grid-cols-2 gap-4 mt-4">
        <UIInput
          v-model="form.nameEn"
          label="ชื่อภาษาอังกฤษ"
          placeholder="Mathematics"
        />
        <UISelect
          v-model="form.gradeLevel"
          label="ระดับชั้น"
          :options="gradeOptionsNoAll"
          required
        />
      </div>

      <div class="grid grid-cols-2 gap-4 mt-4">
        <UIInput
          v-model="form.credits"
          label="หน่วยกิต"
          type="number"
          placeholder="1"
          required
        />
        <UIInput
          v-model="form.description"
          label="คำอธิบาย"
          placeholder="คำอธิบายรายวิชา"
        />
      </div>

      <div class="mt-4">
        <label class="flex items-center">
          <input
            v-model="form.isRequired"
            type="checkbox"
            class="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
          />
          <span class="ml-2 text-sm text-secondary-700">เป็นรายวิชาบังคับ</span>
        </label>
      </div>
    </UIModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Subject } from '~/types'

definePageMeta({
  layout: false,
  middleware: 'auth'
})

const { apiFetch } = useApi()
const { success, error } = useToast()
const route = useRoute()
const router = useRouter()

const subjects = ref<Subject[]>([])
const loading = ref(false)
const saving = ref(false)
const showSubjectModal = ref(false)
const editMode = ref(false)
const selectedSubject = ref<Subject | null>(null)
const searchQuery = ref('')
const filterGrade = ref('')

const columns = [
  { key: 'code', label: 'รหัส' },
  { key: 'name', label: 'รายวิชา' },
  { key: 'gradeLevel', label: 'ระดับชั้น' },
  { key: 'credits', label: 'หน่วยกิต' },
  { key: 'isRequired', label: 'ประเภท' },
  { key: 'isActive', label: 'สถานะ' }
]

const gradeOptions = [
  { label: 'ทั้งหมด', value: '' },
  { label: 'ม.1', value: '1' },
  { label: 'ม.2', value: '2' },
  { label: 'ม.3', value: '3' },
  { label: 'ม.4', value: '4' },
  { label: 'ม.5', value: '5' },
  { label: 'ม.6', value: '6' }
]

const gradeOptionsNoAll = gradeOptions.filter(option => option.value !== '')

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

const form = reactive({
  code: '',
  name: '',
  nameEn: '',
  description: '',
  credits: '',
  gradeLevel: '',
  isRequired: false
})

const clearEditQuery = async () => {
  if (!('edit' in route.query)) return
  const query = { ...route.query }
  delete query.edit
  await router.replace({ path: route.path, query })
}

const resetForm = () => {
  editMode.value = false
  selectedSubject.value = null
  form.code = ''
  form.name = ''
  form.nameEn = ''
  form.description = ''
  form.credits = ''
  form.gradeLevel = ''
  form.isRequired = false
}

const populateFormFromSubject = (subject: Partial<Subject>) => {
  form.code = subject.code || ''
  form.name = subject.name || ''
  form.nameEn = subject.nameEn || ''
  form.description = subject.description || ''
  form.credits = subject.credits ? String(subject.credits) : ''
  form.gradeLevel = subject.gradeLevel ? String(subject.gradeLevel) : ''
  form.isRequired = Boolean(subject.isRequired)
}

const openCreateModal = () => {
  resetForm()
  showSubjectModal.value = true
}

const fetchSubjects = async () => {
  loading.value = true
  try {
    const response = await apiFetch<any>('/subjects', {
      params: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: searchQuery.value,
        gradeLevel: filterGrade.value
      }
    })
    subjects.value = response.data || []
    pagination.value.total = response.total || 0
    pagination.value.totalPages = response.totalPages || 0
  } catch {
    error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.page = 1
  fetchSubjects()
}

const handleFilterChange = () => {
  pagination.value.page = 1
  fetchSubjects()
}

const handleView = (subject: Subject) => {
  if (!subject.id) return
  navigateTo(`/admin/subjects/${subject.id}`)
}

const handleEdit = (subject: Subject) => {
  editMode.value = true
  selectedSubject.value = subject
  populateFormFromSubject(subject)
  showSubjectModal.value = true
}

const handleSave = async () => {
  saving.value = true
  try {
    const payload = {
      ...form,
      credits: Number(form.credits || 0),
      gradeLevel: Number(form.gradeLevel || 0)
    }

    if (editMode.value && selectedSubject.value?.id) {
      await apiFetch(`/subjects/${selectedSubject.value.id}`, {
        method: 'PUT',
        body: payload
      })
      success('แก้ไขข้อมูลสำเร็จ')
    } else {
      await apiFetch('/subjects', {
        method: 'POST',
        body: payload
      })
      success('เพิ่มรายวิชาสำเร็จ')
    }

    showSubjectModal.value = false
    resetForm()
    await fetchSubjects()
  } catch {
    error('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
  } finally {
    saving.value = false
  }
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  fetchSubjects()
}

const openEditFromQuery = async () => {
  const queryValue = route.query.edit
  const editId = Array.isArray(queryValue) ? queryValue[0] : queryValue
  if (!editId) return

  try {
    const response = await apiFetch<any>(`/subjects/${editId}`)
    const subject = response.data ?? response
    handleEdit(subject)
  } catch {
    error('ไม่สามารถเปิดหน้าแก้ไขจากลิงก์นี้ได้')
  } finally {
    await clearEditQuery()
  }
}

onMounted(async () => {
  await fetchSubjects()
  await openEditFromQuery()
})
</script>
