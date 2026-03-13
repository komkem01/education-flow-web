<template>
  <NuxtLayout name="admin" page-title="จัดการห้องเรียน" page-description="จัดการข้อมูลห้องเรียนในโรงเรียน">
    <div class="mb-6 flex justify-between items-center">
      <div class="flex gap-3">
        <UIInput
          v-model="searchQuery"
          placeholder="ค้นหาห้องเรียน..."
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
        เพิ่มห้องเรียน
      </UIButton>
    </div>

    <UICard>
      <UITable
        :columns="columns"
        :data="classrooms"
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

        <template #cell-isActive="{ value }">
          <UIBadge :variant="value ? 'success' : 'secondary'">
            {{ value ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
          </UIBadge>
        </template>
      </UITable>
    </UICard>

    <UIModal
      v-model="showClassroomModal"
      :title="editMode ? 'แก้ไขข้อมูลห้องเรียน' : 'เพิ่มห้องเรียน'"
      size="lg"
      :show-default-footer="true"
      :loading="saving"
      @confirm="handleSave"
    >
      <div class="grid grid-cols-2 gap-4">
        <UIInput
          v-model="form.name"
          label="ชื่อห้องเรียน"
          placeholder="เช่น ห้อง 1"
          required
        />
        <UISelect
          v-model="form.gradeLevel"
          label="ระดับชั้น"
          :options="gradeOptions"
          required
        />
      </div>

      <div class="grid grid-cols-2 gap-4 mt-4">
        <UIInput
          v-model="form.section"
          label="กลุ่ม/แผน"
          placeholder="เช่น วิทย์-คณิต"
        />
        <UIInput
          v-model="form.capacity"
          label="ความจุ"
          type="number"
          placeholder="40"
          required
        />
      </div>

      <div class="mt-4">
        <UIInput
          v-model="form.homeRoomTeacherId"
          label="รหัสครูที่ปรึกษา"
          placeholder="กรอกรหัสครู (ถ้ามี)"
        />
      </div>
    </UIModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Classroom } from '~/types'

definePageMeta({
  layout: false,
  middleware: 'auth'
})

const { apiFetch } = useApi()
const { success, error } = useToast()
const route = useRoute()
const router = useRouter()

const classrooms = ref<Classroom[]>([])
const loading = ref(false)
const saving = ref(false)
const showClassroomModal = ref(false)
const editMode = ref(false)
const selectedClassroom = ref<Classroom | null>(null)
const searchQuery = ref('')
const filterGrade = ref('')

const columns = [
  { key: 'name', label: 'ห้องเรียน' },
  { key: 'gradeLevel', label: 'ระดับชั้น' },
  { key: 'section', label: 'กลุ่ม/แผน' },
  { key: 'currentStudents', label: 'จำนวนนักเรียน' },
  { key: 'capacity', label: 'ความจุ' },
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

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

const form = reactive({
  name: '',
  gradeLevel: '',
  section: '',
  capacity: '',
  homeRoomTeacherId: ''
})

const clearEditQuery = async () => {
  if (!('edit' in route.query)) return
  const query = { ...route.query }
  delete query.edit
  await router.replace({ path: route.path, query })
}

const resetForm = () => {
  editMode.value = false
  selectedClassroom.value = null
  form.name = ''
  form.gradeLevel = ''
  form.section = ''
  form.capacity = ''
  form.homeRoomTeacherId = ''
}

const populateFormFromClassroom = (classroom: Partial<Classroom>) => {
  form.name = classroom.name || ''
  form.gradeLevel = classroom.gradeLevel ? String(classroom.gradeLevel) : ''
  form.section = classroom.section || ''
  form.capacity = classroom.capacity ? String(classroom.capacity) : ''
  form.homeRoomTeacherId = classroom.homeRoomTeacherId || ''
}

const openCreateModal = () => {
  resetForm()
  showClassroomModal.value = true
}

const fetchClassrooms = async () => {
  loading.value = true
  try {
    const response = await apiFetch<any>('/classrooms', {
      params: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: searchQuery.value,
        gradeLevel: filterGrade.value
      }
    })
    classrooms.value = response.data || []
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
  fetchClassrooms()
}

const handleFilterChange = () => {
  pagination.value.page = 1
  fetchClassrooms()
}

const handleView = (classroom: Classroom) => {
  if (!classroom.id) return
  navigateTo(`/admin/classrooms/${classroom.id}`)
}

const handleEdit = (classroom: Classroom) => {
  editMode.value = true
  selectedClassroom.value = classroom
  populateFormFromClassroom(classroom)
  showClassroomModal.value = true
}

const handleSave = async () => {
  saving.value = true
  try {
    const payload = {
      ...form,
      capacity: Number(form.capacity || 0),
      gradeLevel: Number(form.gradeLevel || 0)
    }

    if (editMode.value && selectedClassroom.value?.id) {
      await apiFetch(`/classrooms/${selectedClassroom.value.id}`, {
        method: 'PUT',
        body: payload
      })
      success('แก้ไขข้อมูลสำเร็จ')
    } else {
      await apiFetch('/classrooms', {
        method: 'POST',
        body: payload
      })
      success('เพิ่มห้องเรียนสำเร็จ')
    }

    showClassroomModal.value = false
    resetForm()
    await fetchClassrooms()
  } catch {
    error('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
  } finally {
    saving.value = false
  }
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  fetchClassrooms()
}

const openEditFromQuery = async () => {
  const queryValue = route.query.edit
  const editId = Array.isArray(queryValue) ? queryValue[0] : queryValue
  if (!editId) return

  try {
    const response = await apiFetch<any>(`/classrooms/${editId}`)
    const classroom = response.data ?? response
    handleEdit(classroom)
  } catch {
    error('ไม่สามารถเปิดหน้าแก้ไขจากลิงก์นี้ได้')
  } finally {
    await clearEditQuery()
  }
}

onMounted(async () => {
  await fetchClassrooms()
  await openEditFromQuery()
})
</script>
