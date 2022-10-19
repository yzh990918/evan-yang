<template>
  <div class="code-block transform relative lg:(-translate-x-0px w-700px) my-12 !py-0  max-h-700px overflow-y-auto">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.code-block:before {
  @apply absolute top-2 right-3 z-2 text-sm text-gray-500;
  content: attr(data-language);
}

:deep(pre) {
  font-family: "Roboto Mono","SFMono-Regular",Menlo,Consolas,"Liberation Mono",Courier,monospace;
  font-size: 0.92rem !important;
  line-height: 1.7;
  counter-reset: number;
  margin: 0 !important;
}

.code-block--with-filename :deep(pre) {
  padding-top: 2em;
}

:deep(.code-block__filename) {
  @apply rounded text-xs px-2 py-1 absolute top-0 left-0 bg-gray-700/70 text-white;
}

:deep(.line) {
  counter-increment: number;

  @apply text-xs &:before {
    display: inline-block;
    text-align: center;
    padding-right: 15px;
    content: counter(number);
  }
}
</style>
