<template>
  <NuxtLayout name="admin" page-title="ตั้งค่า" page-description="จัดการข้อมูลโรงเรียนจากระบบจริง">
    <div class="max-w-5xl space-y-6">
      <UICard title="ข้อมูลโรงเรียน">
        <template #header-actions>
          <UIButton variant="detail" icon="lucide:refresh-cw" :loading="loading" @click="loadSchoolSettings">
            รีเฟรช
          </UIButton>
        </template>

        <div class="space-y-3">
          <p v-if="loading" class="text-sm text-primary-700">กำลังโหลดข้อมูลโรงเรียน...</p>
          <p v-if="loadError" class="text-sm text-danger-600">{{ loadError }}</p>
        </div>

        <div class="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
          <UIInput v-model="settings.name" label="ชื่อโรงเรียน" placeholder="กรอกชื่อโรงเรียน" />
          <div>
            <UIInput v-model="settings.themeColor" label="สีธีมโรงเรียน" placeholder="#1d4ed8" />
            <p v-if="settings.themeColor && !isThemeColorValid" class="mt-1 text-xs text-danger-600">
              รูปแบบสีไม่ถูกต้อง ต้องเป็น #RRGGBB เช่น #1D4ED8
            </p>
          </div>
          <UIInput v-model="settings.logoUrl" class="md:col-span-2" label="โลโก้โรงเรียน (URL)" placeholder="https://..." />

          <div class="md:col-span-2 rounded-xl border border-secondary-200 bg-secondary-50 p-4">
            <p class="mb-3 text-sm font-semibold text-secondary-900">ตัวอย่างการแสดงผล</p>
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div
                class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-secondary-200 bg-white"
                :style="{ borderColor: previewThemeColor }"
              >
                <img
                  v-if="settings.logoUrl && !logoPreviewBroken"
                  :src="settings.logoUrl"
                  alt="School logo preview"
                  class="h-full w-full object-contain"
                  @error="handleLogoPreviewError"
                >
                <Icon v-else name="lucide:school" class="h-6 w-6 text-secondary-400" />
              </div>

              <div class="min-w-0 flex-1">
                <p class="truncate text-base font-semibold" :style="{ color: previewThemeColor }">
                  {{ settings.name || 'ชื่อโรงเรียน' }}
                </p>
                <p class="mt-1 text-xs text-secondary-600">
                  {{ settings.address || 'ที่อยู่โรงเรียน' }}
                </p>
              </div>

              <div class="flex items-center gap-2 text-xs text-secondary-600">
                <span class="h-4 w-4 rounded border border-secondary-300" :style="{ backgroundColor: previewThemeColor }" />
                <span>{{ previewThemeColor }}</span>
              </div>
            </div>
          </div>

          <div class="md:col-span-2">
            <label class="label">ที่อยู่</label>
            <textarea v-model="settings.address" class="input min-h-[92px]" rows="3" />
          </div>

          <div class="md:col-span-2">
            <label class="label">รายละเอียด</label>
            <textarea v-model="settings.description" class="input min-h-[92px]" rows="3" />
          </div>
        </div>

        <div class="mt-5 flex justify-end gap-3">
          <UIButton variant="detail" :disabled="saving || loading" @click="resetSettings">
            คืนค่าเดิม
          </UIButton>
          <UIButton variant="primary" icon="lucide:save" :loading="saving" @click="saveSettings">
            บันทึกการตั้งค่า
          </UIButton>
        </div>
      </UICard>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth'
})

type BaseResponse<T> = { data: T }

type SchoolResponse = {
  id: string
  name: string
  logo_url: string | null
  theme_color: string | null
  address: string
  description: string | null
}

const { success, error } = useToast()
const { apiFetch } = useApi()
const authStore = useAuthStore()

const defaultSettings = {
  id: '',
  name: '',
  logoUrl: '',
  themeColor: '',
  address: '',
  description: ''
}

const settings = reactive({ ...defaultSettings })
const lastLoadedSettings = ref({ ...defaultSettings })

const loading = ref(false)
const loadError = ref('')
const saving = ref(false)
const logoPreviewBroken = ref(false)

const schoolId = computed(() => String(authStore.user?.schoolId || '').trim())
const themeHexRegex = /^#[0-9A-Fa-f]{6}$/

const isThemeColorValid = computed(() => {
  const value = settings.themeColor.trim()
  if (!value) return true
  return themeHexRegex.test(value)
})

const previewThemeColor = computed(() => {
  const value = settings.themeColor.trim()
  if (themeHexRegex.test(value)) return value
  return '#1D4ED8'
})

const syncSettingsFromSchool = (school: SchoolResponse) => {
  const mapped = {
    id: school.id,
    name: school.name || '',
    logoUrl: school.logo_url || '',
    themeColor: school.theme_color || '',
    address: school.address || '',
    description: school.description || ''
  }
  Object.assign(settings, mapped)
  lastLoadedSettings.value = { ...mapped }
  logoPreviewBroken.value = false
}

const loadSchoolSettings = async () => {
  if (!schoolId.value) {
    loadError.value = 'ไม่พบ school_id ของผู้ใช้งาน'
    Object.assign(settings, defaultSettings)
    return
  }

  loading.value = true
  loadError.value = ''
  try {
    const res = await apiFetch<BaseResponse<SchoolResponse>>(`/schools/${schoolId.value}`)
    if (!res?.data) {
      throw new Error('empty-response')
    }
    syncSettingsFromSchool(res.data)
  } catch {
    loadError.value = 'ไม่สามารถโหลดข้อมูลโรงเรียนได้'
    error('ไม่สามารถโหลดข้อมูลโรงเรียนได้')
  } finally {
    loading.value = false
  }
}

const resetSettings = () => {
  Object.assign(settings, lastLoadedSettings.value)
  logoPreviewBroken.value = false
  success('คืนค่าการตั้งค่าเรียบร้อย')
}

const handleLogoPreviewError = (event: Event) => {
  logoPreviewBroken.value = true
}

watch(() => settings.logoUrl, () => {
  logoPreviewBroken.value = false
})

const saveSettings = async () => {
  if (!schoolId.value) {
    error('ไม่พบ school_id ของผู้ใช้งาน')
    return
  }

  saving.value = true
  try {
    const payload = {
      name: settings.name.trim(),
      logo_url: settings.logoUrl.trim() || null,
      theme_color: settings.themeColor.trim() || null,
      address: settings.address.trim(),
      description: settings.description.trim() || null
    }

    if (!payload.name) {
      error('กรุณาระบุชื่อโรงเรียน')
      return
    }
    if (!payload.address) {
      error('กรุณาระบุที่อยู่โรงเรียน')
      return
    }
    if (payload.theme_color && !themeHexRegex.test(payload.theme_color)) {
      error('รูปแบบสีธีมไม่ถูกต้อง ต้องเป็น #RRGGBB')
      return
    }

    const res = await apiFetch<BaseResponse<SchoolResponse>>(`/schools/${schoolId.value}`, {
      method: 'PATCH',
      body: payload
    })

    if (res?.data) {
      syncSettingsFromSchool(res.data)
    }

    success('บันทึกการตั้งค่าเรียบร้อย')
  } catch {
    error('ไม่สามารถบันทึกการตั้งค่าได้')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadSchoolSettings()
})
</script>
