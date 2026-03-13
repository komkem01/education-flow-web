<template>
  <AdminDetailPageShell
    page-title="รายละเอียดการชำระเงิน"
    page-description="ข้อมูลใบแจ้งหนี้และสถานะการชำระ"
    back-path="/parent/payments"
    :loading="loading"
    :has-data="!!detail"
    not-found-text="ไม่พบข้อมูลการชำระเงิน"
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
    const response = await apiFetch<any>(`/students/${String(route.params.id)}/payment-transactions`)
    detail.value = response.data ?? response
  } catch {
    detail.value = null
    error('ไม่สามารถโหลดรายละเอียดการชำระเงินได้')
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)
</script>
