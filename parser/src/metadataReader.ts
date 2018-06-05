import * as sprequest from 'sp-request'
import { Utils } from './utils'

export class MetadataReader {
  public async readSharePointMetaData(): Promise<string> {
    let spr = sprequest.create({
      username: Utils.getEnvironmentSetting('SP_User'),
      password: Utils.getEnvironmentSetting('SP_Password')
    })
    let result = await spr.get(`${Utils.getEnvironmentSetting('SP_Url')}/_api/$metadata`)

    return result.body
  }
}
