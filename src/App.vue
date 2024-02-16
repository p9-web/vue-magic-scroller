<script setup lang="ts">
import { ref } from "vue";

// Components
import MagicScroller from "./components/MagicScroller.vue";

// Types & enums
import type { MagicScrollerExposedProps } from "./types";
interface MagicScrollerItem {
  id: string;
  showExtraChunk: boolean;
}

//Setup
const scrollerEl = ref<MagicScrollerExposedProps>();
const scrollToIndex = (index: number) => scrollerEl.value?.scrollToIndex(index);
const scrollToTop = () => scrollerEl.value?.scrollToTop();
const scrollToBottom = () => scrollerEl.value?.scrollToBottom();

const items: MagicScrollerItem[] = Array(5000)
  .fill({})
  .map((item, i) => ({
    ...item,
    showExtraChunk: !!Math.round(Math.random()),
    id: `id-${i.toString()}`
  }));
</script>

<template>
  <main>
    <div style="display: flex; height: 100%;">
      <div style="flex: 50% 1 1; display: flex; gap: 1rem; flex-direction: column;">
        <div style="padding: 1rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
          <button @click="scrollToIndex(50)">Scroll to index 50</button>
          <button @click="scrollToTop">Scroll to top</button>
          <button @click="scrollToBottom">Scroll to bottom</button>
        </div>

        <div style="display: flex; min-height: 1px; flex: auto 1 1;">
          <MagicScroller ref="scrollerEl" :items="items" :item-gap="10">
            <template #item="{item, index, position}">
              <div :style="{padding: '5px', border: '1px solid purple', borderRadius: '5px'}">
                {{ index }}: {{ item.id }} - {{ position }}
                <template v-if="item.showExtraChunk">
                  <p v-for="i of (Math.abs(index % 2) + 1)" :key="i">Yoyo {{ i }}!</p>
                </template>
              </div>
            </template>
          </MagicScroller>
        </div>
      </div>
      <div style="flex: 50% 1 1; display: flex;">
        <small v-if="scrollerEl">
          {{ scrollerEl.virtualContainerHeight }}
        </small>
      </div>
    </div>
  </main>
</template>

<style>
html {
  height: 100vh;
  max-height: 100vh;
}
body, #app, main {
  height: 100%;
  max-height: 100%;
  margin: 0;
}
main {
  display: flex;
  flex-direction: column;
  flex: auto 1 1;
}
</style>
