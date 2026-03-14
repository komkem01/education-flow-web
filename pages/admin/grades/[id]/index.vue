<template>
  <AdminDetailPageShell
    page-title="รายละเอียดผลการเรียน"
    page-description="ข้อมูลเชิงลึกของรายการผลการเรียน"
    back-path="/admin/grades"
    :loading="loading"
    :has-data="!!item"
    not-found-text="ไม่พบข้อมูลผลการเรียน"
  >
    <AdminApiDetailFields v-if="item" :data="item" :exclude-keys="excludeKeys" />
  </AdminDetailPageShell>
</template>

<script setup lang="ts">
definePageMeta({ layout: false, middleware: 'auth' })

const route = useRoute()
const { apiFetch } = useApi()
const { error } = useToast()

const item = ref<Record<string, any> | null>(null)
const loading = ref(false)
const excludeKeys = ['deleted_at']

const fetchItem = async () => {
  loading.value = true
  try {
    const id = String(route.params.id)
    const studentId = String(route.query.student_id || '')
    if (!studentId) {
      item.value = null
      return
    }
    const response = await apiFetch<any>(`/back-office/students/${encodeURIComponent(studentId)}/grade-records`)
    const list = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
    item.value = list.find((entry: any) => String(entry?.id) === id) || null
  } catch {
    error('ไม่สามารถโหลดรายละเอียดผลการเรียนได้')
    item.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchItem()
})
</script>
