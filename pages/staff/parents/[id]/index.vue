<template>
  <AdminDetailPageShell
    page-title="รายละเอียดผู้ปกครอง"
    page-description="ข้อมูลผู้ปกครองที่เชื่อมกับนักเรียน"
    back-path="/staff/parents"
    :loading="loading"
    :has-data="!!detail"
    not-found-text="ไม่พบข้อมูลผู้ปกครอง"
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
    const response = await apiFetch<any>(`/parents/${String(route.params.id)}`)
    detail.value = response.data ?? response
  } catch {
    detail.value = null
    error('ไม่สามารถโหลดรายละเอียดผู้ปกครองได้')
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)
</script>
