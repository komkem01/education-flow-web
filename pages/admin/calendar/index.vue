<template>
  <NuxtLayout name="admin" page-title="ปฏิทินโรงเรียน" page-description="จัดการกิจกรรมและวันสำคัญของโรงเรียน">
    <div class="mb-6 flex items-center justify-end">
      <UIButton variant="secondary" icon="lucide:refresh-cw" @click="fetchItems">
        รีเฟรช
      </UIButton>
    </div>

    <UICard>
      <UITable
        :columns="columns"
        :data="items"
        :loading="loading"
        :actions="{ view: true, edit: false, delete: false }"
        :pagination="pagination"
        @view="handleView"
        @page-change="handlePageChange"
      >
        <template #cell-start_date="{ value }">
          {{ formatDate(value) }}
        </template>
      </UITable>
    </UICard>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth'
})

const { apiFetch } = useApi()
const { error } = useToast()

const items = ref<any[]>([])
const loading = ref(false)
const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 0 })

const columns = [
  { key: 'name', label: 'กิจกรรม' },
  { key: 'description', label: 'รายละเอียด' },
  { key: 'start_date', label: 'วันที่เริ่ม' }
]

const formatDate = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('th-TH')
}

const fetchItems = async () => {
  loading.value = true
  try {
    const response = await apiFetch<any>('/school-calendar-events', {
      params: { page: pagination.value.page, limit: pagination.value.limit }
    })
    const payload = response?.data ?? response
    items.value = Array.isArray(payload) ? payload : payload ? [payload] : []
    pagination.value.total = response?.total ?? items.value.length
    pagination.value.totalPages = response?.totalPages ?? 1
  } catch {
    error('ไม่สามารถโหลดข้อมูลปฏิทินได้')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  fetchItems()
}

const handleView = (row: any) => {
  if (!row?.id) return
  navigateTo(`/admin/calendar/${row.id}`)
}

onMounted(() => {
  fetchItems()
})
</script>
