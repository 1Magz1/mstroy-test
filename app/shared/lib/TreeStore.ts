import type { TreeItem, TreeItemId } from '../types/tree'

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

  hasChildren(id: TreeItemId): boolean {
    return this.getChildren(id).length > 0
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
}
