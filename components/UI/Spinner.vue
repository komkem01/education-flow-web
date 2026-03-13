<template>
  <span :class="spinnerClass">
    <Icon name="lucide:loader-2" class="animate-spin" />
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'white'
}>()

const spinnerClass = computed(() => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const variants = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    white: 'text-white'
  }

  return [
    'inline-block',
    sizes[props.size || 'md'],
    variants[props.variant || 'primary']
  ].join(' ')
})
</script>
