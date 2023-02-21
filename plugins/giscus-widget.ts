import Giscus from '@giscus/vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('giscus-widget', Giscus)
})
