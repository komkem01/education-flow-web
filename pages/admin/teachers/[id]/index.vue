<template>
  <AdminDetailPageShell
    page-title="รายละเอียดครู"
    page-description="ข้อมูลเชิงลึกของครู"
    back-path="/admin/teachers"
    edit-path="/admin/teachers"
    :edit-id="String(route.params.id)"
    :loading="loading"
    :has-data="!!teacher"
    not-found-text="ไม่พบข้อมูลครู"
  >
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <AdminDetailField label="รหัสครู" :value="teacher.teacherCode" />
      <AdminDetailField label="ชื่อ-นามสกุล" :value="teacher.fullName" />
      <AdminDetailField label="กลุ่มสาระการเรียนรู้" :value="teacher.department" />
      <AdminDetailField label="ตำแหน่ง" :value="teacher.position" />
      <AdminDetailField label="อีเมล" :value="teacher.email" />
      <AdminDetailField label="สถานะ">
        <UIBadge :variant="teacher.isActive ? 'success' : 'secondary'">
          {{ teacher.isActive ? 'ทำงาน' : 'ไม่ทำงาน' }}
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

const teacher = ref<any | null>(null)
const loading = ref(false)

const fetchTeacher = async () => {
  loading.value = true
  try {
    const id = String(route.params.id)
    const response = await apiFetch<any>(`/teachers/${id}`)
    teacher.value = response.data ?? response
  } catch {
    error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    teacher.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTeacher()
})
</script>
