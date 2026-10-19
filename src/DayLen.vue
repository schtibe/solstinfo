<script setup lang="ts">
import { computed, ref } from 'vue'
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
  <div class="season-info">
    <small>{{ fmtDay(today) }} · Bern</small>

    <h1>{{ nextSolstice.day - today }} days until the {{ nextSolstice.kind }} solstice</h1>
    <small>Mirror day: {{ nextMirror.date }}</small>

    <h2>{{ today - fartherSolstice.day }} days since the {{ fartherSolstice.kind }} solstice</h2>
    <small>Mirror day: {{ fartherMirror.date }}</small>

    <section>
      <h3>Next Equinoxes</h3>
      <ul>
        <li v-for="e in equinoxes" :key="e.kind">
          {{ e.kind }}: {{ e.date }} (in {{ e.days }} days)
        </li>
      </ul>
    </section>

    <section>
      <h3>Next DST switch</h3>
      <p>{{ dst.date }}, {{ dst.label }} (in {{ dst.days }} days)</p>
    </section>

    <section>
      <h3>Sunrise &amp; sunset in Bern</h3>
      <p>Sunrise: {{ sunTimes.sunrise }}</p>
      <p>Sunset: {{ sunTimes.sunset }}</p>
    </section>
  </div>
</template>
