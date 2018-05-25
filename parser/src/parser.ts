import * as fs from 'fs';

import { MetadataReader } from './metaDataReader';
import { MetadataParser } from './metadataParser';

export async function parse(): Promise<any> {
    let metaDataReader = new MetadataReader('./config/_private.creds.json');
    let result = await metaDataReader.readSharePointMetaData();

    fs.writeFileSync('./output/out.xml', result);

    let parser = new MetadataParser(result);
    let parsed = await parser.parseMetadata();

    fs.writeFileSync('./output/out.json', JSON.stringify(parsed));
}
