<template>
  <AdminDetailPageShell
    page-title="รายละเอียดรายวิชา"
    page-description="ข้อมูลรายวิชาที่คุณรับผิดชอบ"
    back-path="/teacher/subjects"
    :loading="loading"
    :has-data="!!detail"
    not-found-text="ไม่พบรายวิชา"
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
    const response = await apiFetch<any>(`/subjects/${String(route.params.id)}`)
    detail.value = response.data ?? response
  } catch {
    detail.value = null
    error('ไม่สามารถโหลดรายละเอียดรายวิชาได้')
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)
</script>
