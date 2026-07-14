import { defineComponent, nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { useTreeStore } from './useTreeStore'
import { mockTreeItems } from '~/shared/mocks/tree-items'

type UseTreeStoreResult = ReturnType<typeof useTreeStore>

async function withUseTreeStore(initialItems = structuredClone(mockTreeItems)) {
  let state!: UseTreeStoreResult

  const Harness = defineComponent({
    setup() {
      state = useTreeStore(initialItems)
      return () => null
    },
  })

  await mountSuspended(Harness)
  await nextTick()

  return state
}

describe('useTreeStore', () => {
  it('initializes reactive items from initial data', async () => {
    const { items } = await withUseTreeStore()

    expect(items.value).toHaveLength(8)
    expect(items.value[0]?.label).toBe('Айтем 1')
  })

  it('exposes the same TreeStore instance', async () => {
    const { store, items } = await withUseTreeStore()

    expect(store.getAll()).toHaveLength(items.value.length)
    expect(store.getItem(7)?.label).toBe('Айтем 7')
  })

  it('returns tree rows for ag-grid', async () => {
    const { treeRows } = await withUseTreeStore()

    expect(treeRows.value).toHaveLength(8)

    const row = treeRows.value.find(item => item.id === 7)
    expect(row?.path).toEqual([1, '91064cee', 4, 7])
  })

  it('updates items and treeRows after addItem', async () => {
    const { items, treeRows, addItem } = await withUseTreeStore()
    const itemsBefore = items.value

    addItem({ id: 99, parent: 1, label: 'Новый элемент' })
    await nextTick()

    expect(items.value).toHaveLength(9)
    expect(items.value).not.toBe(itemsBefore)
    expect(items.value.some(item => item.id === 99)).toBe(true)
    expect(treeRows.value).toHaveLength(9)
    expect(treeRows.value.some(row => row.id === 99)).toBe(true)
  })

  it('updates items after updateItem', async () => {
    const { items, updateItem } = await withUseTreeStore()

    updateItem({ id: 3, parent: 1, label: 'Обновлённый айтем' })
    await nextTick()

    const updated = items.value.find(item => item.id === 3)
    expect(updated?.label).toBe('Обновлённый айтем')
  })

  it('updates items and treeRows after removeItem', async () => {
    const { items, treeRows, removeItem } = await withUseTreeStore()

    removeItem('91064cee')
    await nextTick()

    expect(items.value).toHaveLength(2)
    expect(items.value.map(item => item.id)).toEqual([1, 3])
    expect(treeRows.value).toHaveLength(2)
    expect(treeRows.value.some(row => row.id === 4)).toBe(false)
  })

  it('returns parent chain via getAllParents', async () => {
    const { getAllParents } = await withUseTreeStore()

    const parents = getAllParents(7)

    expect(parents.map(item => item.id)).toEqual([7, 4, '91064cee', 1])
  })

  it('reflects parent chain changes after updateItem', async () => {
    const { getAllParents, updateItem } = await withUseTreeStore()

    updateItem({ id: 3, parent: 4, label: 'Айтем 3' })
    await nextTick()

    const parents = getAllParents(3)

    expect(parents.map(item => item.id)).toEqual([3, 4, '91064cee', 1])
  })
})
