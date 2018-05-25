import axios from 'axios'
import { decompressFromUTF16 } from 'lz-string'

export class ApiService {
  public getMetaData(): Promise<any> {
    return axios
      .get('http://localhost:8089/out.zip.json')
      .then(result => {
        return JSON.parse(decompressFromUTF16(result.data))
      })
  }
}
