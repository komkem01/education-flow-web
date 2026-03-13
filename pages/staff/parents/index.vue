<template>
  <NuxtLayout name="admin" page-title="จัดการผู้ปกครอง" page-description="เชื่อมความสัมพันธ์ผู้ปกครองกับนักเรียนในโรงเรียน">
    <UICard>
      <UITable :columns="columns" :data="visibleRows" :pagination="pagination" :actions="{ view: true }" @view="handleView">
        <template #actions="{ row }">
          <UIButton
            variant="neutral"
            size="sm"
            class="btn-outline !px-2.5 !py-2 border-secondary-300"
            icon="lucide:eye"
            :title="actionDisabledReason('parents', 'read', row.schoolId) || 'ดูรายละเอียด'"
            :disabled="!canRead('parents', row.schoolId)"
            @click="handleView(row)"
          />
        </template>
      </UITable>
    </UICard>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth'
})

const { canRead, canAccessSchool, actionDisabledReason } = useScopeAccess()

const columns = [
  { key: 'name', label: 'ผู้ปกครอง' },
  { key: 'student', label: 'นักเรียน' },
  { key: 'relation', label: 'ความสัมพันธ์' },
  { key: 'phone', label: 'เบอร์โทร' }
]

const rows = [
  { id: 'p-1', name: 'มนัสวี ศรีสุข', student: 'ณิชา วงศ์ชัย', relation: 'มารดา', phone: '081-000-1122', schoolId: 'SCH-101' },
  { id: 'p-2', name: 'ธนกร ภูผา', student: 'ภาคิน ภูผา', relation: 'บิดา', phone: '081-000-4455', schoolId: 'SCH-101' }
]

const visibleRows = computed(() => rows.filter((row) => canAccessSchool(row.schoolId)))

const pagination = computed(() => ({
  page: 1,
  limit: 10,
  total: visibleRows.value.length,
  totalPages: 1
}))

const handleView = (row: { id: string; schoolId?: string }) => {
  if (!canRead('parents', row.schoolId)) return
  navigateTo(`/staff/parents/${row.id}`)
}
</script>
