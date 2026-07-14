import { describe, expect, it, beforeEach } from 'vitest'
import { TreeStore } from './TreeStore'
import { mockTreeItems } from '../../mocks/tree-items'
import type { TreeItem } from '../../types/tree'

function createStore(items: TreeItem[] = structuredClone(mockTreeItems)) {
  return new TreeStore(items)
}

describe('TreeStore', () => {
  let store: TreeStore

  beforeEach(() => {
    store = createStore()
  })

  describe('getAll', () => {
    it('returns the original items array', () => {
      const items = structuredClone(mockTreeItems)
      const localStore = new TreeStore(items)

      expect(localStore.getAll()).toBe(items)
      expect(localStore.getAll()).toHaveLength(8)
    })
  })

  describe('getItem', () => {
    it('returns item by id', () => {
      expect(store.getItem(1)?.label).toBe('Айтем 1')
      expect(store.getItem('91064cee')?.label).toBe('Айтем 2')
    })

    it('returns undefined for unknown id', () => {
      expect(store.getItem('missing')).toBeUndefined()
    })
  })

  describe('getChildren', () => {
    it('returns direct children', () => {
      const children = store.getChildren(1)

      expect(children).toHaveLength(2)
      expect(children.map(child => child.id)).toEqual(['91064cee', 3])
    })

    it('returns empty array when there are no children', () => {
      expect(store.getChildren(3)).toEqual([])
    })
  })

  describe('getAllChildren', () => {
    it('returns all descendants recursively', () => {
      const children = store.getAllChildren('91064cee')

      expect(children.map(child => child.id)).toEqual([4, 5, 6, 7, 8])
    })

    it('returns empty array for leaf node', () => {
      expect(store.getAllChildren(3)).toEqual([])
    })
  })

  describe('getAllParents', () => {
    it('returns chain from element to root with correct order', () => {
      const parents = store.getAllParents(7)

      expect(parents.map(item => item.id)).toEqual([7, 4, '91064cee', 1])
      expect(parents.map(item => item.label)).toEqual([
        'Айтем 7',
        'Айтем 4',
        'Айтем 2',
        'Айтем 1',
      ])
    })

    it('returns only root element for root node', () => {
      const parents = store.getAllParents(1)

      expect(parents).toHaveLength(1)
      expect(parents[0]?.id).toBe(1)
    })

    it('returns empty array for unknown id', () => {
      expect(store.getAllParents('missing')).toEqual([])
    })
  })

  describe('addItem', () => {
    it('adds item to storage', () => {
      store.addItem({ id: 99, parent: 1, label: 'Новый' })

      expect(store.getItem(99)?.label).toBe('Новый')
      expect(store.getChildren(1).map(child => child.id)).toContain(99)
      expect(store.getAll()).toHaveLength(9)
    })
  })

  describe('updateItem', () => {
    it('updates item fields', () => {
      store.updateItem({ id: 3, parent: 1, label: 'Обновлённый' })

      expect(store.getItem(3)?.label).toBe('Обновлённый')
    })

    it('moves item to another parent', () => {
      store.updateItem({ id: 3, parent: 4, label: 'Айтем 3' })

      expect(store.getChildren(1).map(child => child.id)).toEqual(['91064cee'])
      expect(store.getChildren(4).map(child => child.id)).toContain(3)
    })

    it('does nothing for unknown item', () => {
      const before = structuredClone(store.getAll())

      store.updateItem({ id: 'missing', parent: null, label: 'X' })

      expect(store.getAll()).toEqual(before)
    })
  })

  describe('removeItem', () => {
    it('removes item and all descendants', () => {
      store.removeItem('91064cee')

      expect(store.getItem('91064cee')).toBeUndefined()
      expect(store.getItem(4)).toBeUndefined()
      expect(store.getItem(7)).toBeUndefined()
      expect(store.getAll()).toHaveLength(2)
      expect(store.getAll().map(item => item.id)).toEqual([1, 3])
    })
  })

  describe('getTreeRows', () => {
    it('builds ag-grid paths from root to node', () => {
      const row = store.getTreeRows().find(item => item.id === 7)

      expect(row?.path).toEqual([1, '91064cee', 4, 7])
    })
  })
})
