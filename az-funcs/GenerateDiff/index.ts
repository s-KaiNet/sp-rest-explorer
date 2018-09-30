import { createBlobService, BlobService } from 'azure-storage'
import { Utils } from '../src/utils'
import { promisify } from 'bluebird'
import * as path from 'path'

import { ContainerApiFilesName, ContainerDiffFilesName } from '../src/consts'
import { DiffGenerator } from '../src/diffGenerator'
import { TemplateGenerator } from '../src/templateGenerator'

export = function run(context: any, timer: any): void {
  execute(context)
      .catch((err: any) => {
        context.log.error(err)
        context.done(err)
      })
}

async function execute(context: any): Promise<any> {
  context.log.info('Generating diff files')

  let blobService = createBlobService(Utils.getEnvironmentSetting('AzureWebJobsStorage'))

  let getBlobToTextAsync = promisify<string, string, string, BlobService.GetBlobRequestOptions>(blobService.getBlobToText.bind(blobService))
  let createContainerIfNotExistsAsync = promisify<any, string, BlobService.CreateContainerOptions>(blobService.createContainerIfNotExists.bind(blobService))
  let createBlockBlobFromTextAsync = promisify<any, string, string, string>(blobService.createBlockBlobFromText.bind(blobService))

  let latestBlobName = `${Utils.generateMonthBlobName()}.json`

  let now = new Date()
  now.setMonth(now.getMonth() - 1)
  let previousBlobName = `${Utils.generateMonthBlobName(now)}.json`
  let latestJson = JSON.parse(await getBlobToTextAsync(ContainerApiFilesName, latestBlobName, {}))
  let previousJson = JSON.parse(await getBlobToTextAsync(ContainerApiFilesName, previousBlobName, {}))

  let diffJson = DiffGenerator.GenerateDiff(latestJson, previousJson)

  await createContainerIfNotExistsAsync(ContainerDiffFilesName, {
    publicAccessLevel: 'blob'
  })

  await createBlockBlobFromTextAsync(ContainerDiffFilesName, `${Utils.generateMonthBlobName()}_diff.json`, JSON.stringify(diffJson, null, 4))
  await createBlockBlobFromTextAsync(ContainerDiffFilesName, `metadata.latest.diff.json`, JSON.stringify(diffJson, null, 4))

  let result = TemplateGenerator.GenerateTemplate(diffJson, path.join(context.executionContext.functionDirectory, 'generator.hbs'))

  await createBlockBlobFromTextAsync(ContainerDiffFilesName, `${Utils.generateMonthBlobName()}_diff.html`, result)
  await createBlockBlobFromTextAsync(ContainerDiffFilesName, `metadata.latest.diff.html`, result)

  context.log.info('Finished generation')
  context.done()
}
