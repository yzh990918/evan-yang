<template>
  <div class="p-4 my-4 rounded-md bg-red-200 dark:bg-red-400">
    <div class="flex">
      <div>
        <i-carbon-warning-alt-filled class="icon mt-1 text-red-400 dark:text-red-200" />
      </div>
      <div class="ml-3">
        <Markdown :use="$slots.default" unwrap="p" />
      </div>
    </div>
  </div>
</template>
