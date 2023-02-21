import { defineNuxtConfig } from 'nuxt'
import { defineHead, unpackMeta } from 'zhead'
import { SiteLanguage, SiteUrl } from './logic'
import type { Head } from '@zhead/schema'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/color-mode',
    '@vueuse/nuxt',
    '@nuxt/image-edge',
    'nuxt-schema-org',
    'nuxt-windicss',
    // custom content modules, need to come before the content module
    '~/modules/unplugin-icons',
    '~/modules/content-utils',
    '@nuxt/content',
  ],
  schemaOrg: {
    canonicalHost: SiteUrl,
    defaultLanguage: SiteLanguage,
  },
  css: [
    '@/resources/scrollbars.css',
    '@/resources/main.scss',
    '@/resources/dark-mono.css',
    '@/resources/input-mono.css',
  ],
  // https://color-mode.nuxtjs.org
  colorMode: {
    fallback: 'dark',
    classSuffix: '',
  },
  app: {
    head: defineHead<Head>({
      // fathom analytics
      script: [
        { type: 'module', src: 'https://unpkg.com/giscus?module' },
      ],
      link: [
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'preconnect', href: 'https://res.cloudinary.com' },
        { rel: 'preload', href: 'https://fonts.gstatic.com/s/dmmono/v10/aFTU7PB1QTsUX8KYhh0.ttf', as: 'font', crossorigin: 'anonymous' },
        { rel: 'stylesheet', href: 'https://gw.alipayobjects.com/os/k/font/lxgwwenkaiscreenr.css', as: 'font' },
        { rel: 'preload', href: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZg.ttf', as: 'font', crossorigin: 'anonymous' },
        { rel: 'preload', href: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZg.ttf', as: 'font', crossorigin: 'anonymous' },
        { rel: 'preload', href: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuDyYMZg.ttf', as: 'font', crossorigin: 'anonymous' },

      ],
      meta: [
        ...unpackMeta({
          twitterCard: 'summary_large_image',
          twitterSite: '@harlan_zw',
          twitterCreator: '@harlan_zw',
        }),
        { 'http-equiv': 'accept-ch', 'content': 'DPR' },
        { name: 'referrer', content: 'no-referrer' },
      ],
    }),
  },
  // https://content.nuxtjs.org
  content: {
    highlight: {
      // See the available themes on https://github.com/shikijs/shiki/blob/main/docs/themes.md#all-theme
      theme: 'material-darker',
    },
    markdown: {
      toc: {
        depth: 2,
      },
    },
  },

  image: {
    cloudinary: {
      baseURL: 'https://res.cloudinary.com/dl6o1xpyq/image/upload/images',
      modifiers: {
        quality: 'auto:best',
        dpr: 'auto',
      },
    },
    domains: [
      'avatars0.githubusercontent.com',
    ],
  },
})
