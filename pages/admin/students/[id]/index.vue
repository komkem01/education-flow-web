<template>
  <AdminDetailPageShell
    page-title="รายละเอียดนักเรียน"
    page-description="ข้อมูลเชิงลึกของนักเรียน"
    back-path="/admin/students"
    edit-path="/admin/students"
    :edit-id="String(route.params.id)"
    :loading="loading"
    :has-data="!!student"
    not-found-text="ไม่พบข้อมูลนักเรียน"
  >
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <AdminDetailField label="รหัสนักเรียน" :value="student.studentCode" />
      <AdminDetailField label="ชื่อ-นามสกุล" :value="student.fullName" />
      <AdminDetailField label="ระดับชั้น" :value="student.gradeLevel" />
      <AdminDetailField label="เพศ" :value="student.gender" />
      <AdminDetailField label="เบอร์ติดต่อฉุกเฉิน" :value="student.emergencyPhone" />
      <AdminDetailField label="สถานะ">
        <UIBadge :variant="student.isActive ? 'success' : 'secondary'">
          {{ student.isActive ? 'กำลังศึกษา' : 'ไม่ได้ศึกษา' }}
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

const student = ref<any | null>(null)
const loading = ref(false)

const fetchStudent = async () => {
  loading.value = true
  try {
    const id = String(route.params.id)
    const response = await apiFetch<any>(`/students/${id}`)
    student.value = response.data ?? response
  } catch {
    error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    student.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStudent()
})
</script>
