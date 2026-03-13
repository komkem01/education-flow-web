<template>
  <NuxtLayout name="admin" page-title="ข้อมูลโรงเรียน" page-description="แสดงข้อมูลโรงเรียนของคุณ">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h3 class="text-lg font-semibold text-secondary-900">ข้อมูลโรงเรียน</h3>
        <p class="text-sm text-secondary-600">แสดงและแก้ไขข้อมูลโรงเรียนของคุณ</p>
      </div>
    </div>

    <UICard>
      <UITable
        :columns="columns"
        :data="schools"
        :loading="loading"
        :actions="{ view: true, edit: true, delete: false }"
        :pagination="pagination"
        @view="handleView"
        @edit="handleEdit"
        @page-change="handlePageChange"
      >
        <template #cell-isActive="{ value }">
          <UIBadge :variant="value ? 'success' : 'secondary'">
            {{ value ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
          </UIBadge>
        </template>
      </UITable>
    </UICard>

    <UIModal
      v-model="showSchoolModal"
      title="แก้ไขข้อมูลโรงเรียน"
      size="lg"
      :show-default-footer="true"
      :loading="saving"
      @confirm="handleSave"
    >
      <div class="grid grid-cols-2 gap-4">
        <UIInput
          v-model="form.code"
          label="รหัสโรงเรียน"
          :disabled="true"
        />
        <UIInput
          v-model="form.name"
          label="ชื่อโรงเรียน (ไทย)"
          placeholder="กรอกชื่อโรงเรียน"
          required
        />
        <UIInput
          v-model="form.nameEn"
          label="ชื่อโรงเรียน (อังกฤษ)"
          placeholder="School Name"
        />
        <UIInput
          v-model="form.phoneNumber"
          label="เบอร์โทรศัพท์"
          placeholder="กรอกเบอร์โทรศัพท์"
          required
        />
        <UIInput
          v-model="form.email"
          label="อีเมล"
          type="email"
          placeholder="กรอกอีเมล"
          required
        />
        <UIInput
          v-model="form.website"
          label="เว็บไซต์"
          placeholder="https://"
        />
      </div>

      <div class="mt-4">
        <UIInput
          v-model="form.address"
          label="ที่อยู่"
          placeholder="กรอกที่อยู่โรงเรียน"
          required
        />
      </div>

      <div class="grid grid-cols-4 gap-4 mt-4">
        <UIInput
          v-model="form.subDistrict"
          label="ตำบล/แขวง"
          placeholder="ตำบล/แขวง"
          required
        />
        <UIInput
          v-model="form.district"
          label="อำเภอ/เขต"
          placeholder="อำเภอ/เขต"
          required
        />
        <UIInput
          v-model="form.province"
          label="จังหวัด"
          placeholder="จังหวัด"
          required
        />
        <UIInput
          v-model="form.postalCode"
          label="รหัสไปรษณีย์"
          placeholder="00000"
          required
        />
      </div>

      <div class="mt-4">
        <UIInput
          v-model="form.director"
          label="ผู้อำนวยการ"
          placeholder="กรอกชื่อผู้อำนวยการ"
          required
        />
      </div>
    </UIModal>

  </NuxtLayout>
</template>

<script setup lang="ts">
import type { School } from '~/types'

definePageMeta({
  layout: false,
  middleware: 'auth'
})

const { apiFetch } = useApi()
const { success, error } = useToast()
const route = useRoute()
const router = useRouter()

const schools = ref<School[]>([])
const loading = ref(false)
const saving = ref(false)
const showSchoolModal = ref(false)
const selectedSchool = ref<School | null>(null)

const columns = [
  { key: 'code', label: 'รหัส' },
  { key: 'name', label: 'ชื่อโรงเรียน' },
  { key: 'phoneNumber', label: 'เบอร์โทร' },
  { key: 'director', label: 'ผู้อำนวยการ' },
  { key: 'isActive', label: 'สถานะ' }
]

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
  address: '',
  subDistrict: '',
  district: '',
  province: '',
  postalCode: '',
  phoneNumber: '',
  email: '',
  website: '',
  director: ''
})

const clearEditQuery = async () => {
  if (!('edit' in route.query)) return
  const query = { ...route.query }
  delete query.edit
  await router.replace({ path: route.path, query })
}

const populateFormFromSchool = (school: Partial<School>) => {
  form.code = school.code || ''
  form.name = school.name || ''
  form.nameEn = school.nameEn || ''
  form.address = school.address || ''
  form.subDistrict = school.subDistrict || ''
  form.district = school.district || ''
  form.province = school.province || ''
  form.postalCode = school.postalCode || ''
  form.phoneNumber = school.phoneNumber || ''
  form.email = school.email || ''
  form.website = school.website || ''
  form.director = school.director || ''
}

const fetchSchools = async () => {
  loading.value = true
  try {
    const response = await apiFetch<any>('/schools', {
      params: {
        page: pagination.value.page,
        limit: pagination.value.limit
      }
    })
    schools.value = response.data
    pagination.value.total = response.total
    pagination.value.totalPages = response.totalPages
  } catch (err) {
    error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
  } finally {
    loading.value = false
  }
}

const handleView = (school: School) => {
  if (!school.id) return
  navigateTo(`/admin/schools/${school.id}`)
}

const handleEdit = (school: School) => {
  selectedSchool.value = school
  populateFormFromSchool(school)
  showSchoolModal.value = true
}

const handleSave = async () => {
  if (!selectedSchool.value?.id) return

  saving.value = true
  try {
    await apiFetch(`/schools/${selectedSchool.value.id}`, {
      method: 'PUT',
      body: form
    })
    success('แก้ไขข้อมูลโรงเรียนสำเร็จ')
    showSchoolModal.value = false
    await fetchSchools()
  } catch {
    error('ไม่สามารถบันทึกข้อมูลโรงเรียนได้')
  } finally {
    saving.value = false
  }
}

const openEditFromQuery = async () => {
  const queryValue = route.query.edit
  const editId = Array.isArray(queryValue) ? queryValue[0] : queryValue
  if (!editId) return

  try {
    const response = await apiFetch<any>(`/schools/${editId}`)
    const school = response.data ?? response
    handleEdit(school)
  } catch {
    error('ไม่สามารถเปิดหน้าแก้ไขจากลิงก์นี้ได้')
  } finally {
    await clearEditQuery()
  }
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  fetchSchools()
}

onMounted(async () => {
  await fetchSchools()
  await openEditFromQuery()
})
</script>
