<template>
  <AdminDetailPageShell
    page-title="รายละเอียดบุคลากร"
    page-description="ข้อมูลเชิงลึกของบุคลากร"
    back-path="/admin/staff"
    edit-path="/admin/staff"
    :edit-id="String(route.params.id)"
    :loading="loading"
    :has-data="!!staff"
    not-found-text="ไม่พบข้อมูลบุคลากร"
  >
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <AdminDetailField label="รหัสบุคลากร" :value="staff.employeeCode" />
      <AdminDetailField label="ชื่อ-นามสกุล" :value="staff.fullName" />
      <AdminDetailField label="แผนก" :value="staff.department" />
      <AdminDetailField label="ตำแหน่ง" :value="staff.position" />
      <AdminDetailField label="อีเมล" :value="staff.email" />
      <AdminDetailField label="สถานะ">
        <UIBadge :variant="staff.isActive ? 'success' : 'secondary'">
          {{ staff.isActive ? 'ทำงาน' : 'ไม่ทำงาน' }}
        </UIBadge>
      </AdminDetailField>
    </div>
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

const staff = ref<any | null>(null)
const loading = ref(false)

const fetchStaff = async () => {
  loading.value = true
  try {
    const id = String(route.params.id)
    const response = await apiFetch<any>(`/staffs/${id}`)
    staff.value = response.data ?? response
  } catch {
    error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    staff.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStaff()
})
</script>
