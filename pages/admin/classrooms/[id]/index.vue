<template>
  <AdminDetailPageShell
    page-title="รายละเอียดห้องเรียน"
    page-description="ข้อมูลเชิงลึกของห้องเรียน"
    back-path="/admin/classrooms"
    edit-path="/admin/classrooms"
    :edit-id="String(route.params.id)"
    :loading="loading"
    :has-data="!!classroom"
    not-found-text="ไม่พบข้อมูลห้องเรียน"
  >
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <AdminDetailField label="ชื่อห้องเรียน" :value="classroom.name" />
      <AdminDetailField label="ระดับชั้น" :value="classroom.gradeLevel" />
      <AdminDetailField label="กลุ่ม/แผน" :value="classroom.section" />
      <AdminDetailField label="ความจุ" :value="classroom.capacity" />
      <AdminDetailField label="จำนวนนักเรียน" :value="classroom.currentStudents" />
      <AdminDetailField label="สถานะ">
        <UIBadge :variant="classroom.isActive ? 'success' : 'secondary'">
          {{ classroom.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
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

const classroom = ref<any | null>(null)
const loading = ref(false)

const fetchClassroom = async () => {
  loading.value = true
  try {
    const id = String(route.params.id)
    const response = await apiFetch<any>(`/classrooms/${id}`)
    classroom.value = response.data ?? response
  } catch {
    error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    classroom.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchClassroom()
})
</script>
