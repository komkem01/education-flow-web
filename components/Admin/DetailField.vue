<template>
  <div class="rounded-lg border border-secondary-200 bg-secondary-50/60 p-3">
    <p class="text-xs font-medium uppercase tracking-wide text-secondary-500">{{ label }}</p>
    <div class="mt-1.5">
      <slot>
        <p class="text-sm font-medium text-secondary-900">{{ normalizedValue }}</p>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  value?: string | number | null
}>()

const normalizedValue = computed(() => {
  if (props.value === null || props.value === undefined || props.value === '') {
    return '-'
  }
  return String(props.value)
})
</script>
