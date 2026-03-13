<template>
  <NuxtLayout name="admin" page-title="จัดการครู" page-description="จัดการข้อมูลครูในโรงเรียน">
    <div class="mb-6 flex justify-between items-center">
      <div class="flex gap-3">
        <UIInput
          v-model="searchQuery"
          placeholder="ค้นหาครู..."
          @input="handleSearch"
        />
        <UISelect
          v-model="filterStatus"
          :options="statusOptions"
          placeholder="สถานะ"
          @update:model-value="handleFilterChange"
        />
      </div>
      <UIButton variant="primary" icon="lucide:user-plus" @click="showTeacherModal = true">
        เพิ่มครู
      </UIButton>
    </div>

    <UICard>
      <UITable
        :columns="columns"
        :data="teachers"
        :loading="loading"
        :actions="{ view: true, edit: true, delete: true }"
        :pagination="pagination"
        @view="handleView"
        @edit="handleEdit"
        @delete="handleDelete"
        @page-change="handlePageChange"
      >
        <template #cell-isApproved="{ value }">
          <UIBadge :variant="value ? 'success' : 'warning'">
            {{ value ? 'อนุมัติแล้ว' : 'รออนุมัติ' }}
          </UIBadge>
        </template>
        
        <template #cell-isActive="{ value }">
          <UIBadge :variant="value ? 'success' : 'secondary'">
            {{ value ? 'ทำงาน' : 'ไม่ทำงาน' }}
          </UIBadge>
        </template>
      </UITable>
    </UICard>

    <!-- Teacher Modal -->
    <UIModal
      v-model="showTeacherModal"
      :title="editMode ? 'แก้ไขข้อมูลครู' : 'เพิ่มครู'"
      size="xl"
      :show-default-footer="true"
      :loading="saving"
      @confirm="handleSave"
    >
      <div class="grid grid-cols-2 gap-4">
        <UIInput
          v-model="form.teacherCode"
          label="รหัสครู"
          placeholder="กรอกรหัสครู"
          required
          :disabled="editMode"
        />
        <UIInput
          v-model="form.position"
          label="ตำแหน่ง"
          placeholder="เช่น ครูผู้ช่วย, ครูชำนาญการ"
          required
        />
      </div>

      <div class="grid grid-cols-2 gap-4 mt-4">
        <UIInput
          v-model="form.firstName"
          label="ชื่อ"
          placeholder="กรอกชื่อ"
          required
        />
        <UIInput
          v-model="form.lastName"
          label="นามสกุล"
          placeholder="กรอกนามสกุล"
          required
        />
      </div>

      <div class="grid grid-cols-2 gap-4 mt-4">
        <UIInput
          v-model="form.email"
          label="อีเมล"
          type="email"
          placeholder="กรอกอีเมล"
          required
        />
        <UIInput
          v-model="form.phoneNumber"
          label="เบอร์โทรศัพท์"
          placeholder="กรอกเบอร์โทรศัพท์"
        />
      </div>

      <div class="grid grid-cols-2 gap-4 mt-4">
        <UIInput
          v-model="form.department"
          label="กลุ่มสาระการเรียนรู้"
          placeholder="เช่น คณิตศาสตร์, วิทยาศาสตร์"
          required
        />
        <UIInput
          v-model="form.hireDate"
          label="วันที่เริ่มงาน"
          type="date"
          required
        />
      </div>

      <div class="grid grid-cols-2 gap-4 mt-4">
        <UIInput
          v-model="form.educationLevel"
          label="วุฒิการศึกษา"
          placeholder="เช่น ปริญญาตรี, ปริญญาโท"
          required
        />
        <UIInput
          v-model="form.major"
          label="สาขาวิชา"
          placeholder="กรอกสาขาวิชา"
          required
        />
      </div>

      <div class="grid grid-cols-2 gap-4 mt-4" v-if="!editMode">
        <UIInput
          v-model="form.username"
          label="ชื่อผู้ใช้"
          placeholder="กรอกชื่อผู้ใช้"
          required
        />
        <UIInput
          v-model="form.password"
          label="รหัสผ่าน"
          type="password"
          placeholder="กรอกรหัสผ่าน"
          required
        />
      </div>

      <div class="mt-4" v-if="editMode">
        <label class="flex items-center">
          <input
            v-model="form.isApproved"
            type="checkbox"
            class="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
          />
          <span class="ml-2 text-sm text-secondary-700">อนุมัติการเป็นครู</span>
        </label>
      </div>
    </UIModal>

    <!-- Delete Confirmation Modal -->
    <UIModal
      v-model="showDeleteModal"
      title="ยืนยันการลบ"
      size="sm"
      :show-default-footer="true"
      :loading="deleting"
      @confirm="confirmDelete"
    >
      <div class="text-center py-4">
        <Icon name="lucide:alert-triangle" class="w-16 h-16 text-warning-500 mx-auto mb-4" />
        <p class="text-secondary-900 font-medium mb-2">คุณแน่ใจหรือไม่?</p>
        <p class="text-sm text-secondary-600">
          คุณต้องการลบครู <span class="font-medium">{{ selectedTeacher?.fullName }}</span> ใช่หรือไม่?
        </p>
      </div>
    </UIModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Teacher } from '~/types'

