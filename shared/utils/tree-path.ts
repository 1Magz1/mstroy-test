import type { TreeItem, TreeItemId, TreeRow } from '../types/tree'

export function buildTreeRows(items: TreeItem[]): TreeRow[] {
  const byId = new Map<TreeItemId, TreeItem>(items.map(item => [item.id, item]))

  return items.map((item) => {
    const path: TreeItemId[] = []
    let current: TreeItem | undefined = item

    while (current) {
      path.unshift(current.id)
      current = current.parent != null ? byId.get(current.parent) : undefined
    }

    return { ...item, path }
  })
}

export function hasChildren(items: TreeItem[], id: TreeItemId): boolean {
  return items.some(item => item.parent === id)
}
