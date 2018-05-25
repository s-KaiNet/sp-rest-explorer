import { Metadata, EntityType } from './../../../parser/src/interfaces'
import { ITreeNode } from '../models/ITreeNode'

export class TreeBuilder {
  private separator = '->'

  constructor(private metadata: Metadata) {}

  public buildRootTree(): ITreeNode[] {
    let results: ITreeNode[] = []
    for (const funcId in this.metadata.functions) {
      if (this.metadata.functions.hasOwnProperty(funcId)) {
        const func = this.metadata.functions[funcId]
        if (func.isRoot) {
          let node: ITreeNode = {
            label: func.name,
            children: [],
            fullTypeName: func.returnType,
            path: func.returnType,
            hasChilds: false
          }

          let entity = this.metadata.entities[func.returnType]
          node.hasChilds = this.hasChilds(entity)

          results.push(node)
        }
      }
    }

    return results
  }

  public getChildren(currentNode: ITreeNode): ITreeNode[] {
    let results: ITreeNode[] = []
    let entity = this.metadata.entities[currentNode.fullTypeName]

    if (entity.navigationProperties) {
      entity.navigationProperties.forEach(prop => {
        let node: ITreeNode = {
          label: prop.name,
          children: [],
          fullTypeName: prop.typeName,
          hasChilds: false,
          path: currentNode.path + this.separator + prop.typeName
        }

        let entity = this.metadata.entities[prop.typeName]
        node.hasChilds = this.hasChilds(entity)

        results.push(node)
      })
    }

    if (entity.functions) {
      entity.functions.forEach(id => {
        let func = this.metadata.functions[id]
        let returnType = func.returnType ? func.returnType : ''
        let node: ITreeNode = {
          label: func.name,
          fullTypeName: func.returnType,
          hasChilds: false,
          path: currentNode.path + this.separator + returnType,
          children: []
        }

        let entity = this.metadata.entities[func.returnType]
        node.hasChilds = this.hasChilds(entity)

        results.push(node)
      })
    }

    return results
  }

  private hasChilds(entity: EntityType): boolean {
    return entity && (!!entity.functions || !!entity.navigationProperties)
  }
  private populateChildren(
    currentChildren: ITreeNode[],
    type: string,
    parent: ITreeNode
  ): void {
    if (!type || type.indexOf('Edm') === 0) {
      return
    }

    let entity = this.metadata.entities[type]

    if (entity.navigationProperties) {
      entity.navigationProperties.forEach(prop => {
        let node: ITreeNode = {
          label: prop.name,
          children: [],
          fullTypeName: prop.typeName,
          hasChilds: false,
          path: parent.path + this.separator + prop.typeName
        }

        currentChildren.push(node)

        if (!this.hasInfiniteTypeRecursion(parent.path, prop.typeName)) {
          this.populateChildren(node.children, prop.typeName, node)
        }
      })
    }

    if (entity.functions) {
      entity.functions.forEach(id => {
        let func = this.metadata.functions[id]
        let returnType = func.returnType ? func.returnType : ''
        let node: ITreeNode = {
          label: func.name,
          fullTypeName: func.returnType,
          hasChilds: false,
          path: parent.path + this.separator + returnType,
          children: []
        }

        currentChildren.push(node)

        if (!this.hasInfiniteTypeRecursion(parent.path, func.returnType)) {
          this.populateChildren(node.children, func.returnType, node)
        }
      })
    }
  }

  private hasInfiniteTypeRecursion(
    parentPath: string,
    typeToCheck: string
  ): boolean {
    if (!typeToCheck) {
      return false
    }

    let parents = parentPath.split(this.separator)
    return parents.indexOf(typeToCheck) !== -1
  }
}
