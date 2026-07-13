import type { TreeItem, TreeItemId } from '../types/tree'

export class TreeStore<T extends TreeItem = TreeItem> {
  private readonly items: T[]
  private readonly byId = new Map<TreeItemId, T>()

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

  addItem(item: T): void {
    this.items.push(item)
    this.byId.set(item.id, item)
  }

  private buildIndexes(): void {
    this.byId.clear()

    for (const item of this.items) {
      this.byId.set(item.id, item)
    }
  }
}
