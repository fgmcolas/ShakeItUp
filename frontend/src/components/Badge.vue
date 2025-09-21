<script setup>
// Small pill with color variants
import { computed } from 'vue';

const props = defineProps({
    color: { type: String, default: 'gray' }, // red|green|blue|purple|gray
});

// Tailwind classes per color
const colorMap = {
    red: 'bg-red-600 text-white',
    green: 'bg-green-600 text-white',
    blue: 'bg-blue-600 text-white',
    purple: 'bg-purple-600 text-white',
    gray: 'bg-gray-600 text-white',
};

const colorClass = computed(() => colorMap[props.color] || colorMap.gray);
</script>

<template>
    <span :class="['px-2 py-1 rounded text-xs font-semibold', colorClass]">
        <slot />
    </span>
</template>
