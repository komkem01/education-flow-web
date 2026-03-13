<template>
  <button :class="buttonClass" :disabled="disabled || loading" @click="handleClick">
    <Icon v-if="loading" name="lucide:loader-2" class="w-4 h-4 animate-spin mr-2" />
    <Icon v-else-if="icon" :name="icon" class="w-4 h-4" :class="{ 'mr-2': $slots.default }" />
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'neutral' | 'success' | 'warning' | 'danger' | 'detail' | 'edit' | 'delete'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  disabled?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClass = computed(() => {
  const baseClass = 'btn'
  const variantClass = props.variant ? `btn-${props.variant}` : 'btn-primary'
  const sizeClass = props.size && props.size !== 'md' ? `btn-${props.size}` : ''
  
  return [baseClass, variantClass, sizeClass].filter(Boolean).join(' ')
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>
