import axios from 'axios'
import { decompressFromUTF16 } from 'lz-string'
import { Metadata } from '../../../parser/src/interfaces'

let jsonUrl = process.env.JSON_SOURCE_URL

export class Api {

  private static apiMetadata: Metadata

  public static get Metadata() {
    if (!this.apiMetadata) {
      throw new Error('Metadata is not loaded yet')
    }

    return this.apiMetadata
  }

  public static getMetaData(): Promise<Metadata> {
    return axios.get(jsonUrl).then(result => {
      let apiMetadata: Metadata = JSON.parse(decompressFromUTF16(result.data))
      this.apiMetadata = apiMetadata
      return apiMetadata
    })
  }
}
