<template>
  <NuxtLayout name="admin" page-title="บันทึกคะแนน" page-description="ลงคะแนนและติดตามงานประเมินผลรายวิชา">
    <UICard>
      <UITable :columns="columns" :data="visibleRows" :pagination="pagination" :actions="{ view: true }" @view="handleView">
        <template #cell-score="{ value }">
          <span class="font-semibold" :class="value >= 80 ? 'text-success-700' : 'text-secondary-900'">{{ value }}</span>
        </template>
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
  { key: 'student', label: 'นักเรียน' },
  { key: 'assessment', label: 'รายการประเมิน' },
  { key: 'score', label: 'คะแนน' },
  { key: 'updatedAt', label: 'บันทึกล่าสุด' }
]

const rows = [
  { id: 'gr-1', student: 'ณิชา วงศ์ชัย', assessment: 'สอบกลางภาค', score: 86, updatedAt: '12/01/2026', schoolId: 'SCH-101' },
  { id: 'gr-2', student: 'ภาคิน ภูผา', assessment: 'สอบกลางภาค', score: 74, updatedAt: '12/01/2026', schoolId: 'SCH-101' }
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
  navigateTo(`/teacher/grades/${row.id}`)
}
</script>
