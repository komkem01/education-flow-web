<template>
  <NuxtLayout name="admin" page-title="รายวิชาที่สอน" page-description="จัดการรายวิชาและห้องเรียนที่รับผิดชอบ">
    <UICard>
      <UITable :columns="columns" :data="visibleRows" :pagination="pagination" :actions="{ view: true }" @view="handleView">
        <template #actions="{ row }">
          <UIButton
            variant="neutral"
            size="sm"
            class="btn-outline !px-2.5 !py-2 border-secondary-300"
            icon="lucide:eye"
            :title="actionDisabledReason('subjects', 'read', row.schoolId) || 'ดูรายละเอียด'"
            :disabled="!canRead('subjects', row.schoolId)"
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
  { key: 'code', label: 'รหัสวิชา' },
  { key: 'name', label: 'รายวิชา' },
  { key: 'classroom', label: 'ห้องเรียน' },
  { key: 'students', label: 'จำนวนนักเรียน' }
]

const rows = [
  { id: 'sub-1', code: 'MTH201', name: 'คณิตศาสตร์เพิ่มเติม', classroom: 'ม.2/1', students: 38, schoolId: 'SCH-101' },
  { id: 'sub-2', code: 'MTH202', name: 'คณิตศาสตร์พื้นฐาน', classroom: 'ม.2/2', students: 40, schoolId: 'SCH-101' }
]

const visibleRows = computed(() => rows.filter((row) => canAccessSchool(row.schoolId)))

const pagination = computed(() => ({
  page: 1,
  limit: 10,
  total: visibleRows.value.length,
  totalPages: 1
}))

const handleView = (row: { id: string; schoolId?: string }) => {
  if (!canRead('subjects', row.schoolId)) return
  navigateTo(`/teacher/subjects/${row.id}`)
}
</script>
