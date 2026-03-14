<template>
  <NuxtLayout name="admin" page-title="กลุ่มสาระการเรียนรู้" page-description="จัดการกลุ่มสาระการเรียนรู้ทั้งหมดในโรงเรียน">
    <div class="mb-6 flex items-center justify-between gap-3">
      <div class="flex-1 text-sm text-secondary-600">ทั้งหมด {{ pagination.total }} รายการ</div>
      <div class="flex items-center gap-2">
        <UIButton variant="secondary" icon="lucide:refresh-cw" @click="refreshAll">รีเฟรช</UIButton>
        <UIButton variant="primary" icon="lucide:plus" @click="openCreateModal">เพิ่มกลุ่มสาระ</UIButton>
      </div>
    </div>

    <UICard v-if="errorMessage" class="mb-4">
      <p class="text-sm text-danger-600">{{ errorMessage }}</p>
    </UICard>

    <UICard class="mb-4">
      <div class="flex flex-nowrap items-center gap-2 overflow-x-auto">
        <select v-model="filterGroupId" class="input min-w-[220px]" @change="onFilterChange">
          <option value="">ทุกกลุ่มสาระ</option>
          <option v-for="row in items" :key="row.id" :value="row.id">{{ row.name }}</option>
        </select>
        <select v-model="filterHead" class="input min-w-[220px]" @change="onFilterChange">
          <option value="">ทุกหัวหน้ากลุ่มสาระ</option>
          <option v-for="opt in headOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <UIButton v-if="filterGroupId || filterHead" variant="detail" @click="clearFilters">ล้างตัวกรอง</UIButton>
      </div>
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
        @delete="openDeleteModal"
        @page-change="handlePageChange"
      />
    </UICard>

    <UIModal
      v-model="showModal"
      :title="editMode ? 'แก้ไขกลุ่มสาระการเรียนรู้' : 'เพิ่มกลุ่มสาระการเรียนรู้'"
      size="lg"
      :show-default-footer="true"
      :loading="saving"
      @confirm="handleSave"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UIInput v-model="form.name" class="md:col-span-2" label="ชื่อกลุ่มสาระ" placeholder="เช่น กลุ่มสาระคณิตศาสตร์" required />
        <UIInput v-model="form.code" label="รหัส" placeholder="เช่น MATH" required />
        <UISelect
          v-model="form.head"
          label="หัวหน้ากลุ่มสาระ"
          :options="headSelectOptions"
          placeholder="เลือกหัวหน้ากลุ่มสาระ"
        />
        <UIInput v-model="form.description" class="md:col-span-2" label="คำอธิบาย" placeholder="อธิบายขอบเขตรายวิชาในกลุ่มสาระนี้" />
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
        ต้องการลบกลุ่มสาระ
        <span class="font-semibold text-secondary-900">{{ deleteTarget?.name }}</span>
        ใช่หรือไม่?
      </p>
    </UIModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

definePageMeta({ layout: false, middleware: 'auth' })

const { apiFetch } = useApi()
const { success, error } = useToast()

type BaseResponse<T> = { data: T }

type SubjectGroupApiItem = {
  id: string
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

type Option = {
  value: string
  label: string
}

const items = ref<SubjectGroupApiItem[]>([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const errorMessage = ref('')

const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 1 })
const headOptions = ref<Option[]>([])

const columns = [
  { key: 'code', label: 'รหัส' },
  { key: 'name', label: 'ชื่อกลุ่มสาระ' },
  { key: 'head', label: 'หัวหน้ากลุ่มสาระ' },
  { key: 'description', label: 'รายละเอียด' }
]

const filterGroupId = ref('')
const filterHead = ref('')

const showModal = ref(false)
const editMode = ref(false)
const editTarget = ref<SubjectGroupApiItem | null>(null)

const showDeleteModal = ref(false)
const deleteTarget = ref<SubjectGroupApiItem | null>(null)

const form = reactive({
  code: '',
  name: '',
  head: '',
  description: ''
})

const headSelectOptions = computed(() =>
  headOptions.value.map((item) => ({ label: item.label, value: item.value }))
)

const filteredItems = computed(() => {
  return items.value.filter((row) => {
    if (filterGroupId.value && row.id !== filterGroupId.value) return false
    if (filterHead.value && (row.head || '') !== filterHead.value) return false
    return true
  })
})

const pagedItems = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.limit
  const end = start + pagination.value.limit
  return filteredItems.value.slice(start, end)
})

const updatePagination = () => {
  pagination.value.total = filteredItems.value.length
  pagination.value.totalPages = Math.max(1, Math.ceil(filteredItems.value.length / pagination.value.limit))
  if (pagination.value.page > pagination.value.totalPages) {
    pagination.value.page = pagination.value.totalPages
  }
}

