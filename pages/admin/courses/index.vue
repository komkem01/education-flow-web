<template>
  <NuxtLayout name="admin" page-title="หลักสูตร" page-description="จัดการข้อมูลหลักสูตรของโรงเรียน">
    <div class="mb-6 flex items-center justify-between gap-3">
      <div class="flex-1 text-sm text-secondary-600">
        ทั้งหมด {{ pagination.total }} รายการ
      </div>
      <div class="flex items-center gap-2">
        <UIButton variant="secondary" icon="lucide:refresh-cw" @click="fetchItems">รีเฟรช</UIButton>
        <UIButton variant="primary" icon="lucide:plus" @click="openCreateModal">เพิ่มหลักสูตร</UIButton>
      </div>
    </div>

    <UICard v-if="errorMessage" class="mb-4">
      <p class="text-sm text-danger-600">{{ errorMessage }}</p>
    </UICard>

    <UICard>
      <UITable
        :columns="columns"
        :data="pagedItems"
        :loading="loading"
        :actions="{ view: true, edit: true, delete: true }"
        :pagination="pagination"
        @view="handleView"
        @edit="handleEdit"
        @delete="openDeleteConfirm"
        @page-change="handlePageChange"
      />
    </UICard>

    <UIModal
      v-model="showModal"
      :title="editMode ? 'แก้ไขหลักสูตร' : 'เพิ่มหลักสูตร'"
      size="lg"
      :show-default-footer="true"
      :loading="saving"
      @confirm="handleSave"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UIInput v-model="form.code" label="รหัสหลักสูตร" placeholder="เช่น MATH101" required />
        <UIInput v-model="form.name" label="ชื่อหลักสูตร" placeholder="เช่น คณิตศาสตร์พื้นฐาน" required />
        <UIInput v-model="form.head" label="หัวหน้าหลักสูตร" placeholder="เช่น อ.สมชาย ใจดี" />
        <UIInput v-model="form.description" class="md:col-span-2" label="รายละเอียด" placeholder="รายละเอียดหลักสูตร" />
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
        ต้องการลบหลักสูตร
        <span class="font-semibold text-secondary-900">{{ deleteTarget?.name }}</span>
        ใช่หรือไม่?
      </p>
    </UIModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: false, middleware: 'auth' })

const { apiFetch } = useApi()
const { success, error } = useToast()

type CourseApiItem = {
  id: string
  code: string
  name: string
  head: string | null
  description: string | null
  is_active: boolean
}

type CourseRow = {
  id: string
  code: string
  name: string
  head: string
  description: string
}

const items = ref<CourseRow[]>([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const errorMessage = ref('')

const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 1 })

const columns = [
  { key: 'code', label: 'รหัสหลักสูตร' },
  { key: 'name', label: 'ชื่อหลักสูตร' },
  { key: 'head', label: 'หัวหน้าหลักสูตร' },
  { key: 'description', label: 'รายละเอียด' }
]

const showModal = ref(false)
const editMode = ref(false)
const editTarget = ref<CourseRow | null>(null)

const showDeleteModal = ref(false)
const deleteTarget = ref<CourseRow | null>(null)

const form = reactive({
  code: '',
  name: '',
  head: '',
  description: '',
})

const pagedItems = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.limit
  const end = start + pagination.value.limit
  return items.value.slice(start, end)
})

const updatePagination = () => {
  pagination.value.total = items.value.length
  pagination.value.totalPages = Math.max(1, Math.ceil(items.value.length / pagination.value.limit))
  if (pagination.value.page > pagination.value.totalPages) {
    pagination.value.page = pagination.value.totalPages
  }
}

const mapItem = (item: CourseApiItem): CourseRow => ({
  id: String(item.id || ''),
  code: String(item.code || '').trim() || String(item.id || '').slice(0, 8),
  name: String(item.name || '-'),
  head: String(item.head || '').trim() || '-',
  description: String(item.description || '').trim() || '-'
})

const resetForm = () => {
  form.code = ''
  form.name = ''
  form.head = ''
  form.description = ''
}

const openCreateModal = () => {
  editMode.value = false
  editTarget.value = null
  resetForm()
  showModal.value = true
}

const handleEdit = (row: CourseRow) => {
  editMode.value = true
  editTarget.value = row
  form.code = row.code
  form.name = row.name
  form.head = row.head === '-' ? '' : row.head
  form.description = row.description === '-' ? '' : row.description
  showModal.value = true
}

const openDeleteConfirm = (row: CourseRow) => {
  deleteTarget.value = row
  showDeleteModal.value = true
}

const fetchItems = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await apiFetch<any>('/courses', { params: { only_active: false } })
    const payload = response?.data ?? response
    const source: CourseApiItem[] = Array.isArray(payload) ? payload : payload ? [payload] : []
    items.value = source.map(mapItem)
    updatePagination()
  } catch {
    items.value = []
    updatePagination()
    errorMessage.value = 'ไม่สามารถโหลดข้อมูลหลักสูตรได้'
    error('ไม่สามารถโหลดข้อมูลหลักสูตรได้')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
}

const handleView = (row: CourseRow) => {
  if (!row?.id) return
  navigateTo(`/admin/courses/${row.id}`)
}

const toNullableTrimmed = (value: string) => {
  const trimmed = value.trim()
  return trimmed || null
}

const handleSave = async () => {
  if (!form.code.trim() || !form.name.trim()) {
    error('กรุณากรอกรหัสและชื่อหลักสูตร')
    return
  }

  saving.value = true
  errorMessage.value = ''
  try {
    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      head: toNullableTrimmed(form.head),
      description: toNullableTrimmed(form.description),
      is_active: true
    }

    if (editMode.value && editTarget.value?.id) {
      await apiFetch(`/courses/${editTarget.value.id}`, {
        method: 'PATCH',
        body: payload
      })
      success('แก้ไขหลักสูตรสำเร็จ')
    } else {
      await apiFetch('/courses', {
        method: 'POST',
        body: payload
      })
      success('เพิ่มหลักสูตรสำเร็จ')
    }

    showModal.value = false
    await fetchItems()
  } catch {
    errorMessage.value = 'บันทึกข้อมูลหลักสูตรไม่สำเร็จ'
    error('บันทึกข้อมูลหลักสูตรไม่สำเร็จ')
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
    await apiFetch(`/courses/${deleteTarget.value.id}`, {
      method: 'DELETE'
    })
    success('ลบหลักสูตรสำเร็จ')
    showDeleteModal.value = false
    deleteTarget.value = null
    await fetchItems()
  } catch {
    errorMessage.value = 'ลบข้อมูลหลักสูตรไม่สำเร็จ'
    error('ลบข้อมูลหลักสูตรไม่สำเร็จ')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  fetchItems()
})
</script>
