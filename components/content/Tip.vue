<template>
  <div class="p-4 my-4 rounded-md bg-green-50 dark:bg-green-700">
    <div class="flex">
      <div>
        <i-carbon-information-filled class="icon mt-1 text-green-500" />
      </div>
      <div class="ml-3">
        <Markdown :use="$slots.default" unwrap="p" />
      </div>
    </div>
  </div>
</template>
