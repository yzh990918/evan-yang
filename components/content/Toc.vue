<script lang='ts' setup>
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
const breakpoints = useBreakpoints(breakpointsTailwind)
const { path } = useRoute()
const postName: string = path.split('/').reverse()[0] ?? ''
const contents = await queryContent('/').find()
const toc = ref()
const router = useRouter()
const tocRef = ref()
const largerThanXL = breakpoints.greater('xl')

onMounted(() => {
  toc.value = contents.filter(item => item._path.includes(postName))?.[0].body.toc

  const navigate = () => {
    if (location.hash) {
      document.querySelector(decodeURIComponent(location.hash))
        ?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleAnchors = (event: MouseEvent & { target: HTMLElement }) => {
    const link = event.target.closest('a')

    if (
      !event.defaultPrevented
      && link
      && event.button === 0
      && link.target !== '_blank'
      && link.rel !== 'external'
      && !link.download
      && !event.metaKey
      && !event.ctrlKey
      && !event.shiftKey
      && !event.altKey
    ) {
      const url = new URL(link.href)
      if (url.origin !== window.location.origin)
        return

      event.preventDefault()
      const { pathname, hash } = url
      if (hash && (!pathname || pathname === location.pathname)) {
        window.history.replaceState({}, '', hash)
        navigate()
      } else {
        router.push({ path: pathname, hash })
      }
    }
  }

  useEventListener(window, 'hashchange', navigate)
  useEventListener(tocRef.value!, 'click', handleAnchors, { passive: false })

  navigate()
  setTimeout(navigate, 500)
})
</script>

<template>
  <div
    ref="tocRef"
    class="fixed opacity-0 text-sm hover:opacity-80 transition-opacity duration-500 ease-out xl:block hidden"
    :class="toc && toc.links && toc.links.length && largerThanXL ? 'block right-10 top-24' : 'hidden'"
  >
    <ul v-if="(toc && toc.links && toc.links.length)" list-none>
      <strong>On this page</strong>
      <li v-for="link in toc.links" :key="link.text">
        <a class="op-60 hover-op-100 no-underline" :href="`#${link.id}`">
          {{ link.text }}
        </a>
        <ul v-if="link.children && link.children.length" class="my-1 list-none">
          <li v-for="child in link.children" :key="child.text">
            <a :href="`#${child.id}`" class="no-underline op-60 hover-op-100">
              {{ child.text }}
            </a>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.prose ul>li a {
  font-weight: normal;
  border-image: none;
}

.prose ul>li::before {
  display: none;
}
</style>
