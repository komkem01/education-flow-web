<template>
  <NuxtLayout name="admin" page-title="ห้องเรียน" page-description="จัดการข้อมูลห้องเรียนทั้งหมดในโรงเรียน">
    <div class="mb-6 flex items-center justify-between gap-3">
      <div class="flex-1 text-sm text-secondary-600">ทั้งหมด {{ pagination.total }} รายการ</div>
      <div class="flex items-center gap-2">
        <UIButton variant="secondary" icon="lucide:refresh-cw" @click="fetchAll">รีเฟรช</UIButton>
        <UIButton variant="primary" icon="lucide:plus" @click="openCreateModal">เพิ่มห้องเรียน</UIButton>
      </div>
    </div>

    <UICard v-if="errorMessage" class="mb-4">
      <p class="text-sm text-danger-600">{{ errorMessage }}</p>
    </UICard>

    <UICard class="mb-4">
      <div class="flex flex-nowrap items-center gap-2 overflow-x-auto">
        <select v-model="filterClassroomId" class="input min-w-[220px]" @change="onFilterChange">
          <option value="">ทุกห้องเรียน</option>
          <option v-for="item in rows" :key="item.id" :value="item.id">{{ item.name }}</option>
        </select>
        <select v-model="filterGrade" class="input min-w-[220px]" @change="onFilterChange">
          <option value="">ทุกระดับชั้น</option>
          <option v-for="grade in gradeOptions" :key="grade" :value="grade">{{ grade }}</option>
        </select>
        <UIButton
          v-if="filterClassroomId || filterGrade"
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
      :title="editTarget ? 'แก้ไขห้องเรียน' : 'เพิ่มห้องเรียน'"
      size="lg"
      :show-default-footer="true"
      :loading="saving"
      @confirm="handleSave"
    >
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <UIInput v-model="form.name" label="ชื่อห้องเรียน" placeholder="เช่น ม.1/1" required />
        <UISelect
          v-model="form.gradeLevel"
          label="ระดับชั้น"
          :options="gradeSelectOptions"
          placeholder="เลือกระดับชั้น"
        />
        <UIInput v-model="form.roomNo" class="md:col-span-2" label="ห้องที่ใช้เรียน" placeholder="เช่น อาคาร 1 ห้อง 101" />
        <UISelect
          v-model="form.advisorTeacherId"
          class="md:col-span-2"
          label="ครูประจำชั้น"
          :options="teacherOptions"
          placeholder="เลือกครูประจำชั้น"
        />
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
        ต้องการลบห้องเรียน
        <span class="font-semibold text-secondary-900">{{ deleteTarget?.name }}</span>
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
const authStore = useAuthStore()

type BaseResponse<T> = { data: T }

type ClassroomApiItem = {
  id: string
  school_id: string
  name: string
  grade_level: string | null
  room_no: string | null
  advisor_teacher_id: string | null
}

type TeacherApiItem = {
  id: string
  teacher_code: string | null
  first_name: string | null
  last_name: string | null
}

type ClassroomRow = {
  id: string
  schoolId: string
  name: string
  gradeLevel: string
  roomNo: string
  advisorTeacherId: string
  advisorTeacherName: string
}

type Option = {
  value: string
  label: string
}

const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const errorMessage = ref('')

const rows = ref<ClassroomRow[]>([])
const teacherRows = ref<TeacherApiItem[]>([])

const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 1 })

const columns = [
  { key: 'name', label: 'ชื่อห้องเรียน' },
  { key: 'gradeLevel', label: 'ระดับชั้น' },
  { key: 'roomNo', label: 'ห้องที่ใช้เรียน' },
  { key: 'advisorTeacherName', label: 'ครูประจำชั้น' }
]

const gradeOptions = ['ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6']

const gradeSelectOptions = computed<Option[]>(() =>
  gradeOptions.map((item) => ({ value: item, label: item }))
)

