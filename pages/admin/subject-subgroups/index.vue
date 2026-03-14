<template>
  <NuxtLayout name="admin" page-title="กลุ่มย่อยสาระการเรียนรู้" page-description="จัดการกลุ่มย่อยสาระการเรียนรู้ภายใต้กลุ่มสาระหลัก">
    <div class="mb-6 flex items-center justify-between gap-3">
      <div class="flex-1 text-sm text-secondary-600">ทั้งหมด {{ pagination.total }} รายการ</div>
      <div class="flex items-center gap-2">
        <UIButton variant="secondary" icon="lucide:refresh-cw" @click="refreshAll">รีเฟรช</UIButton>
        <UIButton variant="primary" icon="lucide:plus" @click="openCreateModal">เพิ่มกลุ่มย่อย</UIButton>
      </div>
    </div>

    <UICard v-if="errorMessage" class="mb-4">
      <p class="text-sm text-danger-600">{{ errorMessage }}</p>
    </UICard>

    <UICard class="mb-4">
      <div class="flex flex-nowrap items-center gap-2 overflow-x-auto">
        <select v-model="filterSubgroupId" class="input min-w-[220px]" @change="onFilterChange">
          <option value="">ทุกกลุ่มย่อย</option>
          <option v-for="row in items" :key="row.id" :value="row.id">{{ row.name }}</option>
        </select>
        <select v-model="filterParentGroupId" class="input min-w-[220px]" @change="onFilterChange">
          <option value="">ทุกกลุ่มสาระหลัก</option>
          <option v-for="g in groupOptions" :key="g.value" :value="g.value">{{ g.label }}</option>
        </select>
        <UIButton v-if="filterSubgroupId || filterParentGroupId" variant="detail" @click="clearFilters">ล้างตัวกรอง</UIButton>
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
      :title="editMode ? 'แก้ไขกลุ่มย่อยสาระ' : 'เพิ่มกลุ่มย่อยสาระ'"
      size="lg"
      :show-default-footer="true"
      :loading="saving"
      @confirm="handleSave"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UIInput v-model="form.name" class="md:col-span-2" label="ชื่อกลุ่มย่อย" placeholder="เช่น ฟิสิกส์" required />
        <UIInput v-model="form.code" label="รหัส" placeholder="เช่น SCI-02" required />
        <UISelect
          v-model="form.subjectGroupId"
          label="กลุ่มสาระหลัก"
          :options="groupOptions"
          placeholder="เลือกกลุ่มสาระหลัก"
          required
        />
        <UIInput v-model="form.description" class="md:col-span-2" label="คำอธิบาย" placeholder="อธิบายขอบเขตกลุ่มย่อยนี้" />
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
        ต้องการลบกลุ่มย่อย
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
  name: string
}

type SubjectSubgroupApiItem = {
  id: string
  subject_group_id: string
  code: string
  name: string
  description: string | null
  is_active: boolean
}

type SubjectSubgroupRow = {
  id: string
  subject_group_id: string
  code: string
  name: string
  parentGroup: string
  description: string
  is_active: boolean
}

const items = ref<SubjectSubgroupRow[]>([])
const groups = ref<SubjectGroupApiItem[]>([])

const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const errorMessage = ref('')
const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 1 })

const columns = [
  { key: 'code', label: 'รหัส' },
  { key: 'name', label: 'ชื่อกลุ่มย่อย' },
  { key: 'parentGroup', label: 'กลุ่มสาระหลัก' },
  { key: 'description', label: 'รายละเอียด' }
]

const filterSubgroupId = ref('')
const filterParentGroupId = ref('')

const showModal = ref(false)
const editMode = ref(false)
const editTarget = ref<SubjectSubgroupRow | null>(null)

const showDeleteModal = ref(false)
const deleteTarget = ref<SubjectSubgroupRow | null>(null)

const form = reactive({
  code: '',
  name: '',
  subjectGroupId: '',
  description: ''
})

const groupLabelById = computed(() => new Map(groups.value.map((item) => [item.id, item.name] as const)))

const groupOptions = computed(() =>
  groups.value
    .map((item) => ({ value: item.id, label: item.name }))
    .sort((a, b) => a.label.localeCompare(b.label, 'th'))
)

