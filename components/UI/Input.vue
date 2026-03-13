<template>
  <div class="mb-4">
    <label v-if="label" :for="inputId" class="label">
      {{ label }}
      <span v-if="required" class="text-danger-600">*</span>
    </label>
    <input
      :id="inputId"
      v-model="inputValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="['input', { 'input-error': error }]"
      @blur="emit('blur')"
      @focus="emit('focus')"
    />
    <p v-if="error" class="error-message">{{ error }}</p>
    <p v-else-if="hint" class="text-sm text-secondary-600 mt-1">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string | number
  label?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  hint?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: []
  focus: []
}>()

const inputId = `input-${Math.random().toString(36).substr(2, 9)}`

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>
