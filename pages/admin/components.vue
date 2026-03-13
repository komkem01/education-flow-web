<template>
  <NuxtLayout name="admin" page-title="UI Components" page-description="ตัวอย่างการใช้งาน Components ทั้งหมด">
    <!-- Breadcrumb Example -->
    <UICard title="Breadcrumb" class="mb-6">
      <UIBreadcrumb :items="breadcrumbItems" />
    </UICard>

    <!-- Pagination Example -->
    <UICard title="Pagination" class="mb-6">
      <UIPagination
        v-model="currentPage"
        :total-pages="10"
        :total="100"
        :page-size="10"
        :show-info="true"
      />
    </UICard>

    <!-- Loading & Spinner Example -->
    <UICard title="Loading & Spinner" class="mb-6">
      <div class="space-y-4">
        <div>
          <h4 class="text-sm font-medium mb-2">Spinners (ขนาดต่างๆ)</h4>
          <div class="flex items-center gap-4">
            <UISpinner size="xs" />
            <UISpinner size="sm" />
            <UISpinner size="md" />
            <UISpinner size="lg" />
            <UISpinner size="xl" />
          </div>
        </div>

        <div>
          <h4 class="text-sm font-medium mb-2">Loading States</h4>
          <div class="flex flex-wrap gap-3">
            <UILoading show text="กำลังโหลด..." />
            <UIButton variant="primary" @click="showFullscreenLoading = true">
              Show Fullscreen Loading
            </UIButton>
            <UIButton variant="secondary" @click="showOverlayLoading = true">
              Show Overlay Loading (in Card)
            </UIButton>
          </div>
        </div>

        <!-- Example with overlay -->
        <div class="relative">
          <UICard title="Card with Overlay Loading">
            <p class="text-sm text-secondary-600">
              คลิกปุ่มด้านบนเพื่อแสดง Loading Overlay บนการ์ดนี้
            </p>
            <UILoading :overlay="showOverlayLoading" text="กำลังโหลดข้อมูล..." />
          </UICard>
        </div>
      </div>
    </UICard>

    <!-- Dropdown Example -->
    <UICard title="Dropdown" class="mb-6">
      <div class="flex flex-wrap gap-3">
        <UIDropdown
          trigger-text="Actions"
          button-variant="primary"
          :items="dropdownItems"
          @select="handleDropdownSelect"
        />

        <UIDropdown
          trigger-text="เลือก"
          button-variant="secondary"
          position="end"
          :items="dropdownItems"
        />

        <UIDropdown
          button-variant="success"
          width="lg"
          :items="dropdownWithIcons"
        >
          <template #trigger>
            <Icon name="lucide:settings" class="w-4 h-4 mr-2" />
            <span>ตั้งค่า</span>
            <Icon name="lucide:chevron-down" class="w-4 h-4 ml-2" />
          </template>
        </UIDropdown>
      </div>
    </UICard>

    <!-- Toast Examples -->
    <UICard title="Toast Notifications" class="mb-6">
      <div class="flex flex-wrap gap-3">
        <UIButton variant="success" @click="showSuccessToast">
          Show Success
        </UIButton>
        <UIButton variant="danger" @click="showErrorToast">
          Show Error
        </UIButton>
        <UIButton variant="warning" @click="showWarningToast">
          Show Warning
        </UIButton>
        <UIButton variant="primary" @click="showInfoToast">
          Show Info
        </UIButton>
      </div>
    </UICard>

    <!-- Modal Example -->
    <UICard title="Modal" class="mb-6">
      <div class="flex flex-wrap gap-3">
        <UIButton variant="primary" @click="showExampleModal = true">
          Open Modal (Small)
        </UIButton>
        <UIButton variant="secondary" @click="showLargeModal = true">
          Open Modal (Large)
        </UIButton>
        <UIButton variant="warning" @click="showConfirmModal = true">
          Confirm Modal
        </UIButton>
      </div>
    </UICard>

    <!-- Badges Example -->
    <UICard title="Badges" class="mb-6">
      <div class="flex flex-wrap gap-2">
        <UIBadge variant="primary">Primary</UIBadge>
        <UIBadge variant="secondary">Secondary</UIBadge>
        <UIBadge variant="success">Success</UIBadge>
        <UIBadge variant="warning">Warning</UIBadge>
        <UIBadge variant="danger">Danger</UIBadge>
      </div>
    </UICard>

    <!-- Buttons Example -->
    <UICard title="Buttons" class="mb-6">
      <div class="space-y-4">
        <div>
          <h4 class="text-sm font-medium mb-2">Variants</h4>
          <div class="flex flex-wrap gap-2">
            <UIButton variant="primary">Primary</UIButton>
            <UIButton variant="secondary">Secondary</UIButton>
            <UIButton variant="success">Success</UIButton>
            <UIButton variant="warning">Warning</UIButton>
            <UIButton variant="danger">Danger</UIButton>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-medium mb-2">Action Buttons</h4>
          <div class="flex flex-wrap gap-2">
            <UIButton variant="detail" icon="lucide:eye">Detail</UIButton>
            <UIButton variant="edit" icon="lucide:pencil">Edit</UIButton>
            <UIButton variant="delete" icon="lucide:trash-2">Delete</UIButton>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-medium mb-2">Sizes</h4>
          <div class="flex flex-wrap items-center gap-2">
            <UIButton size="sm">Small</UIButton>
            <UIButton>Medium</UIButton>
            <UIButton size="lg">Large</UIButton>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-medium mb-2">States</h4>
          <div class="flex flex-wrap gap-2">
            <UIButton loading>Loading...</UIButton>
            <UIButton disabled>Disabled</UIButton>
            <UIButton icon="lucide:plus">With Icon</UIButton>
          </div>
        </div>
      </div>
    </UICard>

    <!-- Modals -->
    <UIModal
      v-model="showExampleModal"
      title="ตัวอย่าง Modal"
      size="sm"
      show-default-footer
      @confirm="handleModalConfirm"
    >
      <p class="text-secondary-600">นี่คือเนื้อหาในแบบฟอร์ม Modal</p>
    </UIModal>

    <UIModal
      v-model="showLargeModal"
      title="Modal ขนาดใหญ่"
      size="xl"
      show-default-footer
    >
      <div class="space-y-4">
        <UIInput v-model="formData.name" label="ชื่อ" placeholder="กรอกชื่อ" />
        <UIInput v-model="formData.email" label="อีเมล" type="email" placeholder="กรอกอีเมล" />
        <UISelect
          v-model="formData.role"
          label="บทบาท"
          :options="[
            { label: 'Admin', value: 'admin' },
            { label: 'Staff', value: 'staff' },
            { label: 'Teacher', value: 'teacher' }
          ]"
        />
      </div>
    </UIModal>

    <UIModal
      v-model="showConfirmModal"
      title="ยืนยันการดำเนินการ"
      size="sm"
    >
      <div class="text-center py-4">
        <Icon name="lucide:alert-triangle" class="w-16 h-16 text-warning-500 mx-auto mb-4" />
        <p class="text-secondary-900 font-medium mb-2">คุณแน่ใจหรือไม่?</p>
        <p class="text-sm text-secondary-600">การดำเนินการนี้ไม่สามารถยกเลิกได้</p>
      </div>

      <template #footer>
        <UIButton variant="secondary" @click="showConfirmModal = false">
          ยกเลิก
        </UIButton>
        <UIButton variant="danger" @click="handleConfirmAction">
          ยืนยัน
        </UIButton>
      </template>
    </UIModal>

    <!-- Fullscreen Loading -->
    <UILoading :fullscreen="showFullscreenLoading" text="กำลังโหลด กรุณารอสักครู่..." />
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth'
})

