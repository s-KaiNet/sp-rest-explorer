export interface TreeNode {
  label: string
  path: string
  fullTypeName: string
  children: TreeNode[]
  hasChilds: boolean
  leaf: boolean
}