const filteredItems = computed(() => {
  return items.value.filter((row) => {
    if (filterSubgroupId.value && row.id !== filterSubgroupId.value) return false
    if (filterParentGroupId.value && row.subject_group_id !== filterParentGroupId.value) return false
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

const toRow = (item: SubjectSubgroupApiItem): SubjectSubgroupRow => ({
  id: item.id,
  subject_group_id: item.subject_group_id,
  code: item.code,
  name: item.name,
  parentGroup: groupLabelById.value.get(item.subject_group_id) || '-',
  description: (item.description || '').trim() || '-',
  is_active: item.is_active
})

const resetForm = () => {
  form.code = ''
  form.name = ''
  form.subjectGroupId = ''
  form.description = ''
}

const fetchGroups = async () => {
  const response = await apiFetch<BaseResponse<SubjectGroupApiItem[]>>('/subject-groups', { params: { only_active: false } })
  const payload = response?.data ?? response
  groups.value = Array.isArray(payload) ? payload : payload ? [payload] : []
}

const fetchItems = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await apiFetch<BaseResponse<SubjectSubgroupApiItem[]>>('/subject-subgroups', { params: { only_active: false } })
    const payload = response?.data ?? response
    const source: SubjectSubgroupApiItem[] = Array.isArray(payload) ? payload : payload ? [payload] : []
    items.value = source.map(toRow)
    updatePagination()
  } catch {
    items.value = []
    updatePagination()
    errorMessage.value = 'ไม่สามารถโหลดข้อมูลกลุ่มย่อยสาระได้'
    error('ไม่สามารถโหลดข้อมูลกลุ่มย่อยสาระได้')
  } finally {
    loading.value = false
  }
}

const refreshAll = async () => {
  try {
    await fetchGroups()
    await fetchItems()
  } catch {
    errorMessage.value = 'ไม่สามารถโหลดข้อมูลอ้างอิงได้'
    error('ไม่สามารถโหลดข้อมูลอ้างอิงได้')
  }
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
}

const handleView = (row: SubjectSubgroupRow) => {
  if (!row?.id) return
  navigateTo(`/admin/subject-subgroups/${row.id}`)
}

const openCreateModal = () => {
  editMode.value = false
  editTarget.value = null
  resetForm()
  showModal.value = true
}

const handleEdit = (row: SubjectSubgroupRow) => {
  editMode.value = true
  editTarget.value = row
  form.code = row.code
  form.name = row.name
  form.subjectGroupId = row.subject_group_id
  form.description = row.description === '-' ? '' : row.description
  showModal.value = true
}

const validateForm = () => {
  if (!form.code.trim()) {
    error('กรุณาระบุรหัสกลุ่มย่อย')
    return false
  }
  if (!form.name.trim()) {
    error('กรุณาระบุชื่อกลุ่มย่อย')
    return false
  }
  if (!form.subjectGroupId) {
    error('กรุณาเลือกกลุ่มสาระหลัก')
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
      subject_group_id: form.subjectGroupId,
      code: form.code.trim(),
      name: form.name.trim(),
      description: form.description.trim() || null,
      is_active: true
    }

    if (editMode.value && editTarget.value?.id) {
      await apiFetch(`/subject-subgroups/${editTarget.value.id}`, {
        method: 'PATCH',
        body: payload
      })
      success('แก้ไขกลุ่มย่อยสำเร็จ')
    } else {
      await apiFetch('/subject-subgroups', {
        method: 'POST',
        body: payload
      })
      success('เพิ่มกลุ่มย่อยสำเร็จ')
    }

    showModal.value = false
    await fetchItems()
  } catch {
    errorMessage.value = 'บันทึกข้อมูลกลุ่มย่อยไม่สำเร็จ'
    error('บันทึกข้อมูลกลุ่มย่อยไม่สำเร็จ')
  } finally {
    saving.value = false
  }
}

const openDeleteModal = (row: SubjectSubgroupRow) => {
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
    await apiFetch(`/subject-subgroups/${deleteTarget.value.id}`, {
      method: 'DELETE'
    })
    success('ลบกลุ่มย่อยสำเร็จ')
    showDeleteModal.value = false
    deleteTarget.value = null
    await fetchItems()
  } catch {
    errorMessage.value = 'ลบข้อมูลกลุ่มย่อยไม่สำเร็จ'
    error('ลบข้อมูลกลุ่มย่อยไม่สำเร็จ')
  } finally {
    deleting.value = false
  }
}

const clearFilters = () => {
  filterSubgroupId.value = ''
  filterParentGroupId.value = ''
}

const onFilterChange = () => {
  pagination.value.page = 1
}

watch([filterSubgroupId, filterParentGroupId], () => {
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