const { success, error, warning, info } = useToast()

// Breadcrumb
const breadcrumbItems = [
  { label: 'หน้าแรก', path: '/admin', icon: 'lucide:home' },
  { label: 'เอกสาร', path: '/admin/documents' },
  { label: 'เพิ่มเอกสาร', current: true }
]

// Pagination
const currentPage = ref(1)

// Loading
const showFullscreenLoading = ref(false)
const showOverlayLoading = ref(false)

// Auto hide loading after 3s
watch(showFullscreenLoading, (value) => {
  if (value) {
    setTimeout(() => {
      showFullscreenLoading.value = false
    }, 3000)
  }
})

watch(showOverlayLoading, (value) => {
  if (value) {
    setTimeout(() => {
      showOverlayLoading.value = false
    }, 2000)
  }
})

// Dropdown
const dropdownItems = [
  { label: 'แก้ไข', value: 'edit' },
  { label: 'ลบ', value: 'delete' },
  { label: 'ดูรายละเอียด', value: 'view' }
]

const dropdownWithIcons = [
  { label: 'โปรไฟล์', value: 'profile', icon: 'lucide:user' },
  { label: 'ตั้งค่า', value: 'settings', icon: 'lucide:settings' },
  { label: 'ออกจากระบบ', value: 'logout', icon: 'lucide:log-out' }
]

const handleDropdownSelect = (item: any) => {
  console.log('Selected:', item)
  success(`เลือก: ${item.label}`)
}

// Toast
const showSuccessToast = () => success('บันทึกข้อมูลสำเร็จ!')
const showErrorToast = () => error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
const showWarningToast = () => warning('คำเตือน: ข้อมูลอาจไม่สมบูรณ์')
const showInfoToast = () => info('ข้อมูลถูกอัปเดตเรียบร้อยแล้ว')

// Modal
const showExampleModal = ref(false)
const showLargeModal = ref(false)
const showConfirmModal = ref(false)

const formData = reactive({
  name: '',
  email: '',
  role: ''
})

const handleModalConfirm = () => {
  success('ยืนยันสำเร็จ!')
  showExampleModal.value = false
}

const handleConfirmAction = () => {
  success('ดำเนินการสำเร็จ!')
  showConfirmModal.value = false
}
</script>
