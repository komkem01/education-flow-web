<template>
  <NuxtLayout name="admin" page-title="จัดการโรงเรียนทั้งหมด" page-description="เพิ่มโรงเรียนและสร้างแอดมินเริ่มต้นให้แต่ละโรงเรียน">
    <div class="mb-6 flex justify-end">
      <UIButton
        variant="primary"
        icon="lucide:plus"
        :disabled="!canWrite('schools')"
        :title="actionDisabledReason('schools', 'write') || 'เพิ่มโรงเรียนใหม่'"
        @click="showCreateModal = true"
      >
        เพิ่มโรงเรียนใหม่
      </UIButton>
    </div>

    <UICard>
      <UITable :columns="columns" :data="rows" :pagination="pagination" :actions="{ view: true }" @view="handleView">
        <template #cell-status="{ value }">
          <UIBadge :variant="value === 'active' ? 'success' : 'secondary'">{{ value }}</UIBadge>
        </template>
        <template #actions="{ row }">
          <UIButton
            variant="neutral"
            size="sm"
            class="btn-outline !px-2.5 !py-2 border-secondary-300"
            icon="lucide:eye"
            :title="actionDisabledReason('schools', 'read', row.id) || 'ดูรายละเอียด'"
            :disabled="!canRead('schools', row.id)"
            @click="handleView(row)"
          />
        </template>
      </UITable>
    </UICard>

    <UIModal
      v-model="showCreateModal"
      title="เพิ่มโรงเรียนใหม่"
      size="lg"
      :show-default-footer="true"
      @confirm="handleCreateSchool"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UIInput v-model="form.schoolName" label="ชื่อโรงเรียน" placeholder="เช่น โรงเรียนตัวอย่าง" required />
        <UIInput v-model="form.schoolCode" label="รหัสโรงเรียน" placeholder="เช่น SCH-001" required />
        <UIInput v-model="form.adminEmail" label="อีเมลแอดมินเริ่มต้น" type="email" placeholder="admin@school.ac.th" required />
        <UIInput v-model="form.adminName" label="ชื่อแอดมินเริ่มต้น" placeholder="ชื่อ-สกุล" required />
      </div>
      <p class="text-xs text-secondary-600 mt-4">
        ระบบจะสร้างบัญชีแอดมินโรงเรียนเริ่มต้นและส่งคำเชิญทางอีเมลโดยอัตโนมัติ
      </p>
    </UIModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { success } = useToast()
const { canRead, canWrite, actionDisabledReason } = useScopeAccess()

definePageMeta({
  layout: false,
  middleware: 'auth'
})

const showCreateModal = ref(false)
const form = reactive({
  schoolName: '',
  schoolCode: '',
  adminEmail: '',
  adminName: ''
})

const columns = [
  { key: 'name', label: 'โรงเรียน' },
  { key: 'code', label: 'รหัส' },
  { key: 'admin', label: 'แอดมินหลัก' },
  { key: 'status', label: 'สถานะ' }
]

const rows = ref([
  { id: 's-1', name: 'โรงเรียนบ้านต้นน้ำ', code: 'SCH-101', admin: 'admin@tonnam.ac.th', status: 'active' },
  { id: 's-2', name: 'โรงเรียนชุมชนสายรุ้ง', code: 'SCH-102', admin: 'admin@sairung.ac.th', status: 'active' }
])

const pagination = computed(() => ({
  page: 1,
  limit: 10,
  total: rows.value.length,
  totalPages: 1
}))

const handleCreateSchool = () => {
  rows.value.unshift({
    id: `s-${Date.now()}`,
    name: form.schoolName,
    code: form.schoolCode,
    admin: form.adminEmail,
    status: 'active'
  })

  form.schoolName = ''
  form.schoolCode = ''
  form.adminEmail = ''
  form.adminName = ''
  showCreateModal.value = false
  success('สร้างโรงเรียนและบัญชีแอดมินเริ่มต้นเรียบร้อย')
}

const handleView = (row: { id: string }) => {
  if (!canRead('schools', row.id)) return
  navigateTo(`/super-admin/schools/${row.id}`)
}
</script>
