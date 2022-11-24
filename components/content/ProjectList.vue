<script lang="ts" setup>
const { data: categories } = await useProjects()
</script>

<template>
  <div class="space-y-10">
    <div v-for="(category, cKey) in categories.body" :key="cKey">
      <SubTitle>{{ category.name }}</SubTitle>
      <div class="grid md:grid-cols-2 gap-5">
        <ProjectCard v-for="(project, pKey) in category.projects" :key="pKey" :project="project" />
      </div>
    </div>
  </div>
  <NuxtLink class="font-mono no-underline opacity-70  mt-8" :to="$route.path.split('/').slice(0, -1).join('/') || '/'">
    cd ..
  </NuxtLink>
</template>