const teacherOptions = computed<Option[]>(() =>
  teacherRows.value
    .map((item) => {
      const first = (item.first_name || '').trim()
      const last = (item.last_name || '').trim()
      const fullName = `${first} ${last}`.trim()
      return {
        value: item.id,
        label: fullName || item.teacher_code || 'ไม่ระบุชื่อครู'
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'th'))
)

const filterClassroomId = ref('')
const filterGrade = ref('')

const showModal = ref(false)
const editTarget = ref<ClassroomRow | null>(null)

const showDeleteModal = ref(false)
const deleteTarget = ref<ClassroomRow | null>(null)

const form = reactive({
  name: '',
  gradeLevel: '',
  roomNo: '',
  advisorTeacherId: ''
})

const filteredRows = computed(() => {
  return rows.value.filter((row) => {
    if (filterClassroomId.value && row.id !== filterClassroomId.value) return false
    if (filterGrade.value && row.gradeLevel !== filterGrade.value) return false
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

const onFilterChange = () => {
  pagination.value.page = 1
}

const clearFilters = () => {
  filterClassroomId.value = ''
  filterGrade.value = ''
}

const resetForm = () => {
  form.name = ''
  form.gradeLevel = ''
  form.roomNo = ''
  form.advisorTeacherId = ''
}

const openCreateModal = () => {
  editTarget.value = null
  resetForm()
  showModal.value = true
}

const handleEdit = (row: ClassroomRow) => {
  editTarget.value = row
  form.name = row.name
  form.gradeLevel = row.gradeLevel
  form.roomNo = row.roomNo === '-' ? '' : row.roomNo
  form.advisorTeacherId = row.advisorTeacherId
  showModal.value = true
}

const openDeleteModal = (row: ClassroomRow) => {
  deleteTarget.value = row
  showDeleteModal.value = true
}

const handleView = (row: ClassroomRow) => {
  navigateTo(`/admin/classrooms/${row.id}`)
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
}

const fetchAll = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const [classroomsRes, teachersRes] = await Promise.all([
      apiFetch<BaseResponse<ClassroomApiItem[]>>('/classrooms'),
      apiFetch<BaseResponse<TeacherApiItem[]>>('/teachers', { params: { only_active: false } })
    ])

    const classroomList = Array.isArray(classroomsRes?.data) ? classroomsRes.data : []
    teacherRows.value = Array.isArray(teachersRes?.data) ? teachersRes.data : []

    const teacherById = new Map(teacherOptions.value.map((item) => [item.value, item.label] as const))

    rows.value = classroomList
      .map((item) => ({
        id: item.id,
        schoolId: item.school_id,
        name: (item.name || '').trim(),
        gradeLevel: (item.grade_level || '').trim() || '-',
        roomNo: (item.room_no || '').trim() || '-',
        advisorTeacherId: (item.advisor_teacher_id || '').trim(),
        advisorTeacherName: teacherById.get((item.advisor_teacher_id || '').trim()) || '-'
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'th'))

    updatePagination()
  } catch {
    rows.value = []
    updatePagination()
    errorMessage.value = 'ไม่สามารถโหลดข้อมูลห้องเรียนได้'
    error('ไม่สามารถโหลดข้อมูลห้องเรียนได้')
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  const name = form.name.trim()
  const schoolId = String(authStore.user?.schoolId || '').trim()

  if (!name) {
    error('กรุณากรอกชื่อห้องเรียน')
    return
  }

  if (!schoolId) {
    error('ไม่พบ school id ของผู้ใช้งาน')
    return
  }

  saving.value = true
  try {
    const payload = {
      school_id: schoolId,
      name,
      grade_level: form.gradeLevel || null,
      room_no: form.roomNo.trim() || null,
      advisor_teacher_id: form.advisorTeacherId || null
    }

    if (editTarget.value?.id) {
      await apiFetch(`/classrooms/${editTarget.value.id}`, {
        method: 'PATCH',
        body: payload
      })
      success('แก้ไขห้องเรียนสำเร็จ')
    } else {
      await apiFetch('/classrooms', {
        method: 'POST',
        body: payload
      })
      success('เพิ่มห้องเรียนสำเร็จ')
    }

    showModal.value = false
    await fetchAll()
  } catch {
    errorMessage.value = 'บันทึกข้อมูลห้องเรียนไม่สำเร็จ'
    error('บันทึกข้อมูลห้องเรียนไม่สำเร็จ')
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
    await apiFetch(`/classrooms/${deleteTarget.value.id}`, {
      method: 'DELETE'
    })
    success('ลบห้องเรียนสำเร็จ')
    showDeleteModal.value = false
    deleteTarget.value = null
    await fetchAll()
  } catch {
    errorMessage.value = 'ลบข้อมูลห้องเรียนไม่สำเร็จ'
    error('ลบข้อมูลห้องเรียนไม่สำเร็จ')
  } finally {
    deleting.value = false
  }
}

watch([filterClassroomId, filterGrade], () => {
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
