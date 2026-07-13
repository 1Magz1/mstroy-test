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
