<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
    <AdminDetailField
      v-for="entry in entries"
      :key="entry.key"
      :label="toLabel(entry.key)"
      :value="toDisplayValue(entry.value)"
    />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  data: Record<string, any>
  excludeKeys?: string[]
}>(), {
  excludeKeys: () => []
})

const entries = computed(() => {
  return Object.entries(props.data || {})
    .filter(([key]) => !props.excludeKeys.includes(key))
})

const toLabel = (key: string) => {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const toDisplayValue = (value: unknown) => {
  if (value === null || value === undefined) return '-'
  if (Array.isArray(value)) {
    return value.length === 0 ? '-' : value.map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item))).join(', ')
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}
</script>
