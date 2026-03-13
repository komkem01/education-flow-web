<template>
  <Transition name="toast">
    <div v-if="toast.show" :class="['alert', alertClass, 'fixed z-50 min-w-[320px] max-w-md shadow-lg', positionClass]">
      <div class="flex items-start gap-3">
        <Icon :name="iconName" class="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p class="flex-1 text-sm font-medium">{{ toast.message }}</p>
        <button @click="toast.show = false" class="flex-shrink-0 hover:opacity-70 transition-opacity">
          <Icon name="lucide:x" class="w-4 h-4" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{
  position?: 'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end'
}>()

const { toast } = useToast()

const alertClass = computed(() => {
  const types = {
    success: 'alert-success',
    error: 'alert-danger',
    warning: 'alert-warning',
    info: 'alert-info'
  }
  return types[toast.value.type] || 'alert-info'
})

const iconName = computed(() => {
  const icons = {
    success: 'lucide:check-circle',
    error: 'lucide:x-circle',
    warning: 'lucide:alert-triangle',
    info: 'lucide:info'
  }
  return icons[toast.value.type] || 'lucide:info'
})

const positionClass = computed(() => {
  const positions = {
    'top-start': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-end': 'top-4 right-4',
    'bottom-start': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-end': 'bottom-4 right-4'
  }
  return positions[props.position || 'top-end']
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
