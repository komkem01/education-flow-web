<template>
  <div class="mb-4">
    <label v-if="label" :for="selectId" class="label">
      {{ label }}
      <span v-if="required" class="text-danger-600">*</span>
    </label>
    <select
      :id="selectId"
      v-model="selectValue"
      :disabled="disabled"
      :class="['input', { 'input-error': error }]"
    >
      <option value="" disabled>{{ placeholder || 'เลือก...' }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
    </select>
    <p v-if="error" class="error-message">{{ error }}</p>
    <p v-else-if="hint" class="text-sm text-secondary-600 mt-1">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import type { SelectOption } from '~/types'

const props = defineProps<{
  modelValue: string | number
  label?: string
  placeholder?: string
  options: SelectOption[]
  disabled?: boolean
  required?: boolean
  error?: string
  hint?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const selectId = `select-${Math.random().toString(36).substr(2, 9)}`

const selectValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>
