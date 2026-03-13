<template>
  <div class="table-wrapper">
    <table class="table">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key">
            {{ column.label }}
          </th>
          <th v-if="$slots.actions || actions" class="text-right">
            จัดการ
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="columns.length + (actions ? 1 : 0)" class="text-center py-8">
            <Icon name="lucide:loader-2" class="w-6 h-6 animate-spin inline-block text-primary-600" />
            <p class="mt-2 text-secondary-600">กำลังโหลดข้อมูล...</p>
          </td>
        </tr>
        <tr v-else-if="!data || data.length === 0">
          <td :colspan="columns.length + (actions ? 1 : 0)" class="text-center py-8 text-secondary-500">
            <Icon name="lucide:inbox" class="w-12 h-12 inline-block mb-2 opacity-50" />
            <p>{{ emptyText || 'ไม่พบข้อมูล' }}</p>
          </td>
        </tr>
        <tr v-else v-for="(row, index) in data" :key="row.id || index">
          <td v-for="column in columns" :key="column.key">
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
              {{ row[column.key] }}
            </slot>
          </td>
          <td v-if="$slots.actions || actions">
            <div class="flex gap-2 justify-end flex-nowrap rounded-lg bg-secondary-50 p-1">
              <slot name="actions" :row="row">
                <UIButton
                  v-if="actions?.view"
                  variant="neutral"
                  size="sm"
                  class="btn-outline !px-2.5 !py-2 border-secondary-300 hover:border-secondary-500 hover:shadow-sm hover:scale-105 active:scale-95"
                  icon="lucide:eye"
                  title="ดูรายละเอียด"
                  aria-label="ดูรายละเอียด"
                  @click="emit('view', row)"
                />
                <UIButton
                  v-if="actions?.edit"
                  variant="neutral"
                  size="sm"
                  class="btn-outline !px-2.5 !py-2 border-secondary-300 hover:border-primary-400 hover:shadow-sm hover:scale-105 active:scale-95"
                  icon="lucide:pencil"
                  title="แก้ไข"
                  aria-label="แก้ไข"
                  @click="emit('edit', row)"
                />
                <UIButton
                  v-if="actions?.delete"
                  variant="neutral"
                  size="sm"
                  class="btn-outline !px-2.5 !py-2 border-secondary-300 text-danger-700 hover:border-danger-400 hover:bg-danger-50 hover:shadow-sm hover:scale-105 active:scale-95"
                  icon="lucide:trash-2"
                  title="ลบ"
                  aria-label="ลบ"
                  @click="emit('delete', row)"
                />
              </slot>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div v-if="pagination && !loading && data && data.length > 0" class="px-6 py-4 border-t border-secondary-200 flex items-center justify-between">
      <div class="text-sm text-secondary-700">
        แสดง {{ ((pagination.page - 1) * pagination.limit) + 1 }} - {{ Math.min(pagination.page * pagination.limit, pagination.total) }} จาก {{ pagination.total }} รายการ
      </div>
      <div class="flex gap-2">
        <UIButton
          variant="secondary"
          size="sm"
          icon="lucide:chevron-left"
          :disabled="pagination.page === 1"
          @click="emit('page-change', pagination.page - 1)"
        >
          ก่อนหน้า
        </UIButton>
        <UIButton
          variant="secondary"
          size="sm"
          :disabled="pagination.page >= pagination.totalPages"
          @click="emit('page-change', pagination.page + 1)"
        >
          ถัดไป
          <Icon name="lucide:chevron-right" class="w-4 h-4 ml-2" />
        </UIButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
interface Column {
  key: string
  label: string
}

interface Actions {
  view?: boolean
  edit?: boolean
  delete?: boolean
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

defineProps<{
  columns: Column[]
  data?: T[]
  loading?: boolean
  emptyText?: string
  actions?: Actions
  pagination?: Pagination
}>()

const emit = defineEmits<{
  view: [row: T]
  edit: [row: T]
  delete: [row: T]
  'page-change': [page: number]
}>()
</script>
