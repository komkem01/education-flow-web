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
      />
    </UICard>

    <UIModal
      v-model="showSchoolModal"
      title="แก้ไขข้อมูลโรงเรียน"
      size="lg"
      :show-default-footer="true"
      :loading="saving"
      @confirm="handleSave"
    >
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <UIInput
          v-model="form.name"
          label="ชื่อโรงเรียน"
          placeholder="กรอกชื่อโรงเรียน"
          required
        />
        <UIInput
          v-model="form.logo_url"
          label="โลโก้โรงเรียน (URL)"
          placeholder="https://example.com/logo.png"
        />
      </div>

      <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <UIInput
          v-model="form.theme_color"
          label="สีธีม"
          placeholder="#0ea5e9"
        />
        <UIInput
          v-model="form.address"
          label="ที่อยู่"
          placeholder="กรอกที่อยู่โรงเรียน"
          required
        />
      </div>

      <div class="mt-4">
        <UIInput
          v-model="form.description"
          label="คำอธิบาย"
          placeholder="คำอธิบายโรงเรียน"
        />
      </div>
    </UIModal>

  </NuxtLayout>
</template>

<script setup lang="ts">

interface SchoolInfo {
  id: string
  name: string
  logo_url?: string | null
  theme_color?: string | null
  address?: string | null
  description?: string | null
}

definePageMeta({
  layout: false,
  middleware: 'auth'
})

const { apiFetch } = useApi()
const { success, error } = useToast()
const route = useRoute()
const router = useRouter()

const schools = ref<SchoolInfo[]>([])
const loading = ref(false)
const saving = ref(false)
const showSchoolModal = ref(false)
const selectedSchool = ref<SchoolInfo | null>(null)

const columns = [
  { key: 'name', label: 'ชื่อโรงเรียน' },
  { key: 'address', label: 'ที่อยู่' },
  { key: 'description', label: 'คำอธิบาย' }
]

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

const form = reactive({
  name: '',
  logo_url: '',
  theme_color: '',
  address: '',
  description: ''
})

const clearEditQuery = async () => {
  if (!('edit' in route.query)) return
  const query = { ...route.query }
  delete query.edit
  await router.replace({ path: route.path, query })
}

const populateFormFromSchool = (school: Partial<SchoolInfo>) => {
  form.name = school.name || ''
  form.logo_url = school.logo_url || ''
  form.theme_color = school.theme_color || ''
  form.address = school.address || ''
  form.description = school.description || ''
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
    const payload = response.data ?? response
    schools.value = Array.isArray(payload) ? payload : [payload]
    pagination.value.total = response.total ?? schools.value.length
    pagination.value.totalPages = response.totalPages ?? 1
  } catch (err) {
    error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
  } finally {
    loading.value = false
  }
}

const handleView = (school: SchoolInfo) => {
  if (!school.id) return
  navigateTo(`/admin/schools/${school.id}`)
}

const handleEdit = (school: SchoolInfo) => {
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
      body: {
        name: form.name,
        logo_url: form.logo_url || null,
        theme_color: form.theme_color || null,
        address: form.address,
        description: form.description
      }
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
