<template>
  <AdminDetailPageShell
    page-title="รายละเอียดการเข้าเรียน"
    page-description="สถานะการมาเรียนรายวัน"
    back-path="/student/attendance"
    :loading="loading"
    :has-data="!!detail"
    not-found-text="ไม่พบข้อมูลการเข้าเรียน"
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
    const response = await apiFetch<any>(`/students/${String(route.params.id)}/attendance-logs`)
    detail.value = response.data ?? response
  } catch {
    detail.value = null
    error('ไม่สามารถโหลดรายละเอียดการเข้าเรียนได้')
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)
</script>
