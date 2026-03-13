<template>
  <AdminDetailPageShell
    page-title="รายละเอียดบุตรหลาน"
    page-description="ผลการเรียนและสถานะการเข้าเรียน"
    back-path="/parent/children"
    :loading="loading"
    :has-data="!!detail"
    not-found-text="ไม่พบข้อมูลบุตรหลาน"
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
    const response = await apiFetch<any>(`/students/${String(route.params.id)}`)
    detail.value = response.data ?? response
  } catch {
    detail.value = null
    error('ไม่สามารถโหลดรายละเอียดบุตรหลานได้')
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)
</script>
