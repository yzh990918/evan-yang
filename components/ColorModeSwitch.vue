<script setup lang="ts">
import { isDark, toggleDark } from '~/logic'
</script>

<template>
  <button
    aria-label="Color Mode"
    :title="`Enable ${isDark ? 'Light' : 'Dark'} Mode`"
    class="p-2 link inline-block hover:text-gray-700 dark:hover:text-gray-300 group"
    @click.prevent="toggleDark"
  >
    <div v-if="isDark" class="icon">
      <i-line-md-moon class="icon icon--off" />
      <i-line-md-moon-twotone class="icon icon--on" />
    </div>
    <div v-if="!isDark" class="icon">
      <i-line-md-sunny-outline class="icon icon--off" />
      <i-line-md-sunny-outline-loop class="icon icon--on" />
    </div>
  </button>
</template>
