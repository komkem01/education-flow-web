<template>
  <NuxtLayout name="admin" page-title="จัดการนักเรียน" page-description="จัดการข้อมูลนักเรียนในโรงเรียน">
    <div class="mb-6 flex justify-between items-center">
      <div class="flex gap-3">
        <UIInput
          v-model="searchQuery"
          placeholder="ค้นหานักเรียน..."
          @input="handleSearch"
        />
        <UISelect
          v-model="filterGrade"
          :options="gradeOptions"
          placeholder="ระดับชั้น"
          @update:model-value="handleFilterChange"
        />
        <UISelect
          v-model="filterClassroom"
          :options="classroomOptions"
          placeholder="ห้องเรียน"
          @update:model-value="handleFilterChange"
        />
      </div>
      <UIButton variant="primary" icon="lucide:user-plus" @click="showStudentModal = true">
        เพิ่มนักเรียน
      </UIButton>
    </div>

    <UICard>
      <UITable
        :columns="columns"
        :data="students"
        :loading="loading"
        :actions="{ view: true, edit: true, delete: true }"
        :pagination="pagination"
        @view="handleView"
        @edit="handleEdit"
        @delete="handleDelete"
        @page-change="handlePageChange"
      >
        <template #cell-gradeLevel="{ value }">
          <UIBadge variant="primary">ม.{{ value }}</UIBadge>
        </template>
        
        <template #cell-isActive="{ value }">
          <UIBadge :variant="value ? 'success' : 'secondary'">
            {{ value ? 'กำลังศึกษา' : 'ไม่ได้ศึกษา' }}
          </UIBadge>
        </template>
      </UITable>
    </UICard>

    <!-- Student Modal -->
    <UIModal
      v-model="showStudentModal"
      :title="editMode ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มนักเรียน'"
      size="xl"
      :show-default-footer="true"
      :loading="saving"
      @confirm="handleSave"
    >
      <div class="grid grid-cols-2 gap-4">
        <UIInput
          v-model="form.studentCode"
          label="รหัสนักเรียน"
          placeholder="กรอกรหัสนักเรียน"
          required
          :disabled="editMode"
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

      <div class="grid grid-cols-3 gap-4 mt-4">
        <UIInput
          v-model="form.birthDate"
          label="วันเกิด"
          type="date"
          required
        />
        <UISelect
          v-model="form.gender"
          label="เพศ"
          :options="genderOptions"
          required
        />
        <UIInput
          v-model="form.bloodType"
          label="กรุ๊ปเลือด"
          placeholder="เช่น A, B, O, AB"
        />
      </div>

      <div class="grid grid-cols-2 gap-4 mt-4">
        <UIInput
          v-model="form.nationality"
          label="สัญชาติ"
          placeholder="กรอกสัญชาติ"
          required
        />
        <UIInput
          v-model="form.religion"
          label="ศาสนา"
          placeholder="กรอกศาสนา"
          required
        />
      </div>

      <div class="grid grid-cols-2 gap-4 mt-4">
        <UIInput
          v-model="form.email"
          label="อีเมล"
          type="email"
          placeholder="กรอกอีเมล"
        />
        <UIInput
          v-model="form.enrollmentDate"
          label="วันที่เข้าเรียน"
          type="date"
          required
        />
      </div>

      <div class="grid grid-cols-2 gap-4 mt-4">
        <UIInput
          v-model="form.emergencyContact"
          label="ผู้ติดต่อฉุกเฉิน"
          placeholder="กรอกชื่อผู้ติดต่อ"
          required
        />
        <UIInput
          v-model="form.emergencyPhone"
          label="เบอร์ติดต่อฉุกเฉิน"
          placeholder="กรอกเบอร์โทรศัพท์"
          required
        />
      </div>

      <div class="mt-4">
        <UIInput
          v-model="form.allergies"
          label="อาการแพ้ (ถ้ามี)"
          placeholder="ระบุอาการแพ้"
        />
      </div>

      <div class="mt-4">
        <UIInput
          v-model="form.medicalConditions"
          label="โรคประจำตัว (ถ้ามี)"
          placeholder="ระบุโรคประจำตัว"
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
          คุณต้องการลบนักเรียน <span class="font-medium">{{ selectedStudent?.fullName }}</span> ใช่หรือไม่?
        </p>
      </div>
    </UIModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Student } from '~/types'

definePageMeta({
  layout: false,
  middleware: 'auth'
})

const { apiFetch } = useApi()
const { success, error } = useToast()
const route = useRoute()
const router = useRouter()

