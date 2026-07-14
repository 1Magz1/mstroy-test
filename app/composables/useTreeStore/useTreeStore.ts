import { TreeStore } from '~/shared/lib/TreeStore/TreeStore'
import type { TreeItem, TreeItemId } from '~/shared/types/tree'

export function useTreeStore<T extends TreeItem>(initialItems: T[]) {
  const store = new TreeStore(initialItems)

  function cloneItems() {
    return store.getAll().map(item => ({ ...item }))
  }

  const items = shallowRef(cloneItems())

  function sync() {
    items.value = cloneItems()
  }

  const treeRows = computed(() => {
    const _ = items.value.length
    return store.getTreeRows()
  })

  function addItem(item: T) {
    store.addItem(item)
    sync()
  }

  function updateItem(item: T) {
    store.updateItem(item)
    sync()
  }

  function removeItem(id: T['id']) {
    store.removeItem(id)
    sync()
  }

  function getAllParents(id: TreeItemId) {
    const _ = items.value.length
    return store.getAllParents(id)
  }

  return {
    store,
    items,
    treeRows,
    addItem,
    updateItem,
    removeItem,
    getAllParents,
  }
}
