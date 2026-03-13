<template>
  <AdminDetailPageShell
    page-title="รายละเอียดพฤติกรรม"
    page-description="ข้อมูลเชิงลึกของบันทึกพฤติกรรมนักเรียน"
    back-path="/admin/behavior"
    :loading="loading"
    :has-data="!!item"
    not-found-text="ไม่พบข้อมูลพฤติกรรม"
  >
    <AdminApiDetailFields v-if="item" :data="item" :exclude-keys="excludeKeys" />
  </AdminDetailPageShell>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth'
})

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
    const response = await apiFetch<any>(`/student-behaviors/${id}`)
    item.value = response.data ?? response
  } catch {
    error('ไม่สามารถโหลดรายละเอียดพฤติกรรมได้')
    item.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchItem()
})
</script>
