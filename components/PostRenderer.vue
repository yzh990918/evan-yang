<script lang="ts" setup>
import { unpackMeta } from '@zhead/vue'
import { dayNth } from '~/logic'
import type { PropType } from 'vue'
import type { Post } from '~/types'

const props = defineProps({
  post: Object as PropType<Post>,
})

const formatPublishedDate = (options: any) => new Intl.DateTimeFormat('en', options).format(new Date(props.post.publishedAt))
const year = formatPublishedDate({ year: 'numeric' })
const month = formatPublishedDate({ month: 'short' })
const day = dayNth(formatPublishedDate({ day: 'numeric' }))

const schema = computed(() => props.post.schema || {})
const backTopVisible = ref(false)

useHead({
  meta: unpackMeta({
    twitterLabel1: 'Written on',
    twitterData1: `${month} ${day}, ${year}`,
    twitterLabel2: 'Reading time',
    twitterData2: `${props.post.readingMins} mins`,
  }),
})

useEventListener('scroll', () => {
  backTopVisible.value = window.scrollY > window.innerHeight
})

const handleBackTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const colorMode = useColorMode()
</script>

<template>
  <div>
    <SchemaOrgArticle v-bind="{ ...schema }" />
    <Breadcrumbs class="mb-2" />
    <h1 class="font-header font-weight-800 text-4xl !leading-11 !md:(text-4xl leading-14) mb-7">
      {{ post.title }}
    </h1>
    <!-- <TagList v-if="post.tags" :tags="post.tags" class="mb-5" /> -->
    <div class="sm:(flex space-x-4 mb-8 text-lg space-y-0) opacity-80 space-y-3 items-center font-semibold">
      <div class="text-base">
        Published {{ month }} {{ day }} {{ year }}
      </div>
      <div class="text-xs hidden sm:block">
        ☕️☕️
      </div>
      <div class="text-base">
        {{ post.readingMins }} min
      </div>
    </div>
    <Prose>
      <ContentRenderer :value="post" class="max-w-none">
        <template #not-found>
          <h1 class="text-2xl">
            Page not found
          </h1>
        </template>
      </ContentRenderer>
    </Prose>
    <div class="z-[9] right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] fixed font-lg flex flex-col">
      <button class="w-8 h-8 mt-2 flex items-center justify-center rounded-md border border-[#11998e] text-[#11998e] hover:opacity-100 focus:opacity-100 focus:outline-none transition-all duration-300 transform-gpu translate-x-[60px]" :class="backTopVisible ? 'opacity-70 translate-x-0' : 'opacity-0'" @click="handleBackTop">
        <i-carbon-up-to-top class="text-base" />
      </button>
    </div>
    <NuxtLink class="font-mono no-underline opacity-70" :to="$route.path.split('/').slice(0, -1).join('/') || '/'">
      cd ..
    </NuxtLink>
    <div class="mt-6 flex">
      <giscus-widget
        id="inject-comments"
        repo="yzh990918/evan-yang"
        repo-id="R_kgDOIPJ3VA"
        category="Announcements"
        category-id="DIC_kwDOIPJ3VM4CUWD4"
        mapping="pathname"
        strict="0"
        reactions-enabled="1"
        emit-metadata="1"
        input-position="bottom"
        :theme="colorMode.value === 'dark' ? 'dark' : 'light'"
        lang="en"
        loading="lazy"
        host="https://giscus.app"
        async
      />
    </div>
  </div>
</template>
