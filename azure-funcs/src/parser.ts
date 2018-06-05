import * as fs from 'fs'
import { compress, compressToUTF16 } from 'lz-string'

import { MetadataReader } from './metadataReader'
import { MetadataParser } from './metadataParser'
import { Utils } from './utils'

export async function parse(): Promise<any> {
  let metaDataReader = new MetadataReader()
  let result = await metaDataReader.readSharePointMetaData()

  let now = new Date()
  fs.writeFileSync(`./output/${now.getFullYear()}y_w${Utils.getWeekNumber(now)}_metadata.xml`, result)
  fs.writeFileSync(`./output/${now.getFullYear()}y_m${now.getMonth()}_metadata.xml`, result)
  fs.writeFileSync(`./output/metadata.latest.xml`, result)

  let parser = new MetadataParser(result)
  let parsed = await parser.parseMetadata()

  fs.writeFileSync(`./output/${now.getFullYear()}y_w${Utils.getWeekNumber(now)}_metadata.json`, JSON.stringify(parsed, null, 4))
  fs.writeFileSync(`./output/${now.getFullYear()}y_m${now.getMonth()}_metadata.json`, JSON.stringify(parsed, null, 4))
  fs.writeFileSync('./output/metadata.latest.json', JSON.stringify(parsed, null, 4))
  fs.writeFileSync('./output/metadata.latest.zip.json', compressToUTF16(JSON.stringify(parsed)))
}
