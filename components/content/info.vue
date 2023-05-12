<template>
  <div class="p-4 my-4 rounded-md bg-gray-100 dark:bg-gray-700">
    <div class="flex">
      <div>
        <i-carbon-book class="icon mt-1" />
      </div>
      <div class="ml-3">
        <Markdown :use="$slots.default" unwrap="p" />
      </div>
    </div>
  </div>
</template>
