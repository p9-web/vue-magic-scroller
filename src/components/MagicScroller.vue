<script setup lang="ts" generic="T">
import { computed, nextTick, ref, shallowRef, watch } from "vue";
import { useScroll, useResizeObserver } from "@vueuse/core";

// Components
import MagicScrollerItem from "./MagicScrollerItem.vue";

// Types & enums
import type { ComputedRef, Ref, StyleValue } from "vue";
import type { MagicScrollerProps, MagicScrollerItemRecord, MagicScrollerExposedProps } from "../types";

// Setup
const props = withDefaults(defineProps<MagicScrollerProps<T>>(), {
  buffer: 20,
  itemGap: 0,
  scrollBehaviour: 'smooth'
});

const emits = defineEmits<{
  scrollStart: [];
  scrollEnd: [];
}>();

const virtualItems: Ref<MagicScrollerItemRecord<T>[]> = ref([]);
const lastIndex = computed(() => props.items.length - 1);

const firstVisibleIndex = shallowRef(0);
const lastVisibleIndex = shallowRef(0);
const startIndex = shallowRef(0);
const endIndex = shallowRef(0);
const renderedItems: ComputedRef<MagicScrollerItemRecord<T>[]> = computed(
  () => virtualItems.value.slice(startIndex.value, endIndex.value + 1)
);

const wrapperEl: Ref<HTMLElement | undefined> = ref();
const wrapperElHeight = shallowRef(0);
const wrapperElStyles: StyleValue = {
  width: '100%',
  height: '100%',
  maxHeight: '100%',
  overflow: 'auto'
};

const containerEl: Ref<HTMLElement | undefined> = ref();
const virtualContainerHeight: ComputedRef<number> = computed(() => {
  if (!virtualItems.value[lastIndex.value]) return 0;
  const {position, height} = virtualItems.value[lastIndex.value];
  return position + height;
});
const containerElStyles: ComputedRef<StyleValue> = computed(() => ({
  position: 'relative',
  height: `${virtualContainerHeight.value}px`
}));


// Initialization
const isInitializing = shallowRef(false);
const initialize = async (): Promise<void> => {
  isInitializing.value = true;
  wrapperElHeight.value = wrapperEl.value?.offsetHeight ?? 0;
  if (!wrapperElHeight.value) throw new Error('Virtual scroller wrapper element has no height!');

  let containerElHeight = 0;

  for(
    let i = startIndex.value;
    wrapperElHeight.value > containerElHeight && endIndex.value <= lastIndex.value;
    i++
  ) {
    endIndex.value = i + 1;
    await nextTick();
    containerElHeight = renderedItems.value.reduce((acc, {height, index}) => acc + height + (index * props.itemGap), 0);
    if (!containerElHeight) break;
  }
  endIndex.value += props.buffer;
  isInitializing.value = false;
};
const stopInitializationWatcher = watch(
  () => [props.items, wrapperElHeight.value] as [T[], number],
  ([items, wrapperHeight]) => {
    if (!items.length || !wrapperHeight) return;
    stopInitializationWatcher();
    virtualItems.value = items.map((raw, index) => ({
      raw,
      index,
      height: 0,
      position: 0
    }));
    initialize();
  }
);

// Element sizes updates
const minItemHeight = shallowRef(0);
useResizeObserver(wrapperEl, ([entry]) => wrapperElHeight.value = entry.contentRect.height);
const onItemUpdated = (item: MagicScrollerItemRecord<T>, height: number): void => {
  virtualItems.value[item.index].height = height;
  if (minItemHeight.value === 0 || height < minItemHeight.value) minItemHeight.value = height;
  updatePositionsOnHeightChange(item.index);
}

// Scroll
const {arrivedState, isScrolling, y} = useScroll(wrapperEl, {behavior: props.scrollBehaviour});
watch(isScrolling, (next) => {
  next ? emits('scrollStart') : emits('scrollEnd');
});
const updatePositionsOnHeightChange = (index: number): void => {
  virtualItems.value
    .slice(index, virtualItems.value.length)
    .forEach(({index: i, position, height}) => {
      if (i === lastIndex.value) return;
      virtualItems.value[i + 1].position = position + (height || minItemHeight.value) + props.itemGap;
    });
}
const stopScrollWatcher: Ref<ReturnType<typeof watch> | undefined> = ref();
const scrollToIndex = (index: number): void => {
  const position = virtualItems.value[index]?.position;
  if (position === undefined || y.value === position) return;
  // Since items can be resized while scrolling, we wait until we're not scrolling anymore, then
  // re-evaluate item's position and scroll to that position
  if (!!stopScrollWatcher.value) stopScrollWatcher.value();
  stopScrollWatcher.value = watch(isScrolling, (next) => {
    if (next) return;
    if (!!stopScrollWatcher.value) stopScrollWatcher.value();
    scrollToIndex(index);
  });
  y.value = position;
}
watch(y, () => {
  if (isInitializing.value || !wrapperElHeight.value || !minItemHeight.value) return;
  const top = y.value;
  const bottom = y.value + wrapperElHeight.value;

  virtualItems.value.forEach(({index, position}) => {
    if (
      (arrivedState.top && index === 0)
      || (index > 0 && top >= position && top < virtualItems.value[index + 1].position)
    ) {
      firstVisibleIndex.value = index;
      startIndex.value = Math.max(0, index - props.buffer - 1);
    } else if (
      (arrivedState.bottom && index === lastIndex.value)
      || (index !== lastIndex.value && bottom > position && bottom <= virtualItems.value[index + 1].position)
    ) {
      lastVisibleIndex.value = index;
      endIndex.value = Math.min(lastIndex.value, index + props.buffer + 1);
    }
  });
}, {immediate: true});

defineExpose<MagicScrollerExposedProps>({
  y: computed(() => y.value),
  virtualContainerHeight,
  startIndex: computed(() => startIndex.value),
  endIndex: computed(() => endIndex.value),
  firstVisibleIndex: computed(() => firstVisibleIndex.value),
  lastVisibleIndex: computed(() => lastVisibleIndex.value),
  getItemPosition: (index: number) => virtualItems.value[index]?.position,
  getItemHeight: (index: number) => virtualItems.value[index]?.height,
  scrollToIndex,
  scrollToTop: (): void => scrollToIndex(0),
  scrollToBottom: (): void => scrollToIndex(lastIndex.value)
});
</script>

<template>
  <div ref="wrapperEl" :style="wrapperElStyles">
    <div ref="containerEl" :style="containerElStyles">
      <MagicScrollerItem
        v-for="(item, i) in renderedItems"
        :key="i"
        :item="item"
        @item-updated="onItemUpdated"
      >
        <slot name="item" v-bind="{item: item.raw, index: item.index, virtualIndex: i, position: item.position}" />
      </MagicScrollerItem>
    </div>
  </div>
</template>