const students = ref<Student[]>([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showStudentModal = ref(false)
const showDeleteModal = ref(false)
const editMode = ref(false)
const selectedStudent = ref<Student | null>(null)
const searchQuery = ref('')
const filterGrade = ref('')
const filterClassroom = ref('')

const columns = [
  { key: 'studentCode', label: 'รหัส' },
  { key: 'fullName', label: 'ชื่อ-นามสกุล' },
  { key: 'gradeLevel', label: 'ระดับชั้น' },
  { key: 'gender', label: 'เพศ' },
  { key: 'emergencyPhone', label: 'เบอร์ฉุกเฉิน' },
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

const classroomOptions = [
  { label: 'ทั้งหมด', value: '' },
  { label: 'ห้อง 1', value: '1' },
  { label: 'ห้อง 2', value: '2' }
]

const genderOptions = [
  { label: 'ชาย', value: 'male' },
  { label: 'หญิง', value: 'female' }
]

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

const form = reactive({
  studentCode: '',
  firstName: '',
  lastName: '',
  email: '',
  gradeLevel: '',
  birthDate: '',
  gender: '',
  bloodType: '',
  nationality: '',
  religion: '',
  enrollmentDate: '',
  emergencyContact: '',
  emergencyPhone: '',
  allergies: '',
  medicalConditions: '',
  username: '',
  password: ''
})

const clearEditQuery = async () => {
  if (!('edit' in route.query)) return
  const query = { ...route.query }
  delete query.edit
  await router.replace({ path: route.path, query })
}

const populateFormFromStudent = (student: Partial<Student>) => {
  form.studentCode = student.studentCode || ''
  form.firstName = student.firstName || ''
  form.lastName = student.lastName || ''
  form.email = student.email || ''
  form.gradeLevel = student.gradeLevel ? String(student.gradeLevel) : ''
  form.birthDate = student.birthDate || ''
  form.gender = student.gender || ''
  form.bloodType = student.bloodType || ''
  form.nationality = student.nationality || ''
  form.religion = student.religion || ''
  form.enrollmentDate = student.enrollmentDate || ''
  form.emergencyContact = student.emergencyContact || ''
  form.emergencyPhone = student.emergencyPhone || ''
  form.allergies = student.allergies || ''
  form.medicalConditions = student.medicalConditions || ''
  form.username = student.username || ''
  form.password = ''
}

const fetchStudents = async () => {
  loading.value = true
  try {
    const response = await apiFetch<any>('/students', {
      params: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: searchQuery.value,
        gradeLevel: filterGrade.value,
        classroomId: filterClassroom.value
      }
    })
    students.value = response.data
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
  fetchStudents()
}

const handleFilterChange = () => {
  pagination.value.page = 1
  fetchStudents()
}

const handleView = (student: Student) => {
  if (!student.id) return
  navigateTo(`/admin/students/${student.id}`)
}

const handleEdit = (student: Student) => {
  editMode.value = true
  selectedStudent.value = student
  populateFormFromStudent(student)
  showStudentModal.value = true
}

const handleDelete = (student: Student) => {
  selectedStudent.value = student
  showDeleteModal.value = true
}

const handleSave = async () => {
  saving.value = true
  try {
    if (editMode.value) {
      await apiFetch(`/students/${selectedStudent.value?.id}`, {
        method: 'PUT',
        body: form
      })
      success('แก้ไขข้อมูลสำเร็จ')
    } else {
      await apiFetch('/students', {
        method: 'POST',
        body: form
      })
      success('เพิ่มนักเรียนสำเร็จ')
    }
    showStudentModal.value = false
    resetForm()
    await fetchStudents()
  } catch (err) {
    error('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async () => {
  deleting.value = true
  try {
    await apiFetch(`/students/${selectedStudent.value?.id}`, {
      method: 'DELETE'
    })
    success('ลบนักเรียนสำเร็จ')
    showDeleteModal.value = false
    await fetchStudents()
  } catch (err) {
    error('เกิดข้อผิดพลาดในการลบข้อมูล')
  } finally {
    deleting.value = false
  }
}

const resetForm = () => {
  editMode.value = false
  selectedStudent.value = null
  Object.keys(form).forEach(key => {
    (form as any)[key] = ''
  })
}

const openEditFromQuery = async () => {
  const queryValue = route.query.edit
  const editId = Array.isArray(queryValue) ? queryValue[0] : queryValue
  if (!editId) return

  try {
    const response = await apiFetch<any>(`/students/${editId}`)
    const student = response.data ?? response
    handleEdit(student)
  } catch {
    error('ไม่สามารถเปิดหน้าแก้ไขจากลิงก์นี้ได้')
  } finally {
    await clearEditQuery()
  }
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  fetchStudents()
}

onMounted(async () => {
  await fetchStudents()
  await openEditFromQuery()
})
</script>
