<template>
  <NuxtLayout name="admin" page-title="นักเรียน" page-description="รายชื่อนักเรียนในชั้นเรียนที่ครูรับผิดชอบ">
    <UICard>
      <UITable :columns="columns" :data="visibleRows" :pagination="pagination" :actions="{ view: true }" @view="handleView">
        <template #actions="{ row }">
          <UIButton
            variant="neutral"
            size="sm"
            class="btn-outline !px-2.5 !py-2 border-secondary-300"
            icon="lucide:eye"
            :title="actionDisabledReason('students', 'read', row.schoolId) || 'ดูรายละเอียด'"
            :disabled="!canRead('students', row.schoolId)"
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
  { key: 'code', label: 'รหัสนักเรียน' },
  { key: 'name', label: 'ชื่อ - สกุล' },
  { key: 'classroom', label: 'ห้อง' },
  { key: 'advisorNote', label: 'หมายเหตุ' }
]

const rows = [
  { id: 'st-1', code: 'STU1042', name: 'ณิชา วงศ์ชัย', classroom: 'ม.2/1', advisorNote: '-', schoolId: 'SCH-101' },
  { id: 'st-2', code: 'STU1043', name: 'ภาคิน ภูผา', classroom: 'ม.2/1', advisorNote: 'ลาป่วย 1 วัน', schoolId: 'SCH-101' }
]

const visibleRows = computed(() => rows.filter((row) => canAccessSchool(row.schoolId)))

const pagination = computed(() => ({
  page: 1,
  limit: 10,
  total: visibleRows.value.length,
  totalPages: 1
}))

const handleView = (row: { id: string; schoolId?: string }) => {
  if (!canRead('students', row.schoolId)) return
  navigateTo(`/teacher/students/${row.id}`)
}
</script>
