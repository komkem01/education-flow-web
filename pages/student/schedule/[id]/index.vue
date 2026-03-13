<template>
  <AdminDetailPageShell
    page-title="รายละเอียดตารางเรียน"
    page-description="รายละเอียดคาบเรียน"
    back-path="/student/schedule"
    :loading="loading"
    :has-data="!!detail"
    not-found-text="ไม่พบข้อมูลตารางเรียน"
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

const fetchDetail = async () => {
  loading.value = true
  try {
    const response = await apiFetch<any>(`/schedules/${String(route.params.id)}`)
    detail.value = response.data ?? response
  } catch {
    detail.value = null
    error('ไม่สามารถโหลดรายละเอียดตารางเรียนได้')
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)
</script>
