<template>
  <AdminDetailPageShell
    page-title="รายละเอียดผลการเรียน"
    page-description="คะแนนและเกรดรายรายการ"
    back-path="/student/grades"
    :loading="loading"
    :has-data="!!detail"
    not-found-text="ไม่พบข้อมูลผลการเรียน"
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
    const response = await apiFetch<any>(`/students/${String(route.params.id)}/grade-records`)
    detail.value = response.data ?? response
  } catch {
    detail.value = null
    error('ไม่สามารถโหลดรายละเอียดผลการเรียนได้')
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)
</script>
