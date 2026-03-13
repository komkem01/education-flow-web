<template>
  <div class="flex items-center justify-between gap-4">
    <!-- Page info -->
    <div v-if="showInfo" class="text-sm text-secondary-700">
      แสดง {{ startItem }} - {{ endItem }} จาก {{ total }} รายการ
    </div>

    <!-- Pagination buttons -->
    <div class="flex items-center gap-1">
      <!-- Previous button -->
      <button
        @click="emit('update:modelValue', currentPage - 1)"
        :disabled="currentPage === 1"
        class="btn btn-sm btn-secondary"
        :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
      >
        <Icon name="lucide:chevron-left" class="w-4 h-4" />
        <span class="hidden sm:inline ml-1">ก่อนหน้า</span>
      </button>

      <!-- Page numbers -->
      <div class="flex items-center gap-1">
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="handlePageClick(page)"
          :disabled="page === '...'"
          class="btn btn-sm"
          :class="{
            'btn-primary': page === currentPage,
            'btn-secondary': page !== currentPage && page !== '...',
            'btn-disabled cursor-default': page === '...'
          }"
        >
          {{ page }}
        </button>
      </div>

      <!-- Next button -->
      <button
        @click="emit('update:modelValue', currentPage + 1)"
        :disabled="currentPage >= totalPages"
        class="btn btn-sm btn-secondary"
        :class="{ 'opacity-50 cursor-not-allowed': currentPage >= totalPages }"
      >
        <span class="hidden sm:inline mr-1">ถัดไป</span>
        <Icon name="lucide:chevron-right" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: number // current page
  totalPages: number
  total?: number
  pageSize?: number
  showInfo?: boolean
  maxVisible?: number // maximum visible page numbers
}>()

const emit = defineEmits<{
  'update:modelValue': [page: number]
}>()

const currentPage = computed(() => props.modelValue)

const startItem = computed(() => {
  if (!props.total || !props.pageSize) return 0
  return (currentPage.value - 1) * props.pageSize + 1
})

const endItem = computed(() => {
  if (!props.total || !props.pageSize) return 0
  return Math.min(currentPage.value * props.pageSize, props.total)
})

const visiblePages = computed(() => {
  const maxVisible = props.maxVisible || 5
  const pages: (number | string)[] = []
  
  if (props.totalPages <= maxVisible + 2) {
    // Show all pages if total is small
    for (let i = 1; i <= props.totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)
    
    const start = Math.max(2, currentPage.value - Math.floor(maxVisible / 2))
    const end = Math.min(props.totalPages - 1, start + maxVisible - 1)
    
    // Show ... if there's a gap
    if (start > 2) {
      pages.push('...')
    }
    
    // Show middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    // Show ... if there's a gap
    if (end < props.totalPages - 1) {
      pages.push('...')
    }
    
    // Always show last page
    pages.push(props.totalPages)
  }
  
  return pages
})

const handlePageClick = (page: number | string) => {
  if (typeof page === 'number') {
    emit('update:modelValue', page)
  }
}
</script>

<style scoped>
.btn {
  @apply inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-sm {
  @apply px-2.5 py-1 text-sm;
}

.btn-primary {
  @apply bg-primary-600 text-white border border-primary-600 hover:bg-primary-700 focus:ring-primary-500;
}

.btn-secondary {
  @apply bg-white text-secondary-700 border border-secondary-300 hover:bg-secondary-50 focus:ring-secondary-500;
}

.btn-disabled {
  @apply bg-secondary-100 text-secondary-400 border border-secondary-200 cursor-not-allowed;
}
</style>
