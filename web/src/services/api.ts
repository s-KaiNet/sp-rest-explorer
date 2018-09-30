import axios, { AxiosPromise } from 'axios'
import { decompressFromUTF16 } from 'lz-string'
import { Metadata, FunctionImport } from '../../../az-funcs/src/interfaces'
import { ObjectHelper } from './objectHelper'
import { MonthDiffData } from '../models/MonthDiffData'

let jsonUrl = process.env.JSON_SOURCE_URL
let diffUrl = process.env.DIFF_SOURCE_URL

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]
export class Api {
  private static apiMetadata: Metadata
  private static cachedMetadataResults: { [key: number]: Metadata } = {}

  public static getMetadata(filters: string[], search = '') {
    if (!this.apiMetadata) {
      throw new Error('Metadata is not loaded yet')
    }

    if (!filters) {
      throw new Error('filters cannot be empty')
    }
    let hash = ObjectHelper.hash(filters.join('') + search)
    if (this.cachedMetadataResults[hash]) {
      return this.cachedMetadataResults[hash]
    }

    let newMetadata = ObjectHelper.clone(this.apiMetadata)
    let funcIdsToRemove = []

    for (const funcId in newMetadata.functions) {
      if (newMetadata.functions.hasOwnProperty(funcId)) {
        const func = newMetadata.functions[funcId]
        if (this.shouldRemoveFunction(func, filters, search)) {
          funcIdsToRemove.push(func.id)
          delete newMetadata.functions[func.id]
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

  public static loadChangesData(): Promise<MonthDiffData[]> {
    let dataPromises: Promise<MonthDiffData>[] = []
    let today = new Date()
    for (let i = 0; i < 6; i++) {
      let now = new Date()
      now.setMonth(now.getMonth() - i)
      let fileUrl = diffUrl + this.getFileName(now)
      dataPromises.push(
        ((monthName: string, year: number): Promise<MonthDiffData> => {
          return axios.get<string>(fileUrl).then(result => {
            return {
              monthName: monthName,
              htmlValue: result.data,
              current: monthName === monthNames[today.getMonth()],
              year: year
            }
          })
        })(monthNames[now.getMonth()], now.getFullYear())
      )
    }

    return Promise.all(dataPromises)
  }

  private static getFileName(date: Date): string {
    return `${date.getFullYear()}y_m${date.getMonth()}_metadata_diff.html`
  }

  private static shouldRemoveFunction(
    func: FunctionImport,
    filters: string[],
    search: string
  ): boolean {
    if (!func.isRoot) {
      return false
    }
    if (search && !new RegExp(search, 'i').test(func.name)) {
      return true
    }

    for (const filter of filters) {
      if (func.name.indexOf(filter) === 0) {
        return true
      }
    }

    return false
  }
}
