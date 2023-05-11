import { useDark } from '@vueuse/core'

export function groupBy<T extends {}>(values: T[], fn: (v: T) => any) {
  return values.reduce((rv, x) => {
    (rv[fn(x)] = rv[fn(x)] || []).push(x)
    return rv
  }, {})
}

export function dayNth(input: string) {
  const d = Number.parseInt(input)
  if (d > 3 && d < 21)
    return `${d}th`
  switch (d % 10) {
    case 1: return `${d}st`
    case 2: return `${d}nd`
    case 3: return `${d}rd`
    default: return `${d}th`
  }
}

export const isDark = useDark()

/**
 * Credit to [@hooray](https://github.com/hooray)
 * @see https://github.com/vuejs/vitepress/pull/2347
 */
export function toggleDark(event: MouseEvent) {
  // @ts-expect-error experimental API
  const isAppearanceTransition = document.startViewTransition
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!isAppearanceTransition) {
    isDark.value = !isDark.value
    return
  }

  const x = event.clientX
  const y = event.clientY
  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y),
  )
  // @ts-expect-error: Transition API
  const transition = document.startViewTransition(async() => {
    isDark.value = !isDark.value
    await nextTick()
  })
  transition.ready
    .then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]
      document.documentElement.animate(
        {
          clipPath: isDark.value
            ? [...clipPath].reverse()
            : clipPath,
        },
        {
          duration: 400,
          easing: 'ease-out',
          pseudoElement: isDark.value
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
        },
      )
    })
}
