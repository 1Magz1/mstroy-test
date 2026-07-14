<script setup lang="ts">
import type { TreeItemId } from '~/shared/types/tree'
import { mockTreeItems } from '~/shared/mocks/tree-items'

const { store, items, treeRows, addItem, updateItem, removeItem } = useTreeStore(mockTreeItems)

const selectedId = ref<TreeItemId | null>(null)

function onSelect(id: TreeItemId | null) {
  selectedId.value = id
}

function onAdd(item: Parameters<typeof addItem>[0]) {
  addItem(item)
  selectedId.value = item.id
}

function onUpdate(item: Parameters<typeof updateItem>[0]) {
  updateItem(item)
  selectedId.value = item.id
}

function onRemove(id: TreeItemId) {
  removeItem(id)
  selectedId.value = null
}
</script>

<template>
  <main class="page">
    <ClientOnly>
      <TreeControls
        :store="store"
        :items="items"
        :selected-id="selectedId"
        @add="onAdd"
        @update="onUpdate"
        @remove="onRemove"
      />

      <TreeTable
        :store="store"
        :tree-rows="treeRows"
        :selected-id="selectedId"
        @select="onSelect"
      />

      <template #fallback>
        <p class="page__loading">
          Загрузка таблицы...
        </p>
      </template>
    </ClientOnly>
  </main>
</template>

<style scoped lang="scss">
.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 24px 48px;
  font-family: $font-family;
  color: $color-text;

  &__loading {
    margin: 0;
    color: $color-text-muted;
  }
}
</style>
