<script setup lang="ts">
import { computed, ref } from 'vue'

import { Sunrise, Sunset, RotateCwClock, Sprout, Leaf } from '@lucide/vue'

import {
  DAY_MS,
  dayNumber,
  fmtDay,
  getMirrorDay,
  getNextDst,
  getSeasonEvents,
  isEquinox,
  isSolstice,
} from './equinox'
import { getSunTimes } from './sun'

const now = ref(new Date())
const today = computed(() => dayNumber(now.value))
const year = computed(() => new Date(today.value * DAY_MS).getUTCFullYear())

const events = computed(() => getSeasonEvents(year.value))

const solstices = computed(() => events.value.filter(isSolstice))
const nextIndex = computed(() => solstices.value.findIndex((e) => e.day >= today.value))
const nextSolstice = computed(() => solstices.value[nextIndex.value]!)
const lastSolstice = computed(() => solstices.value[nextIndex.value - 1]!)
const nextMirror = computed(() => getMirrorDay(events.value, nextSolstice.value, today.value))
const lastMirror = computed(() => getMirrorDay(events.value, lastSolstice.value, today.value))
const equinoxes = computed(() =>
  events.value.filter((e) => isEquinox(e) && e.day >= today.value).slice(0, 2),
)
const dst = computed(() => getNextDst(now.value, today.value))
const sunTimes = computed(() => getSunTimes(today.value))
</script>

<template>
  <div class="margin-auto flex flex-col gap-10 items-center text-center">
    <section class="mt-2">{{ fmtDay(today) }} · Bern</section>

    <section class="flex flex-col items-center">
      <h1 class="text-5xl font-bold">
        {{ nextSolstice.day - today }} days until the {{ nextSolstice.kind }} solstice
      </h1>
      <div class="text-sm mt-4">Mirror day:</div>
      <div>{{ fmtDay(nextMirror) }}</div>
    </section>

    <section class="flex flex-col items-center">
      <h2 class="text-3xl">
        {{ today - lastSolstice.day }} days since the {{ lastSolstice.kind }} solstice
      </h2>
      <div class="text-sm mt-4">Mirror day:</div>
      <div>{{ fmtDay(lastMirror) }}</div>
    </section>

    <section class="flex flex-col items-center">
      <div class="mt-4 flex gap-2" v-for="e in equinoxes" :key="e.kind">
        <Sprout v-if="e.kind === 'spring'" /><Leaf v-else /> {{ fmtDay(e.day) }} (in
        {{ e.day - today }} days)
      </div>
    </section>

    <section class="flex flex-col items-center gap-2">
      <div class="flex gap-2"><Sunrise />{{ sunTimes.sunrise }}</div>
      <div class="flex gap-2"><Sunset />{{ sunTimes.sunset }}</div>
      <div class="flex gap-2 mt-8">
        <RotateCwClock />
        {{ fmtDay(dst.day) }}, {{ dst.label }} (in {{ dst.day - today }} days)
      </div>
    </section>
  </div>
</template>
