export interface ITreeNode {
  label: string
  path: string
  fullTypeName: string
  children: ITreeNode[]
  hasChilds: boolean
}
