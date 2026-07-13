export type TreeItemId = number | string

export interface TreeItem {
  id: TreeItemId
  parent: TreeItemId | null
  label: string
}

export interface TreeRow extends TreeItem {
  path: TreeItemId[]
}
