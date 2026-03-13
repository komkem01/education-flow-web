<template>
  <NuxtLayout name="admin" page-title="รายละเอียดข้อมูลโรงเรียน" page-description="ข้อมูลพื้นฐานของโรงเรียน">
    <div class="mb-4">
      <UIButton variant="detail" icon="lucide:arrow-left" @click="navigateTo('/admin/schools')">
        กลับหน้าข้อมูลโรงเรียน
      </UIButton>
    </div>

    <p v-if="loading" class="text-sm text-secondary-600">กาลังโหลดข้อมูล...</p>
    <p v-else-if="errorMessage" class="text-sm text-danger-600">{{ errorMessage }}</p>

    <UICard v-else-if="school" class="space-y-3">
      <div class="rounded-lg border border-secondary-200 p-3">
        <p class="text-xs text-secondary-500">ชื่อโรงเรียน</p>
        <p class="text-sm text-secondary-900">{{ school.name || '-' }}</p>
      </div>
      <div class="rounded-lg border border-secondary-200 p-3">
        <p class="text-xs text-secondary-500">ที่อยู่</p>
        <p class="text-sm text-secondary-900">{{ school.address || '-' }}</p>
      </div>
      <div class="rounded-lg border border-secondary-200 p-3">
        <p class="text-xs text-secondary-500">คาอธิบาย</p>
        <p class="text-sm text-secondary-900">{{ school.description || '-' }}</p>
      </div>
      <div class="rounded-lg border border-secondary-200 p-3">
        <p class="text-xs text-secondary-500">สีธีม</p>
        <p class="text-sm text-secondary-900">{{ school.theme_color || '-' }}</p>
      </div>
      <div class="rounded-lg border border-secondary-200 p-3">
        <p class="text-xs text-secondary-500">โลโก้</p>
        <a
          v-if="school.logo_url"
          class="text-sm text-primary-700 hover:underline"
          :href="school.logo_url"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ school.logo_url }}
        </a>
        <p v-else class="text-sm text-secondary-900">-</p>
      </div>
    </UICard>
  </NuxtLayout>
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
const errorMessage = ref('')

const fetchSchool = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await apiFetch<any>(`/schools/${schoolId.value}`)
    school.value = response.data ?? response
  } catch {
    error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    errorMessage.value = 'ไม่สามารถโหลดรายละเอียดโรงเรียนได้'
    school.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSchool()
})
</script>
