import axios from 'axios'
import { decompressFromUTF16 } from 'lz-string'
import { Metadata } from '../../../parser/src/interfaces'
import { ObjectHelper } from './objectHelper'

let jsonUrl = process.env.JSON_SOURCE_URL

export class Api {
  private static apiMetadata: Metadata
  private static cachedMetadataResults: { [key: number]: Metadata } = {}

  public static getMetadata(filters: string[]) {
    if (!this.apiMetadata) {
      throw new Error('Metadata is not loaded yet')
    }

    if (!filters) {
      throw new Error('filters cannot be empty')
    }
    let hash = ObjectHelper.hash(filters.join(''))
    if (this.cachedMetadataResults[hash]) {
      return this.cachedMetadataResults[hash]
    }

    let newMetadata = ObjectHelper.clone(this.apiMetadata)
    let funcIdsToRemove = []

    for (const funcId in newMetadata.functions) {
      if (newMetadata.functions.hasOwnProperty(funcId)) {
        const func = newMetadata.functions[funcId]
        for (const filter of filters) {
          if (func.name.indexOf(filter) === 0) {
            funcIdsToRemove.push(func.id)
            delete newMetadata.functions[func.id]
          }
        }
      }
    }

    for (const entityName in newMetadata.entities) {
      if (newMetadata.entities.hasOwnProperty(entityName)) {
        const entity = newMetadata.entities[entityName]
        for (const funcId of entity.functionIds) {
          let index = funcIdsToRemove.indexOf(funcId)
          if (index !== -1) {
            entity.functionIds.splice(index, 1)
          }
        }
      }
    }
    this.cachedMetadataResults[hash] = newMetadata
    return newMetadata
  }

  public static fetchMetaData(): Promise<Metadata> {
    return axios.get(jsonUrl).then(result => {
      let apiMetadata: Metadata = JSON.parse(decompressFromUTF16(result.data))
      this.apiMetadata = apiMetadata
      return apiMetadata
    })
  }
}
