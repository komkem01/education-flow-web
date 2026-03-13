<template>
  <AdminDetailPageShell
    page-title="รายละเอียดโรงเรียน"
    page-description="ข้อมูลเชิงลึกของโรงเรียน"
    back-path="/admin/schools"
    edit-path="/admin/schools"
    :edit-id="schoolId"
    :loading="loading"
    :has-data="!!school"
    not-found-text="ไม่พบข้อมูลโรงเรียน"
  >
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <AdminDetailField label="รหัสโรงเรียน" :value="school.code" />
      <AdminDetailField label="ชื่อโรงเรียน" :value="school.name" />
      <AdminDetailField label="อีเมล" :value="school.email" />
      <AdminDetailField label="เบอร์โทรศัพท์" :value="school.phoneNumber" />
      <AdminDetailField label="ผู้อำนวยการ" :value="school.director" />
      <AdminDetailField label="สถานะ">
        <UIBadge :variant="school.isActive ? 'success' : 'secondary'">
          {{ school.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
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
const schoolId = computed(() => String(route.params.id ?? ''))

const school = ref<any | null>(null)
const loading = ref(false)

const fetchSchool = async () => {
  loading.value = true
  try {
    const response = await apiFetch<any>(`/schools/${schoolId.value}`)
    school.value = response.data ?? response
  } catch {
    error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    school.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSchool()
})
</script>
