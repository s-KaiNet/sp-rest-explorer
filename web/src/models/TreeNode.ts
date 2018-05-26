export enum TreeNodeType {
  Entity,
  Function
}

export interface TreeNode {
  label: string
  path: string
  fullTypeName: string
  children: TreeNode[]
  leaf: boolean
  type: TreeNodeType
}
