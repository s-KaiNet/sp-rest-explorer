import { AuthConfig } from 'node-sp-auth-config';
import * as sprequest from 'sp-request';

export class MetadataReader {
    constructor(private configPath: string) { }

    public async readSharePointMetaData(): Promise<string> {
        const authConfig = new AuthConfig({
            configPath: this.configPath,
            encryptPassword: true,
            saveConfigOnDisk: true
        });

        let ctx = await authConfig.getContext();
        let spr = sprequest.create(ctx.authOptions);
        let result = await spr.get(`${ctx.siteUrl}/_api/$metadata`);

        return result.body;
    }
}
