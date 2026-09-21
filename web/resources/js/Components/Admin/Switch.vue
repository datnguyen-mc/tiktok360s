<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <label class="inline-flex cursor-pointer items-center gap-2"
         :class="disabled && 'pointer-events-none opacity-50'">
    <input type="checkbox" class="sr-only" :checked="modelValue" :disabled="disabled"
           @change="$emit('update:modelValue', $event.target.checked)" />
    <span :class="['adm-switch', modelValue && 'adm-switch-on']"></span>
    <span v-if="label" class="text-[13px] font-medium">{{ label }}</span>
  </label>
</template>
