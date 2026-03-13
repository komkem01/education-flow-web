<template>
  <NuxtLayout name="admin" page-title="ตั้งค่า" page-description="ตั้งค่าระบบพื้นฐานสำหรับผู้ดูแล">
    <div class="max-w-5xl space-y-6">
      <UICard title="ข้อมูลโรงเรียน">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <UIInput v-model="settings.schoolName" label="ชื่อโรงเรียน" placeholder="กรอกชื่อโรงเรียน" />
          <UIInput v-model="settings.schoolEmail" label="อีเมลโรงเรียน" type="email" placeholder="school@example.com" />
          <UIInput v-model="settings.schoolPhone" label="เบอร์โทรโรงเรียน" placeholder="02-xxx-xxxx" />
          <UIInput v-model="settings.schoolWebsite" label="เว็บไซต์" placeholder="https://example.com" />
        </div>
      </UICard>

      <UICard title="การแจ้งเตือน">
        <div class="space-y-3">
          <label class="flex items-center justify-between rounded-lg border border-secondary-200 p-3">
            <div>
              <p class="text-sm font-medium text-secondary-900">แจ้งเตือนคำขออนุมัติใหม่</p>
              <p class="text-xs text-secondary-600">ส่งแจ้งเตือนเมื่อมีคำขอใหม่เข้าระบบ</p>
            </div>
            <input v-model="settings.notifyApproval" type="checkbox" class="h-4 w-4 rounded border-secondary-300 text-primary-600" />
          </label>

          <label class="flex items-center justify-between rounded-lg border border-secondary-200 p-3">
            <div>
              <p class="text-sm font-medium text-secondary-900">แจ้งเตือนทางอีเมล</p>
              <p class="text-xs text-secondary-600">ส่งอีเมลสรุปรายวันให้ผู้ดูแลระบบ</p>
            </div>
            <input v-model="settings.notifyEmail" type="checkbox" class="h-4 w-4 rounded border-secondary-300 text-primary-600" />
          </label>
        </div>
      </UICard>

      <UICard title="ความปลอดภัย">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <UISelect
            v-model="settings.sessionTimeout"
            label="หมดเวลาเซสชัน"
            :options="sessionOptions"
          />
          <UISelect
            v-model="settings.passwordPolicy"
            label="นโยบายรหัสผ่าน"
            :options="passwordPolicyOptions"
          />
        </div>
      </UICard>

      <div class="flex justify-end gap-3">
        <UIButton variant="secondary" @click="resetSettings">
          คืนค่าเดิม
        </UIButton>
        <UIButton variant="primary" icon="lucide:save" :loading="saving" @click="saveSettings">
          บันทึกการตั้งค่า
        </UIButton>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth'
})

const { success, error } = useToast()

const defaultSettings = {
  schoolName: 'Education Flow School',
  schoolEmail: 'school@example.com',
  schoolPhone: '02-000-0000',
  schoolWebsite: 'https://example.com',
  notifyApproval: true,
  notifyEmail: false,
  sessionTimeout: '30',
  passwordPolicy: 'medium'
}

const settings = reactive({ ...defaultSettings })
const saving = ref(false)

const sessionOptions = [
  { label: '15 นาที', value: '15' },
  { label: '30 นาที', value: '30' },
  { label: '60 นาที', value: '60' }
]

const passwordPolicyOptions = [
  { label: 'พื้นฐาน', value: 'basic' },
  { label: 'ปานกลาง', value: 'medium' },
  { label: 'เข้มงวด', value: 'strict' }
]

const resetSettings = () => {
  Object.assign(settings, defaultSettings)
  success('คืนค่าการตั้งค่าเรียบร้อย')
}

const saveSettings = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 400))
    success('บันทึกการตั้งค่าเรียบร้อย')
  } catch {
    error('ไม่สามารถบันทึกการตั้งค่าได้')
  } finally {
    saving.value = false
  }
}
</script>
