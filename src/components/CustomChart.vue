<template>
  <div class="w-full h-80 flex flex-col justify-between" ref="containerRef">
    <!-- Header with controls -->
    <div class="flex items-center justify-between mb-4">
      <h4 class="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
        Activity Chart <span class="text-xs text-slate-400 font-normal">(Last 7 Days)</span>
      </h4>
      <div class="flex items-center gap-2 text-xs">
        <button
          @click="activeSeries = 'all'"
          class="px-2.5 py-1 rounded-lg border font-medium transition-all"
          :class="[
            activeSeries === 'all'
              ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 border-transparent'
              : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
          ]"
        >
          All
        </button>
        <button
          @click="activeSeries = 'sales'"
          class="px-2.5 py-1 rounded-lg border font-medium transition-all"
          :class="[
            activeSeries === 'sales'
              ? 'bg-primary-600 text-white border-transparent'
              : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
          ]"
        >
          Sales
        </button>
        <button
          @click="activeSeries = 'expenses'"
          class="px-2.5 py-1 rounded-lg border font-medium transition-all"
          :class="[
            activeSeries === 'expenses'
              ? 'bg-rose-600 text-white border-transparent'
              : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
          ]"
        >
          Expenses
        </button>
      </div>
    </div>

    <!-- Chart Drawing Area -->
    <div class="relative flex-1 w-full" ref="chartAreaRef">
      <!-- Hover Tooltip -->
      <div
        v-if="hoverIndex !== null && hoverData"
        class="absolute z-10 p-2.5 rounded-xl border glass-card shadow-lg pointer-events-none text-[11px]"
        :style="{
          left: `${hoverX}px`,
          top: `${hoverY - 60}px`,
          transform: 'translateX(-50%)'
        }"
      >
        <p class="font-bold text-slate-700 dark:text-slate-200">{{ hoverData.label }}</p>
        <div class="space-y-0.5 mt-1">
          <p v-if="activeSeries === 'all' || activeSeries === 'sales'" class="text-primary-600 dark:text-primary-400">
            Sales: ${{ hoverData.sales.toLocaleString() }}
          </p>
          <p v-if="activeSeries === 'all' || activeSeries === 'expenses'" class="text-rose-600 dark:text-rose-400">
            Expenses: ${{ hoverData.expenses.toLocaleString() }}
          </p>
        </div>
      </div>

      <svg class="w-full h-full" v-if="width > 0 && height > 0">
        <!-- Definitions for Gradients -->
        <defs>
          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.0" />
          </linearGradient>
          <linearGradient id="expensesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#f43f5e" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <!-- Horizontal Grid Lines -->
        <g stroke="rgba(156,163,175,0.1)" stroke-width="1">
          <line
            v-for="line in gridLines"
            :key="line"
            x1="40"
            :y1="line.y"
            :x2="width - 20"
            :y2="line.y"
          />
        </g>

        <!-- Y Axis Labels -->
        <g fill="rgba(156,163,175,0.6)" class="text-[9px]" text-anchor="end">
          <text v-for="line in gridLines" :key="'label-' + line.value" x="30" :y="line.y + 3">
            ${{ formatY(line.value) }}
          </text>
        </g>

        <!-- Series 1: Sales Area and Line -->
        <g v-if="activeSeries === 'all' || activeSeries === 'sales'">
          <!-- Filled Gradient Area -->
          <path :d="salesAreaPath" fill="url(#salesGrad)" />
          <!-- Main Line -->
          <path
            :d="salesLinePath"
            fill="none"
            stroke="#8b5cf6"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <!-- Highlight circle on hover -->
          <circle
            v-if="hoverIndex !== null && salesPoints[hoverIndex]"
            :cx="salesPoints[hoverIndex].x"
            :cy="salesPoints[hoverIndex].y"
            r="4.5"
            fill="#8b5cf6"
            stroke="white"
            stroke-width="1.5"
          />
        </g>

        <!-- Series 2: Expenses Area and Line -->
        <g v-if="activeSeries === 'all' || activeSeries === 'expenses'">
          <!-- Filled Gradient Area -->
          <path :d="expensesAreaPath" fill="url(#expensesGrad)" />
          <!-- Main Line -->
          <path
            :d="expensesLinePath"
            fill="none"
            stroke="#f43f5e"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <!-- Highlight circle on hover -->
          <circle
            v-if="hoverIndex !== null && expensesPoints[hoverIndex]"
            :cx="expensesPoints[hoverIndex].x"
            :cy="expensesPoints[hoverIndex].y"
            r="4.5"
            fill="#f43f5e"
            stroke="white"
            stroke-width="1.5"
          />
        </g>

        <!-- X Axis Labels -->
        <g fill="rgba(156,163,175,0.6)" class="text-[9px]" text-anchor="middle">
          <text
            v-for="(point, idx) in xLabels"
            :key="idx"
            :x="point.x"
            :y="height - 5"
          >
            {{ point.label }}
          </text>
        </g>

        <!-- Invisible bars for hover sensitivity -->
        <g>
          <rect
            v-for="(bar, idx) in hoverBars"
            :key="idx"
            :x="bar.x"
            y="0"
            :width="bar.width"
            :height="height"
            fill="transparent"
            class="cursor-pointer"
            @mouseenter="onHover(idx, $event)"
            @mouseleave="onLeave"
          />
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  chartData: {
    type: Array,
    default: () => [
      { label: 'Mon', sales: 0, expenses: 0 },
      { label: 'Tue', sales: 0, expenses: 0 },
      { label: 'Wed', sales: 0, expenses: 0 },
      { label: 'Thu', sales: 0, expenses: 0 },
      { label: 'Fri', sales: 0, expenses: 0 },
      { label: 'Sat', sales: 0, expenses: 0 },
      { label: 'Sun', sales: 0, expenses: 0 }
    ]
  }
});

