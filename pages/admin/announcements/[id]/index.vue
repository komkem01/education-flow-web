<template>
  <AdminDetailPageShell
    page-title="รายละเอียดประกาศ"
    page-description="ข้อมูลเชิงลึกของประกาศโรงเรียน"
    back-path="/admin/announcements"
    :loading="loading"
    :has-data="!!item"
    not-found-text="ไม่พบข้อมูลประกาศ"
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
    const response = await apiFetch<any>(`/school-announcements/${id}`)
    item.value = response.data ?? response
  } catch {
    error('ไม่สามารถโหลดรายละเอียดประกาศได้')
    item.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchItem()
})
</script>
