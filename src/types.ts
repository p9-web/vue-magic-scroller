import type { ComputedRef } from "vue";

export interface MagicScrollerProps<T> {
    items: T[];
    buffer?: number;
    itemGap?: number;
    scrollBehaviour?: 'smooth' | 'auto'
}

export interface  MagicScrollerItemRecord<T> {
    raw: T;
    index: number;
    height: number;
    position: number;
}

export interface MagicScrollerExposedProps {
    y: ComputedRef<number>;
    virtualContainerHeight: ComputedRef<number>;
    startIndex: ComputedRef<number>;
    endIndex: ComputedRef<number>;
    firstVisibleIndex: ComputedRef<number>;
    lastVisibleIndex: ComputedRef<number>;
    getItemPosition: (index: number) => number | undefined;
    getItemHeight: (index: number) => number | undefined;
    scrollToIndex: (index: number) => void;
    scrollToTop: () => void;
    scrollToBottom: () => void;
}