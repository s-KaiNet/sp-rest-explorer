import axios from 'axios'
import { decompressFromUTF16 } from 'lz-string'
import { Metadata } from '../../../parser/src/interfaces'

let jsonUrl = process.env.JSON_SOURCE_URL

export class ApiService {
  private static metadataPromise: Promise<Metadata>

  public static getMetaData(): Promise<Metadata> {
    if (this.metadataPromise) {
      return this.metadataPromise
    }

    this.metadataPromise = axios.get(jsonUrl).then(result => {
      let apiMetadata: Metadata = JSON.parse(decompressFromUTF16(result.data))
      return apiMetadata
    })

    return this.metadataPromise
  }
}
