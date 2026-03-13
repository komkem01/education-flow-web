<template>
  <div class="relative inline-block" ref="dropdownRef">
    <button
      @click="toggleDropdown"
      :class="['btn', buttonVariant ? `btn-${buttonVariant}` : 'btn-secondary']"
      type="button"
    >
      <slot name="trigger">
        <span>{{ triggerText || 'คลิก' }}</span>
        <Icon name="lucide:chevron-down" class="w-4 h-4 ml-2" />
      </slot>
    </button>

    <Transition name="dropdown">
      <div
        v-if="isOpen"
        :class="['absolute z-50 mt-2 bg-white rounded-lg shadow-lg border border-secondary-200', positionClass, widthClass]"
      >
        <ul class="py-2">
          <li
            v-for="(item, index) in items"
            :key="index"
            @click="handleItemClick(item)"
            class="px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 cursor-pointer transition-colors flex items-center gap-2"
            :class="{ 'opacity-50 cursor-not-allowed': item.disabled }"
          >
            <Icon v-if="item.icon" :name="item.icon" class="w-4 h-4" />
            {{ item.label }}
          </li>
          <slot />
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'

interface DropdownItem {
  label: string
  value?: any
  icon?: string
  disabled?: boolean
  onClick?: () => void
}

const props = defineProps<{
  items?: DropdownItem[]
  triggerText?: string
  buttonVariant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  position?: 'start' | 'end' | 'center'
  width?: 'sm' | 'md' | 'lg' | 'full'
}>()

const emit = defineEmits<{
  select: [item: DropdownItem]
}>()

const isOpen = ref(false)
const dropdownRef = ref(null)

const positionClass = computed(() => {
  const positions = {
    start: 'left-0',
    end: 'right-0',
    center: 'left-1/2 -translate-x-1/2'
  }
  return positions[props.position || 'start']
})

const widthClass = computed(() => {
  const widths = {
    sm: 'w-48',
    md: 'w-56',
    lg: 'w-64',
    full: 'w-full'
  }
  return widths[props.width || 'md']
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const handleItemClick = (item: DropdownItem) => {
  if (item.disabled) return
  
  if (item.onClick) {
    item.onClick()
  }
  
  emit('select', item)
  isOpen.value = false
}

onClickOutside(dropdownRef, () => {
  isOpen.value = false
})
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
