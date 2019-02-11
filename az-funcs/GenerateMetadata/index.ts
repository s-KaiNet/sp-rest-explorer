import { compressToUTF16 } from 'lz-string'
import { createBlobService, BlobService } from 'azure-storage'
import { promisify } from 'bluebird'

import { MetadataReader } from './../src/metadataReader'
import { MetadataParser } from './../src/metadataParser'
import { Utils } from './../src/utils'
import { ContainerApiFilesName } from '../src/consts'

let now = new Date()

export = function run(context: any, timer: any): void {
  execute(context)
      .catch((err: any) => {
        context.log.error(err)
        context.done(err)
      })
}

async function execute(context: any): Promise<any> {
  context.log.info('Generating metadata files')

  let metaDataReader = new MetadataReader()
  let result = await metaDataReader.readSharePointMetaData()

  let blobService = createBlobService(Utils.getEnvironmentSetting('AzureWebJobsStorage'))
  let createContainerIfNotExistsAsync = promisify<any, string, BlobService.CreateContainerOptions>(blobService.createContainerIfNotExists.bind(blobService))
  let createBlockBlobFromTextAsync = promisify<any, string, string, string>(blobService.createBlockBlobFromText.bind(blobService))

  await createContainerIfNotExistsAsync(ContainerApiFilesName, {
    publicAccessLevel: 'blob'
  })

  await createBlockBlobFromTextAsync(ContainerApiFilesName, `${Utils.generateWeekBlobName(now)}.xml`, result)
  await createBlockBlobFromTextAsync(ContainerApiFilesName, `${Utils.generateMonthBlobName(now)}.xml`, result)

  context.bindings.latestXml = result

  let parser = new MetadataParser(result)
  let parsed = await parser.parseMetadata()

  await createBlockBlobFromTextAsync(ContainerApiFilesName, `${Utils.generateWeekBlobName(now)}.json`, JSON.stringify(parsed, null, 4))
  await createBlockBlobFromTextAsync(ContainerApiFilesName, `${Utils.generateMonthBlobName(now)}.json`, JSON.stringify(parsed, null, 4))

  context.bindings.latestJson = JSON.stringify(parsed, null, 4)
  context.bindings.latestZippedJson = compressToUTF16(JSON.stringify(parsed))

  context.log.info('Finished generation')
  context.done()
}
