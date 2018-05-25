import axios from 'axios'

export class ApiService {
  public getMetaData(): Promise<any> {
    return axios
      .get('http://localhost:8089/out.json', {
        headers: {
          Accept: 'application/json'
        }
      })
      .then(result => result.data)
  }
}
