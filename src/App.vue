<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import DayLen from './DayLen.vue'
import { interpolateColor } from './color'

import { DAY_MS, dayNumber, getSeasonEvents, isSolstice } from './equinox'

const now = ref(new Date())
const today = computed(() => dayNumber(now.value))
const year = computed(() => new Date(today.value * DAY_MS).getUTCFullYear())
const events = computed(() => getSeasonEvents(year.value))

const solstices = computed(() => events.value.filter(isSolstice))
const nextIndex = computed(() => solstices.value.findIndex((e) => e.day >= today.value))
const nextSolstice = computed(() => solstices.value[nextIndex.value]!)

function setVariables() {
  let distance = 1

  if (nextSolstice.value.kind == 'summer') {
    distance = nextSolstice.value.day = today.value
  }

  const { background, text } = interpolateColor(distance)

  document.body.style.setProperty('--background-color', background)
  document.body.style.setProperty('--foreground-color', text)
}

onMounted(() => {
  setVariables()
})
</script>

<template>
  <DayLen />
</template>

<style scoped></style>
