<script setup lang="ts">
import { mockTreeItems } from '../../shared/mocks/tree-items'
</script>

<template>
  <main class="page">
    <ClientOnly>
      <TreeTable :items="mockTreeItems" />
      <template #fallback>
        <p class="page__loading">
          Загрузка таблицы...
        </p>
      </template>
    </ClientOnly>
  </main>
</template>

<style scoped>
.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 24px 48px;
  font-family: Inter, system-ui, sans-serif;
  color: #1f2933;
}

.page__loading {
  margin: 0;
  color: #52606d;
}
</style>
