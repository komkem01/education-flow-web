<template>
  <NuxtLayout name="admin" page-title="กลุ่มวิชา" page-description="จัดการกลุ่มวิชาภายในหลักสูตร">
    <div class="mb-6 flex items-center justify-end">
      <UIButton variant="secondary" icon="lucide:refresh-cw" @click="fetchItems">รีเฟรช</UIButton>
    </div>

    <UICard>
      <UITable :columns="columns" :data="items" :loading="loading" :actions="{ view: true, edit: false, delete: false }" :pagination="pagination" @view="handleView" @page-change="handlePageChange" />
    </UICard>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: false, middleware: 'auth' })

const { apiFetch } = useApi()
const { error } = useToast()

const items = ref<any[]>([])
const loading = ref(false)
const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 0 })

const columns = [
  { key: 'name', label: 'ชื่อกลุ่มวิชา' },
  { key: 'code', label: 'รหัสกลุ่มวิชา' },
  { key: 'description', label: 'รายละเอียด' }
]

const fetchItems = async () => {
  loading.value = true
  try {
    const response = await apiFetch<any>('/subject-groups', { params: { page: pagination.value.page, limit: pagination.value.limit } })
    const payload = response?.data ?? response
    items.value = Array.isArray(payload) ? payload : payload ? [payload] : []
    pagination.value.total = response?.total ?? items.value.length
    pagination.value.totalPages = response?.totalPages ?? 1
  } catch {
    error('ไม่สามารถโหลดข้อมูลกลุ่มวิชาได้')
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
  navigateTo(`/admin/subject-groups/${row.id}`)
}

onMounted(() => {
  fetchItems()
})
</script>
