<script setup lang="ts" generic="T">
import { computed, ref, watch } from "vue";
import { useResizeObserver } from "@vueuse/core";

// Types & enums
import type { StyleValue } from "vue";
import type { MagicScrollerItemRecord } from "../types";

// Setup
const props = defineProps<{
  item: MagicScrollerItemRecord<T>;
}>();

const emits = defineEmits<{
  itemUpdated: [MagicScrollerItemRecord<T>, number];
}>();


const el = ref<HTMLElement>();
const elStyles = computed<StyleValue>(() => ({
  position: 'absolute',
  width: '100%',
  top: `${props.item.position}px`
}));

useResizeObserver(el, ([{contentRect: {height}}]) => {
  emits('itemUpdated', props.item, height)
});

watch(() => props.item, (next, previous) => {
  if (next.index === previous.index) return;
  emits('itemUpdated', next, el.value?.getClientRects()[0].height ?? props.item.height)
});
</script>

<template>
  <div ref="el" :style="elStyles">
    <slot name="default" />
  </div>
</template>