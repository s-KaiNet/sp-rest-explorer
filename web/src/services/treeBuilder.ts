import { Metadata, EntityType } from './../../../parser/src/interfaces'
import { TreeNode } from '../models/TreeNode'

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
            hasChilds: false,
            leaf: true
          }

          let entity = this.metadata.entities[func.returnType]
          node.hasChilds = this.hasChilds(entity)

          if (node.hasChilds) node.leaf = false

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
          hasChilds: false,
          path: currentNode.path + this.separator + prop.name,
          leaf: true
        }

        let entity = this.metadata.entities[prop.typeName]
        node.hasChilds = this.hasChilds(entity)

        if (node.hasChilds) node.leaf = false

        results.push(node)
      })
    }

    if (entity.functions) {
      entity.functions.forEach(id => {
        let func = this.metadata.functions[id]
        let returnType = func.returnType ? func.returnType : ''
        let node: TreeNode = {
          label: func.name,
          fullTypeName: func.returnType,
          hasChilds: false,
          path: currentNode.path + this.separator + func.name + '()',
          children: [],
          leaf: true
        }

        let entity = this.metadata.entities[func.returnType]
        node.hasChilds = this.hasChilds(entity)

        if (node.hasChilds) node.leaf = false

        results.push(node)
      })
    }

    return results
  }

  private hasChilds(entity: EntityType): boolean {
    return (
      entity &&
      ((entity.functions && entity.functions.length > 0) ||
        (!!entity.navigationProperties &&
          entity.navigationProperties.length > 0))
    )
  }
}
