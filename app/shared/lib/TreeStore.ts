import type { TreeItem, TreeItemId, TreeRow } from '../types/tree'

export class TreeStore<T extends TreeItem = TreeItem> {
  private readonly items: T[]
  private readonly byId = new Map<TreeItemId, T>()
  private readonly childrenByParent = new Map<TreeItemId | null, T[]>()

  constructor(items: T[]) {
    this.items = items
    this.buildIndexes()
  }

  getAll(): T[] {
    return this.items
  }

  getItem(id: TreeItemId): T | undefined {
    return this.byId.get(id)
  }

  getChildren(id: TreeItemId): T[] {
    return this.childrenByParent.get(id) ?? []
  }

  getAllChildren(id: TreeItemId): T[] {
    const result: T[] = []
    const queue = [...this.getChildren(id)]

    while (queue.length > 0) {
      const child = queue.shift()!
      result.push(child)
      queue.push(...this.getChildren(child.id))
    }

    return result
  }

  getAllParents(id: TreeItemId): T[] {
    const parents: T[] = []
    let current = this.byId.get(id)

    while (current?.parent != null) {
      const parent = this.byId.get(current.parent)

      if (!parent) {
        break
      }

      parents.push(parent)
      current = parent
    }

    return parents
  }

  addItem(item: T): void {
    this.items.push(item)
    this.byId.set(item.id, item)
    this.appendChild(item.parent, item)
  }

  updateItem(item: T): void {
    const existing = this.byId.get(item.id)

    if (!existing) {
      return
    }

    const previousParent = existing.parent

    Object.assign(existing, item)

    if (previousParent !== item.parent) {
      this.removeChild(previousParent, item.id)
      this.appendChild(item.parent, existing)
    }
  }

  removeItem(id: TreeItemId): void {
    const idsToRemove = new Set<TreeItemId>([id])

    for (const child of this.getAllChildren(id)) {
      idsToRemove.add(child.id)
    }

    for (const removeId of idsToRemove) {
      const item = this.byId.get(removeId)

      if (!item) {
        continue
      }

      this.removeChild(item.parent, removeId)
      this.byId.delete(removeId)
    }

    let writeIndex = 0

    for (const item of this.items) {
      if (!idsToRemove.has(item.id)) {
        this.items[writeIndex] = item
        writeIndex += 1
      }
    }

    this.items.length = writeIndex
  }

  hasChildren(id: TreeItemId): boolean {
    return this.getChildren(id).length > 0
  }

  getPath(id: TreeItemId): TreeItemId[] {
    const item = this.byId.get(id)

    if (!item) {
      return []
    }

    return [
      ...this.getAllParents(id).reverse().map(parent => parent.id),
      item.id,
    ]
  }

  getTreeRows(): TreeRow[] {
    return this.items.map(item => ({
      ...item,
      path: this.getPath(item.id),
    }))
  }

  private buildIndexes(): void {
    this.byId.clear()
    this.childrenByParent.clear()

    for (const item of this.items) {
      this.byId.set(item.id, item)
      this.appendChild(item.parent, item)
    }
  }

  private appendChild(parentId: TreeItemId | null, item: T): void {
    const children = this.childrenByParent.get(parentId)

    if (children) {
      children.push(item)
      return
    }

    this.childrenByParent.set(parentId, [item])
  }

  private removeChild(parentId: TreeItemId | null, childId: TreeItemId): void {
    const children = this.childrenByParent.get(parentId)

    if (!children) {
      return
    }

    const childIndex = children.findIndex(child => child.id === childId)

    if (childIndex === -1) {
      return
    }

    children.splice(childIndex, 1)

    if (children.length === 0) {
      this.childrenByParent.delete(parentId)
    }
  }
}
