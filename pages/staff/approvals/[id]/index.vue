<template>
  <AdminDetailPageShell
    page-title="รายละเอียดคำขอ"
    page-description="รายละเอียดคำขอที่ส่งต่อเพื่ออนุมัติ"
    back-path="/staff/approvals"
    :loading="loading"
    :has-data="!!detail"
    not-found-text="ไม่พบข้อมูลคำขอ"
  >
    <AdminApiDetailFields :data="detail || {}" :exclude-keys="['password']" />
  </AdminDetailPageShell>
</template>

<script setup lang="ts">
definePageMeta({ layout: false, middleware: 'auth' })
const route = useRoute()
const { apiFetch } = useApi()
const { error } = useToast()

const detail = ref<Record<string, any> | null>(null)
const loading = ref(false)

const approvalType = computed(() => {
  const value = route.query.type
  if (Array.isArray(value)) return value[0] || 'teachers'
  return value || 'teachers'
})

const fetchDetail = async () => {
  loading.value = true
  try {
    const id = String(route.params.id)
    const response = await apiFetch<any>(`/reports/approvals/${approvalType.value}/${id}`)
    detail.value = response.data ?? response
  } catch {
    detail.value = null
    error('ไม่สามารถโหลดรายละเอียดคำขอได้')
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)
</script>
