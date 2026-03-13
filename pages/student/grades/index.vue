<template>
  <NuxtLayout name="admin" page-title="ผลการเรียน" page-description="สรุปผลการเรียนรายวิชา">
    <UICard>
      <UITable :columns="columns" :data="visibleRows" :pagination="pagination" :actions="{ view: true }" @view="handleView">
        <template #actions="{ row }">
          <UIButton
            variant="neutral"
            size="sm"
            class="btn-outline !px-2.5 !py-2 border-secondary-300"
            icon="lucide:eye"
            :title="actionDisabledReason('grades', 'read', row.schoolId) || 'ดูรายละเอียด'"
            :disabled="!canRead('grades', row.schoolId)"
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
  { key: 'subject', label: 'รายวิชา' },
  { key: 'midterm', label: 'กลางภาค' },
  { key: 'final', label: 'ปลายภาค' },
  { key: 'grade', label: 'เกรด' }
]

const rows = [
  { id: 'g-1', subject: 'คณิตศาสตร์', midterm: 82, final: 88, grade: 'A', schoolId: 'SCH-101' },
  { id: 'g-2', subject: 'ภาษาอังกฤษ', midterm: 76, final: 81, grade: 'B+', schoolId: 'SCH-101' }
]

const visibleRows = computed(() => rows.filter((row) => canAccessSchool(row.schoolId)))

const pagination = computed(() => ({
  page: 1,
  limit: 10,
  total: visibleRows.value.length,
  totalPages: 1
}))

const handleView = (row: { id: string; schoolId?: string }) => {
  if (!canRead('grades', row.schoolId)) return
  navigateTo(`/student/grades/${row.id}`)
}
</script>
