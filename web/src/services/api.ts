import axios from 'axios'
import { decompressFromUTF16 } from 'lz-string'

let jsonUrl = process.env.JSON_SOURCE_URL as string

export class ApiService {
  public getMetaData(): Promise<any> {
    return axios.get(jsonUrl).then(result => {
      return JSON.parse(decompressFromUTF16(result.data))
    })
  }
}
