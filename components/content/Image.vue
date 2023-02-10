<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<script lang="ts" setup>
const props = withDefaults(defineProps<{
  alt: string
  src: string
  lazy?: boolean | 'false' | 'true'
  width?: number
}>(), {
  lazy: true,
})

const shiftLargeImgStyles = computed(() => {
  if (!props.width)
    return {}
  if (props.width <= 700) {
    return {
      width: `${props.width}px`,
    }
  }
  const transformX = `-${Math.round((props.width - 700) / 2)}px`
  return {
    'width': `${props.width}px`,
    '--tw-translate-x': transformX,
  }
})

const loadingType = computed(() => {
  return (props.lazy === true || props.lazy === 'true') ? 'lazy' : 'eager'
})

// eslint-disable-next-line vue/no-setup-props-destructure
const src = props.src
const provider = props.src.startsWith('https://') ? '' : 'cloudinary'
</script>

<template>
  <figure :style="shiftLargeImgStyles">
    <nuxt-img
      v-bind="$attrs"
      :alt="alt"
      :width="width"
      :src="src"
      :loading="loadingType"
      :provider="provider"
    />
  </figure>
</template>

<style scoped>
figure {
  @apply transform lg: ( !my-8 max-w-900px) mx-auto max-w-full;
}

@media(max-width: 1024px) {
  figure {
    @apply !translate-x-0;
  }
}

@media(min-width: 1024px) {
  figure {
    max-width: 700px;
    --tw-translate-x: 0 !important;
  }
}

figure :deep(img:not([src$=".svg"])) {
  @apply w-auto rounded-lg shadow-lg;
}
</style>
