<template>
  <span :class="['badge', badgeClass]">
    <slot />
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
}>()

const badgeClass = computed(() => {
  return props.variant ? `badge-${props.variant}` : 'badge-secondary'
})
</script>