const resetForm = () => {
  form.code = ''
  form.name = ''
  form.head = ''
  form.description = ''
}

const displayName = (item: PersonApiItem) => {
  const first = (item.first_name || '').trim()
  const last = (item.last_name || '').trim()
  return `${first} ${last}`.trim()
}

const loadHeadOptions = async () => {
  try {
    const [staffsRes, teachersRes] = await Promise.all([
      apiFetch<BaseResponse<PersonApiItem[]>>('/staffs', { params: { only_active: true } }),
      apiFetch<BaseResponse<PersonApiItem[]>>('/teachers', { params: { only_active: true } })
    ])

    const staffs = Array.isArray(staffsRes?.data) ? staffsRes.data : []
    const teachers = Array.isArray(teachersRes?.data) ? teachersRes.data : []
    const merged = [...staffs, ...teachers]

    const seen = new Set<string>()
    const next: Option[] = []
    for (const row of merged) {
      const name = displayName(row)
      if (!name || seen.has(name)) continue
      seen.add(name)
      next.push({ value: name, label: name })
    }
    headOptions.value = next.sort((a, b) => a.label.localeCompare(b.label, 'th'))
  } catch {
    headOptions.value = []
  }
}

const fetchItems = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await apiFetch<BaseResponse<SubjectGroupApiItem[]>>('/subject-groups', { params: { only_active: false } })
    const payload = response?.data ?? response
    const source = Array.isArray(payload) ? payload : payload ? [payload] : []

    items.value = source.map((item: SubjectGroupApiItem) => ({
      ...item,
      head: (item.head || '').trim() || null,
      description: (item.description || '').trim() || null
    }))

    updatePagination()
  } catch {
    items.value = []
    updatePagination()
    errorMessage.value = 'ไม่สามารถโหลดข้อมูลกลุ่มสาระได้'
    error('ไม่สามารถโหลดข้อมูลกลุ่มสาระได้')
  } finally {
    loading.value = false
  }
}

const refreshAll = async () => {
  await Promise.all([fetchItems(), loadHeadOptions()])
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
}

const handleView = (row: SubjectGroupApiItem) => {
  if (!row?.id) return
  navigateTo(`/admin/subject-groups/${row.id}`)
}

const openCreateModal = () => {
  editMode.value = false
  editTarget.value = null
  resetForm()
  showModal.value = true
}

const handleEdit = (row: SubjectGroupApiItem) => {
  editMode.value = true
  editTarget.value = row
  form.code = row.code
  form.name = row.name
  form.head = row.head || ''
  form.description = row.description || ''
  showModal.value = true
}

const validateForm = () => {
  if (!form.code.trim()) {
    error('กรุณาระบุรหัสกลุ่มสาระ')
    return false
  }
  if (!form.name.trim()) {
    error('กรุณาระบุชื่อกลุ่มสาระ')
    return false
  }
  return true
}

const handleSave = async () => {
  if (!validateForm()) return

  saving.value = true
  errorMessage.value = ''
  try {
    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      head: form.head.trim() || null,
      description: form.description.trim() || null,
      is_active: true
    }

    if (editMode.value && editTarget.value?.id) {
      await apiFetch(`/subject-groups/${editTarget.value.id}`, {
        method: 'PATCH',
        body: payload
      })
      success('แก้ไขกลุ่มสาระสำเร็จ')
    } else {
      await apiFetch('/subject-groups', {
        method: 'POST',
        body: payload
      })
      success('เพิ่มกลุ่มสาระสำเร็จ')
    }

    showModal.value = false
    await fetchItems()
  } catch {
    errorMessage.value = 'บันทึกข้อมูลกลุ่มสาระไม่สำเร็จ'
    error('บันทึกข้อมูลกลุ่มสาระไม่สำเร็จ')
  } finally {
    saving.value = false
  }
}

const openDeleteModal = (row: SubjectGroupApiItem) => {
  deleteTarget.value = row
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!deleteTarget.value?.id) {
    showDeleteModal.value = false
    return
  }

  deleting.value = true
  try {
    await apiFetch(`/subject-groups/${deleteTarget.value.id}`, {
      method: 'DELETE'
    })
    success('ลบกลุ่มสาระสำเร็จ')
    showDeleteModal.value = false
    deleteTarget.value = null
    await fetchItems()
  } catch {
    errorMessage.value = 'ลบข้อมูลกลุ่มสาระไม่สำเร็จ'
    error('ลบข้อมูลกลุ่มสาระไม่สำเร็จ')
  } finally {
    deleting.value = false
  }
}

const clearFilters = () => {
  filterGroupId.value = ''
  filterHead.value = ''
}

const onFilterChange = () => {
  pagination.value.page = 1
}

watch([filterGroupId, filterHead], () => {
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
  refreshAll()
})
</script>
