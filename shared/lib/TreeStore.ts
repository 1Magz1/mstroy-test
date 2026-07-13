import type { TreeItem } from '../types/tree'

export class TreeStore<T extends TreeItem = TreeItem> {
  private readonly items: T[]

  constructor(items: T[]) {
    this.items = items
  }

  getAll(): T[] {
    return this.items
  }
}
