import { Metadata, EntityType } from './../../../az-funcs/src/interfaces'
import { TreeNode, TreeNodeType } from '../models/TreeNode'

export class TreeBuilder {
  private separator = '/'

  constructor(private metadata: Metadata) {}

  public buildRootTree(): TreeNode[] {
    let results: TreeNode[] = []
    for (const funcId in this.metadata.functions) {
      if (this.metadata.functions.hasOwnProperty(funcId)) {
        const func = this.metadata.functions[funcId]
        if (func.isRoot) {
          let node: TreeNode = {
            label: func.name,
            children: [],
            fullTypeName: func.returnType,
            path: func.name,
            leaf: true,
            type: TreeNodeType.Function
          }

          let entity = this.metadata.entities[func.returnType]

          node.leaf = !this.hasChilds(entity)

          results.push(node)
        }
      }
    }

    return results
  }

  public getChildren(currentNode: TreeNode): TreeNode[] {
    let results: TreeNode[] = []
    let entity = this.metadata.entities[currentNode.fullTypeName]

    if (entity.navigationProperties) {
      entity.navigationProperties.forEach(prop => {
        let node: TreeNode = {
          label: prop.name,
          children: [],
          fullTypeName: prop.typeName,
          path: currentNode.path + this.separator + prop.name,
          leaf: true,
          type: TreeNodeType.Entity
        }

        let entity = this.metadata.entities[prop.typeName]
        node.leaf = !this.hasChilds(entity)

        results.push(node)
      })
    }

    if (entity.functionIds) {
      entity.functionIds.forEach(id => {
        let func = this.metadata.functions[id]
        let node: TreeNode = {
          label: func.name,
          fullTypeName: func.returnType,
          path: currentNode.path + this.separator + func.name,
          children: [],
          leaf: true,
          type: TreeNodeType.Function
        }

        let entity = this.metadata.entities[func.returnType]
        node.leaf = !this.hasChilds(entity)

        results.push(node)
      })
    }

    return results
  }

  private hasChilds(entity: EntityType): boolean {
    return (
      entity &&
      ((entity.functionIds && entity.functionIds.length > 0) ||
        (!!entity.navigationProperties &&
          entity.navigationProperties.length > 0))
    )
  }
}
