<template>
  <div class="prose md:prose-lg prose-gray dark:prose-invert mb-8 md:mb-12">
    <slot />
  </div>
</template>

<style>
.prose {
  --fg: #555;
  --fg-deep: #222;
  --fg-deeper: #000;
  font-size: 1rem;
  line-height: 1.75;
  font-weight: 500;
  color: #24292fe6;
}

.dark .prose {
  color: #E4E4E7;
}

 .prose
 h2,
 h3,
 h4,
 h5,
 h6 {
  font-family: "LXGW WenKai Screen R", Calibri, Arial, sans-serif;
 }

.prose a {
  color: #191d21e6;
}

@media (min-width: 768px) {
  .md\:prose-lg {
    font-size: 1rem;
    line-height: 1.75;
  }

  .md\:prose-lg p {
    margin-top: 1em;
    margin-bottom: 1em;
  }
    .prose a {
      color: #191d21e6;
    }
}

.prose blockquote {
  font-weight: normal;
  font-style: normal;
  line-height: 1.7em;
  padding: 0.6em 1.2em;
  opacity: 0.9;
  color: inherit;
  margin-left: 0;
  margin-right: 0;
  border-left-width: 0.25rem;
  border-color: rgba(125, 125, 125, 0.3);
  quotes: "\201C" "\201D" "\2018" "\2019";
  margin-top: 1.6em;
  margin-bottom: 1.6em;
}

.dark .prose blockquote {
  color: #d1d5db;
}

.prose blockquote> :first-child {
  margin-top: 0;
}

.prose blockquote> :last-child {
  margin-bottom: 0;
}

.prose blockquote p:first-of-type::before {
  content: none;
}

.prose blockquote p:first-of-type::after {
  content: none;
}

.prose strong {
  color: var(--fg-deep);
  font-weight: 600;
}

.prose ol[type="A"] {
  --list-counter-style: upper-alpha;
}

.prose ol[type="a"] {
  --list-counter-style: lower-alpha;
}

.prose ol[type="A s"] {
  --list-counter-style: upper-alpha;
}

.prose ol[type="a s"] {
  --list-counter-style: lower-alpha;
}

.prose ol[type="I"] {
  --list-counter-style: upper-roman;
}

.prose ol[type="i"] {
  --list-counter-style: lower-roman;
}

.prose ol[type="I s"] {
  --list-counter-style: upper-roman;
}

.prose ol[type="i s"] {
  --list-counter-style: lower-roman;
}

.prose ol[type="1"] {
  --list-counter-style: decimal;
}

.prose ol>li {
  position: relative;
  padding-left: 1.75em;
}

.prose ol>li::before {
  content: counter(list-item, var(--list-counter-style, decimal)) ".";
  position: absolute;
  font-weight: 400;
  color: #6b7280;
  left: 0;
}

.prose ul>li {
  position: relative;
  padding-left: 1.75em;
}

.prose ul>li::before {
  content: "";
  position: absolute;
  background-color: #d1d5db;
  border-radius: 50%;
  width: 0.375em;
  height: 0.375em;
  top: calc(0.875em - 0.1875em);
  left: 0.25em;
}

.prose code {
  color: var(--fg-deep);
  font-weight: 600;
  font-size: 0.875rem;
  font-family: Input Mono;
}

.prose code::before {
  content: "`";
}

.prose code::after {
  content: "`";
}

.prose a code {
  color: #111827;
}

.prose pre {
  color: #e5e7eb;
  overflow-x: auto;
  font-size: 0.875em;
  line-height: 1.7142857;
  margin-top: 1.7142857em;
  margin-bottom: 1.7142857em;
  border-radius: 0.375rem;
  padding-top: 0.8571429em;
  padding-right: 1.1428571em;
  padding-bottom: 0.8571429em;
  padding-left: 1.1428571em;
}
.dark .prose pre {
  background-color: #23272F;
}

.prose pre code {
  background-color: transparent;
  border-width: 0;
  border-radius: 0;
  padding: 0;
  font-weight: 400;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
  line-height: inherit;
}

.prose pre code::before {
  content: none;
}

.prose pre code::after {
  content: none;
}

.prose h2 a {
  @apply bg-gradient-to-b from-emerald-500 to-teal-600 bg-clip-text before: opacity-0 after:opacity-0;
  -webkit-text-fill-color: transparent !important;
}

.dark .prose h2 a {
  background: linear-gradient(180deg, rgba(#6ee7b7, 1), rgba(#2dd4bf, 0.9)) !important;
  background-clip: text !important;
  -webkit-background-clip: text !important;
}

.prose h3 a {
  @apply opacity-90 after: opacity-0 before:opacity-0
}

@keyframes text-glow {
  0% {
    filter: drop-shadow(0px 0px 2px rgba(56, 239, 125, 0.5));
  }

  100% {
    filter: drop-shadow(0px 1px 8px rgba(56, 239, 125, 1));
  }
}

/* Fix icons in headers */
.prose h1 svg {
  @apply ml-1 md: (w-8 h-8) w-6 h-6 mb-1 text-gray-500 inline-block;
}

.prose a svg {
  width: 1.2em;
  height: 1.2em;
  line-height: 1.2em;
}

.prose h2 a,
.prose h3 a {
  @apply no-underline hover: border-none;
}
</style>
