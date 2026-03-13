<template>
  <NuxtLayout name="admin" page-title="จัดการบุคคลากร" page-description="จัดการข้อมูลบุคคลากรในโรงเรียน">
    <div class="mb-6 flex justify-between items-center">
      <div class="flex gap-3">
        <UIInput
          v-model="searchQuery"
          placeholder="ค้นหาบุคคลากร..."
          @input="handleSearch"
        />
        <UISelect
          v-model="filterDepartment"
          :options="departmentOptions"
          placeholder="แผนก"
          @update:model-value="handleFilterChange"
        />
      </div>
      <UIButton variant="primary" icon="lucide:user-plus" @click="showStaffModal = true">
        เพิ่มบุคคลากร
      </UIButton>
    </div>

    <UICard>
      <UITable
        :columns="columns"
        :data="staffList"
        :loading="loading"
        :actions="{ view: true, edit: true, delete: true }"
        :pagination="pagination"
        @view="handleView"
        @edit="handleEdit"
        @delete="handleDelete"
        @page-change="handlePageChange"
      >
        <template #cell-isActive="{ value }">
          <UIBadge :variant="value ? 'success' : 'secondary'">
            {{ value ? 'ทำงาน' : 'ไม่ทำงาน' }}
          </UIBadge>
        </template>
        
        <template #cell-department="{ value }">
          <UIBadge variant="primary">{{ getDepartmentLabel(value) }}</UIBadge>
        </template>
      </UITable>
    </UICard>

    <!-- Staff Modal -->
    <UIModal
      v-model="showStaffModal"
      :title="editMode ? 'แก้ไขข้อมูลบุคคลากร' : 'เพิ่มบุคคลากร'"
      size="xl"
      :show-default-footer="true"
      :loading="saving"
      @confirm="handleSave"
    >
      <div class="grid grid-cols-2 gap-4">
        <UIInput
          v-model="form.employeeCode"
          label="รหัสพนักงาน"
          placeholder="กรอกรหัสพนักงาน"
          required
          :disabled="editMode"
        />
        <UISelect
          v-model="form.department"
          label="แผนก"
          :options="departmentOptions"
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
          v-model="form.position"
          label="ตำแหน่ง"
          placeholder="กรอกตำแหน่ง"
          required
        />
        <UIInput
          v-model="form.hireDate"
          label="วันที่เริ่มงาน"
          type="date"
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
          คุณต้องการลบบุคคลากร <span class="font-medium">{{ selectedStaff?.fullName }}</span> ใช่หรือไม่?
        </p>
      </div>
    </UIModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Staff } from '~/types'

definePageMeta({
  layout: false,
  middleware: 'auth'
})

const { apiFetch } = useApi()
const { success, error } = useToast()
const route = useRoute()
const router = useRouter()

const staffList = ref<Staff[]>([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showStaffModal = ref(false)
const showDeleteModal = ref(false)
const editMode = ref(false)
const selectedStaff = ref<Staff | null>(null)
const searchQuery = ref('')
const filterDepartment = ref('')

const columns = [
  { key: 'employeeCode', label: 'รหัส' },
  { key: 'fullName', label: 'ชื่อ-นามสกุล' },
  { key: 'department', label: 'แผนก' },
  { key: 'position', label: 'ตำแหน่ง' },
  { key: 'phoneNumber', label: 'เบอร์โทร' },
  { key: 'isActive', label: 'สถานะ' }
]

const departmentOptions = [
  { label: 'วิชาการ', value: 'academic' },
  { label: 'ทะเบียนและวัดผล', value: 'registrar' },
  { label: 'งานปกครอง', value: 'student_affairs' },
  { label: 'การเงิน', value: 'finance' },
  { label: 'งานทั่วไป', value: 'general_affairs' },
  { label: 'เทคโนโลยีสารสนเทศ', value: 'it' },
  { label: 'อื่นๆ', value: 'other' }
]

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

const form = reactive({
  employeeCode: '',
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  position: '',
  department: '',
  hireDate: '',
  username: '',
  password: ''
})

const clearEditQuery = async () => {
  if (!('edit' in route.query)) return
  const query = { ...route.query }
  delete query.edit
  await router.replace({ path: route.path, query })
}

const populateFormFromStaff = (staff: Partial<Staff>) => {
  form.employeeCode = staff.employeeCode || ''
  form.firstName = staff.firstName || ''
  form.lastName = staff.lastName || ''
  form.email = staff.email || ''
  form.phoneNumber = staff.phoneNumber || ''
  form.position = staff.position || ''
  form.department = staff.department || ''
  form.hireDate = staff.hireDate || ''
  form.username = staff.username || ''
  form.password = ''
}

const getDepartmentLabel = (value: string) => {
  return departmentOptions.find(d => d.value === value)?.label || value
}

const fetchStaff = async () => {
  loading.value = true
  try {
    const response = await apiFetch<any>('/staffs', {
      params: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: searchQuery.value,
        department: filterDepartment.value
      }
    })
    staffList.value = response.data
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
  fetchStaff()
}

const handleFilterChange = () => {
  pagination.value.page = 1
  fetchStaff()
}

const handleView = (staff: Staff) => {
  if (!staff.id) return
  navigateTo(`/admin/staff/${staff.id}`)
}

const handleEdit = (staff: Staff) => {
  editMode.value = true
  selectedStaff.value = staff
  populateFormFromStaff(staff)
  showStaffModal.value = true
}

const handleDelete = (staff: Staff) => {
  selectedStaff.value = staff
  showDeleteModal.value = true
}

const handleSave = async () => {
  saving.value = true
  try {
    if (editMode.value) {
      await apiFetch(`/staffs/${selectedStaff.value?.id}`, {
        method: 'PUT',
        body: form
      })
      success('แก้ไขข้อมูลสำเร็จ')
    } else {
      await apiFetch('/staffs', {
        method: 'POST',
        body: form
      })
      success('เพิ่มบุคคลากรสำเร็จ')
    }
    showStaffModal.value = false
    resetForm()
    await fetchStaff()
  } catch (err) {
    error('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async () => {
  deleting.value = true
  try {
    await apiFetch(`/staffs/${selectedStaff.value?.id}`, {
      method: 'DELETE'
    })
    success('ลบบุคคลากรสำเร็จ')
    showDeleteModal.value = false
    await fetchStaff()
  } catch (err) {
    error('เกิดข้อผิดพลาดในการลบข้อมูล')
  } finally {
    deleting.value = false
  }
}

const resetForm = () => {
  editMode.value = false
  selectedStaff.value = null
  Object.keys(form).forEach(key => {
    (form as any)[key] = ''
  })
}

const openEditFromQuery = async () => {
  const queryValue = route.query.edit
  const editId = Array.isArray(queryValue) ? queryValue[0] : queryValue
  if (!editId) return

  try {
    const response = await apiFetch<any>(`/staffs/${editId}`)
    const staff = response.data ?? response
    handleEdit(staff)
  } catch {
    error('ไม่สามารถเปิดหน้าแก้ไขจากลิงก์นี้ได้')
  } finally {
    await clearEditQuery()
  }
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  fetchStaff()
}

onMounted(async () => {
  await fetchStaff()
  await openEditFromQuery()
})
</script>
