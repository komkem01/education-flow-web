<template>
  <AdminDetailPageShell
    page-title="รายละเอียดรายวิชา"
    page-description="ข้อมูลเชิงลึกของรายวิชา"
    back-path="/admin/subjects"
    edit-path="/admin/subjects"
    :edit-id="String(route.params.id)"
    :loading="loading"
    :has-data="!!subject"
    not-found-text="ไม่พบข้อมูลรายวิชา"
  >
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <AdminDetailField label="รหัสรายวิชา" :value="subject.code" />
      <AdminDetailField label="ชื่อรายวิชา" :value="subject.name" />
      <AdminDetailField label="ชื่อภาษาอังกฤษ" :value="subject.nameEn" />
      <AdminDetailField label="ระดับชั้น" :value="subject.gradeLevel" />
      <AdminDetailField label="หน่วยกิต" :value="subject.credits" />
      <AdminDetailField label="ประเภท">
        <UIBadge :variant="subject.isRequired ? 'warning' : 'secondary'">
          {{ subject.isRequired ? 'วิชาบังคับ' : 'วิชาเลือก' }}
        </UIBadge>
      </AdminDetailField>
      <AdminDetailField label="สถานะ">
        <UIBadge :variant="subject.isActive ? 'success' : 'secondary'">
          {{ subject.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
        </UIBadge>
      </AdminDetailField>
      <AdminDetailField label="คำอธิบาย" :value="subject.description" />
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

const subject = ref<any | null>(null)
const loading = ref(false)

const fetchSubject = async () => {
  loading.value = true
  try {
    const id = String(route.params.id)
    const response = await apiFetch<any>(`/subjects/${id}`)
    subject.value = response.data ?? response
  } catch {
    error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    subject.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSubject()
})
</script>
