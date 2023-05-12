<template>
  <div class="p-4 my-4 rounded-md bg-yellow-100 dark:bg-yellow-600">
    <div class="flex">
      <div>
        <i-carbon:warning-filled class="icon mt-1 text-yellow-400" />
      </div>
      <div class="ml-3">
        <Markdown :use="$slots.default" unwrap="p" />
      </div>
    </div>
  </div>
</template>
