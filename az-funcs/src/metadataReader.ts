import { ConfidentialClientApplication, UsernamePasswordRequest } from '@azure/msal-node'
import { Utils } from './utils'
import axios from 'axios'

export class MetadataReader {
  public async readSharePointMetaData(): Promise<string> {
    const username = Utils.getEnvironmentSetting('SP_User')
    const password = Utils.getEnvironmentSetting('SP_Password')
    const clientId = Utils.getEnvironmentSetting('AZ_ClientId')
    const clientSecret = Utils.getEnvironmentSetting('AZ_ClientSecret')
    const tenantId = Utils.getEnvironmentSetting('AZ_TenantId')
    const spUrl = Utils.getEnvironmentSetting('SP_Url')

    const msalConfig = {
      auth: {
        clientId: clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        clientSecret: clientSecret
      }
    }

    const pca = new ConfidentialClientApplication (msalConfig)
    const request: UsernamePasswordRequest = {
      scopes: [`${spUrl}/AllSites.Read`],
      username,
      password
    };

    const tokenResponse = await pca.acquireTokenByUsernamePassword(request);
    const token = tokenResponse.accessToken

    const response = await axios.get(`${spUrl}/_api/$metadata`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data
  }
}