const containerRef = ref(null);
const chartAreaRef = ref(null);
const width = ref(0);
const height = ref(0);
const activeSeries = ref('all');
const hoverIndex = ref(null);
const hoverX = ref(0);
const hoverY = ref(0);

// Watch for container resizes
let resizeObserver;
onMounted(() => {
  if (chartAreaRef.value) {
    width.value = chartAreaRef.value.clientWidth;
    height.value = chartAreaRef.value.clientHeight;

    resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        width.value = entry.contentRect.width;
        height.value = entry.contentRect.height;
      }
    });
    resizeObserver.observe(chartAreaRef.value);
  }
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

// Max value to scale heights
const maxValue = computed(() => {
  let max = 100;
  props.chartData.forEach(item => {
    if (item.sales > max) max = item.sales;
    if (item.expenses > max) max = item.expenses;
  });
  return max * 1.15; // add 15% buffer top
});

// Horizontal grid y coords and scales
const gridLines = computed(() => {
  const steps = 4;
  const lines = [];
  const startY = 15;
  const endY = height.value - 25;
  const areaHeight = endY - startY;

  for (let i = 0; i <= steps; i++) {
    const val = (maxValue.value / steps) * (steps - i);
    const y = startY + (areaHeight / steps) * i;
    lines.push({ y, value: val });
  }
  return lines;
});

const formatY = (val) => {
  if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
  return Math.round(val);
};

// Coordinate mappings for points
const salesPoints = computed(() => {
  const count = props.chartData.length;
  if (count === 0) return [];
  const startX = 50;
  const endX = width.value - 20;
  const areaWidth = endX - startX;
  const startY = 15;
  const endY = height.value - 25;
  const areaHeight = endY - startY;

  return props.chartData.map((d, index) => {
    const x = startX + (areaWidth / (count - 1)) * index;
    const ratio = d.sales / maxValue.value;
    const y = endY - areaHeight * ratio;
    return { x, y };
  });
});

const expensesPoints = computed(() => {
  const count = props.chartData.length;
  if (count === 0) return [];
  const startX = 50;
  const endX = width.value - 20;
  const areaWidth = endX - startX;
  const startY = 15;
  const endY = height.value - 25;
  const areaHeight = endY - startY;

  return props.chartData.map((d, index) => {
    const x = startX + (areaWidth / (count - 1)) * index;
    const ratio = d.expenses / maxValue.value;
    const y = endY - areaHeight * ratio;
    return { x, y };
  });
});

// SVG Paths generators
const getPathString = (points) => {
  if (points.length === 0) return '';
  return points.reduce((path, p, idx) => {
    if (idx === 0) return `M ${p.x} ${p.y}`;
    
    // Create soft cubic curves
    const prev = points[idx - 1];
    const cpX1 = prev.x + (p.x - prev.x) / 3;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (p.x - prev.x) * 2 / 3;
    const cpY2 = p.y;
    return `${path} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
  }, '');
};

const salesLinePath = computed(() => getPathString(salesPoints.value));
const expensesLinePath = computed(() => getPathString(expensesPoints.value));

const salesAreaPath = computed(() => {
  const pts = salesPoints.value;
  if (pts.length === 0) return '';
  const linePath = salesLinePath.value;
  const start = pts[0];
  const end = pts[pts.length - 1];
  const bottomY = height.value - 25;
  return `${linePath} L ${end.x} ${bottomY} L ${startX()} ${bottomY} Z`;
});

const expensesAreaPath = computed(() => {
  const pts = expensesPoints.value;
  if (pts.length === 0) return '';
  const linePath = expensesLinePath.value;
  const start = pts[0];
  const end = pts[pts.length - 1];
  const bottomY = height.value - 25;
  return `${linePath} L ${end.x} ${bottomY} L ${startX()} ${bottomY} Z`;
});

const startX = () => 50;

// Bottom Labels
const xLabels = computed(() => {
  return salesPoints.value.map((p, idx) => ({
    x: p.x,
    label: props.chartData[idx].label
  }));
});

// Hover sensitivity bars mapping
const hoverBars = computed(() => {
  const pts = salesPoints.value;
  if (pts.length === 0) return [];
  const barWidth = width.value / pts.length;
  
  return pts.map((p, idx) => {
    const x = p.x - barWidth / 2;
    return { x, width: barWidth };
  });
});

const hoverData = computed(() => {
  if (hoverIndex.value === null) return null;
  return props.chartData[hoverIndex.value];
});

const onHover = (idx, event) => {
  hoverIndex.value = idx;
  const ptsSales = salesPoints.value;
  const ptsExp = expensesPoints.value;
  
  if (activeSeries.value === 'sales' && ptsSales[idx]) {
    hoverX.value = ptsSales[idx].x;
    hoverY.value = ptsSales[idx].y;
  } else if (activeSeries.value === 'expenses' && ptsExp[idx]) {
    hoverX.value = ptsExp[idx].x;
    hoverY.value = ptsExp[idx].y;
  } else if (ptsSales[idx]) {
    hoverX.value = ptsSales[idx].x;
    hoverY.value = (ptsSales[idx].y + ptsExp[idx].y) / 2;
  }
};

const onLeave = () => {
  hoverIndex.value = null;
};
</script>
