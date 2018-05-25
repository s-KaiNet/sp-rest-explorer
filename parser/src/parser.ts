import * as fs from 'fs'
import { compress, compressToUTF16 } from 'lz-string'

import { MetadataReader } from './metaDataReader'
import { MetadataParser } from './metadataParser'

export async function parse(): Promise<any> {
  let metaDataReader = new MetadataReader('./config/_private.creds.json')
  let result = await metaDataReader.readSharePointMetaData()

  fs.writeFileSync('./output/out.xml', result)

  let parser = new MetadataParser(result)
  let parsed = await parser.parseMetadata()

  fs.writeFileSync('./output/out.json', JSON.stringify(parsed, null, 4))
  fs.writeFileSync('./output/out.zip.json', compressToUTF16(JSON.stringify(parsed)))
}