definePageMeta({
  layout: false,
  middleware: 'auth'
})

const { apiFetch } = useApi()
const { success, error } = useToast()
const route = useRoute()
const router = useRouter()

const teachers = ref<Teacher[]>([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showTeacherModal = ref(false)
const showDeleteModal = ref(false)
const editMode = ref(false)
const selectedTeacher = ref<Teacher | null>(null)
const searchQuery = ref('')
const filterStatus = ref('')

const columns = [
  { key: 'teacherCode', label: 'รหัส' },
  { key: 'fullName', label: 'ชื่อ-นามสกุล' },
  { key: 'department', label: 'กลุ่มสาระ' },
  { key: 'position', label: 'ตำแหน่ง' },
  { key: 'isApproved', label: 'การอนุมัติ' },
  { key: 'isActive', label: 'สถานะ' }
]

const statusOptions = [
  { label: 'ทั้งหมด', value: '' },
  { label: 'ทำงาน', value: 'active' },
  { label: 'ไม่ทำงาน', value: 'inactive' },
  { label: 'รออนุมัติ', value: 'pending' }
]

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

const form = reactive({
  teacherCode: '',
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  position: '',
  department: '',
  hireDate: '',
  educationLevel: '',
  major: '',
  username: '',
  password: '',
  isApproved: false
})

const clearEditQuery = async () => {
  if (!('edit' in route.query)) return
  const query = { ...route.query }
  delete query.edit
  await router.replace({ path: route.path, query })
}

const populateFormFromTeacher = (teacher: Partial<Teacher>) => {
  form.teacherCode = teacher.teacherCode || ''
  form.firstName = teacher.firstName || ''
  form.lastName = teacher.lastName || ''
  form.email = teacher.email || ''
  form.phoneNumber = teacher.phoneNumber || ''
  form.position = teacher.position || ''
  form.department = teacher.department || ''
  form.hireDate = teacher.hireDate || ''
  form.educationLevel = teacher.educationLevel || ''
  form.major = teacher.major || ''
  form.username = teacher.username || ''
  form.password = ''
  form.isApproved = Boolean(teacher.isApproved)
}

const fetchTeachers = async () => {
  loading.value = true
  try {
    const response = await apiFetch<any>('/teachers', {
      params: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: searchQuery.value,
        status: filterStatus.value
      }
    })
    teachers.value = response.data
    pagination.value.total = response.total
    pagination.value.totalPages = response.totalPages
  } catch (err) {
    error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.page = 1
  fetchTeachers()
}

const handleFilterChange = () => {
  pagination.value.page = 1
  fetchTeachers()
}

const handleView = (teacher: Teacher) => {
  if (!teacher.id) return
  navigateTo(`/admin/teachers/${teacher.id}`)
}

const handleEdit = (teacher: Teacher) => {
  editMode.value = true
  selectedTeacher.value = teacher
  populateFormFromTeacher(teacher)
  showTeacherModal.value = true
}

const handleDelete = (teacher: Teacher) => {
  selectedTeacher.value = teacher
  showDeleteModal.value = true
}

const handleSave = async () => {
  saving.value = true
  try {
    if (editMode.value) {
      await apiFetch(`/teachers/${selectedTeacher.value?.id}`, {
        method: 'PUT',
        body: form
      })
      success('แก้ไขข้อมูลสำเร็จ')
    } else {
      await apiFetch('/teachers', {
        method: 'POST',
        body: form
      })
      success('เพิ่มครูสำเร็จ')
    }
    showTeacherModal.value = false
    resetForm()
    await fetchTeachers()
  } catch (err) {
    error('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async () => {
  deleting.value = true
  try {
    await apiFetch(`/teachers/${selectedTeacher.value?.id}`, {
      method: 'DELETE'
    })
    success('ลบครูสำเร็จ')
    showDeleteModal.value = false
    await fetchTeachers()
  } catch (err) {
    error('เกิดข้อผิดพลาดในการลบข้อมูล')
  } finally {
    deleting.value = false
  }
}

const resetForm = () => {
  editMode.value = false
  selectedTeacher.value = null
  Object.keys(form).forEach(key => {
    (form as any)[key] = ''
  })
  form.isApproved = false
}

const openEditFromQuery = async () => {
  const queryValue = route.query.edit
  const editId = Array.isArray(queryValue) ? queryValue[0] : queryValue
  if (!editId) return

  try {
    const response = await apiFetch<any>(`/teachers/${editId}`)
    const teacher = response.data ?? response
    handleEdit(teacher)
  } catch {
    error('ไม่สามารถเปิดหน้าแก้ไขจากลิงก์นี้ได้')
  } finally {
    await clearEditQuery()
  }
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  fetchTeachers()
}

onMounted(async () => {
  await fetchTeachers()
  await openEditFromQuery()
})
</script>
