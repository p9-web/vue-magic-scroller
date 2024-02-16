# Vue Magic Scroller
A `Vue 3` + `Typescript` + `VueUse` virtual scroller for dynamic/fixed height items with no styles attached.

## When to use this?
- your app renders huge lists of elements;
- you want to improve your app's performances;
- you feel like trying to build your own virtual scroller component was a painful experience;
- you feel like you spent too much time searching for an _Vue 3 + Typescript_ unstyled virtual scroller library;

## How to use it
1. Run `yarn add vue-magic-scroller`;
2. Import the component and use it in your Vue 3 project like this: `import MagicScroller from 'vue-magic-scroller'`;
3. Use the default slot to render your item;

```
<template>
    <div>
        <MagicScroller ref="scrollerEl" :items="items" :item-gap="10">
            <template #item="{item, index, position}">
                <div>
                    {{ index }}: {{ item.id }} - {{ position }}
                </div>
            </template>
        </MagicScroller>
    </div>
<template>
```

## Props
- `items`: `T[]` Array of items to be rendered;
- `item-gap`: `number` Number of pixels between each item;

## Slots
- `default`: Template for list's items;

## Emits
- `scrollStart`: Triggered when scroll position starts being updated;
- `scrollEnd`: Triggered when scroll position is finished being updated;

## Exposed computed refs & methods
- `y`: `ComputedRef<number>` scroll position;
- `virtualContainerHeight`: `ComputedRef<number>` height of the virtual container;
- `startIndex`: `ComputedRef<number>` index of the first virtual item;
- `endIndex`: `ComputedRef<number>` index of the last virtual item;
- `firstVisibleIndex`: `ComputedRef<number>` index of the first visible item;
- `lastVisibleIndex`: `ComputedRef<number>` index of the last visible item;
- `getItemPosition`: `(index: number) => number | undefined`: Method to get the position of an item;
- `getItemHeight`: `(index: number) => number | undefined`: Method to get the height of an item;
- `scrollToIndex`: `(index: number) => void`: Method to scroll to a specific item;
- `scrollToTop`: `() => void`: Method to scroll to the top of the list;
- `scrollToBottom`: `() => void`: Method to scroll to the bottom of the list;
