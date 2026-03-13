<template>
  <AdminDetailPageShell
    page-title="รายละเอียดครู"
    page-description="ข้อมูลครูที่อยู่ในขอบเขตโรงเรียนของคุณ"
    back-path="/staff/teachers"
    :loading="loading"
    :has-data="!!detail"
    not-found-text="ไม่พบข้อมูลครู"
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
    const response = await apiFetch<any>(`/teachers/${String(route.params.id)}`)
    detail.value = response.data ?? response
  } catch {
    detail.value = null
    error('ไม่สามารถโหลดรายละเอียดครูได้')
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)
</script>
