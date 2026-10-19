<script setup lang="ts">
import { computed, ref } from 'vue'

import { Sunrise, Sunset, RotateCwClock, Sprout, Leaf } from '@lucide/vue'

import {
  dayNumber,
  fmtDay,
  getMirrorDayForSolstice,
  getNextDst,
  getSeasonEvents,
  getUpcoming,
} from './calculations'
import { getSunTimes } from './sun'

const now = ref(new Date())
const today = computed(() => dayNumber(now.value))
const year = computed(() => now.value.getFullYear())

const events = computed(() => getSeasonEvents(year.value))
const upcoming = computed(() => getUpcoming(events.value, today.value))

const upcomingSolstices = computed(() =>
  events.value
    .filter(
      (event) => (event.kind === 'summer' || event.kind === 'winter') && event.day >= today.value,
    )
    .slice(0, 2),
)
const nextSolstice = computed(() => upcomingSolstices.value[0]!)

const fartherSolstice = computed(() =>
  [...events.value]
    .reverse()
    .find(
      (event) => (event.kind === 'summer' || event.kind === 'winter') && event.day < today.value,
    )!,
)
const nextMirror = computed(() =>
  getMirrorDayForSolstice(events.value, nextSolstice.value, today.value),
)
const fartherMirror = computed(() =>
  getMirrorDayForSolstice(events.value, fartherSolstice.value, today.value),
)
const equinoxes = computed(() =>
  upcoming.value.filter((event) => event.kind === 'spring' || event.kind === 'autumn'),
)
const dst = computed(() => getNextDst(now.value, today.value))
const sunTimes = computed(() => getSunTimes(now.value))
</script>

<template>
  <div class="margin-auto flex flex-col gap-10 items-center text-center">
    <section class="mt-2">{{ fmtDay(today) }} · Bern</section>

    <section class="flex flex-col items-center">
      <h1 class="text-5xl font-bold">
        {{ nextSolstice.day - today }} days until the {{ nextSolstice.kind }} solstice
      </h1>
      <div class="text-sm mt-4">Mirror day:</div>
      <div>{{ nextMirror.date }}</div>
    </section>

    <section class="flex flex-col items-center">
      <h2 class="text-3xl">
        {{ today - fartherSolstice.day }} days since the {{ fartherSolstice.kind }} solstice
      </h2>
      <div class="text-sm mt-4">Mirror day:</div>
      <div>{{ fartherMirror.date }}</div>
    </section>

    <section class="flex flex-col items-center">
      <div class="mt-4 flex gap-2" v-for="e in equinoxes" :key="e.kind">
        <Sprout v-if="e.kind === 'spring'" /><Leaf v-else /> {{ e.date }} (in {{ e.days }} days)
      </div>
    </section>

    <section class="flex flex-col items-center gap-2">
      <div class="flex gap-2"><Sunrise />{{ sunTimes.sunrise }}</div>
      <div class="flex gap-2"><Sunset />{{ sunTimes.sunset }}</div>
      <div class="flex gap-2 mt-8">
        <RotateCwClock />
        {{ dst.date }}, {{ dst.label }} (in {{ dst.days }} days)
      </div>
    </section>
  </div>
</template>
