import { createBlobService, BlobService } from 'azure-storage'
import { Utils } from '../src/utils'
import { promisify } from 'bluebird'

import { ContainerApiFilesName, ContainerDiffFilesName } from '../src/consts'
import { DiffGenerator } from '../src/diffGenerator'
import { TemplateGenerator } from '../src/templateGenerator'

let now = new Date()

export = function run(context: any, timer: any): void {
  execute(context)
    .catch((err: any) => {
      context.log.error(err)
      context.done(err)
    })
}

async function execute(context: any): Promise<any> {
  context.log.info('Generating diff files')

  let diffJson = await getDiff()

  await saveDiff(diffJson)

  await generateAndSaveTemplate(diffJson, context.executionContext.functionDirectory)

  context.log.info('Finished generation')
  context.done()
}

async function getDiff(): Promise<any> {
  let blobService = createBlobService(Utils.getEnvironmentSetting('AzureWebJobsStorage'))

  let getBlobToTextAsync = promisify<string, string, string, BlobService.GetBlobRequestOptions>(blobService.getBlobToText.bind(blobService))

  let latestBlobName = `${Utils.generateMonthBlobName(now)}.json`

  let previousMonth = new Date(now)
  previousMonth.setMonth(previousMonth.getMonth() - 1)

  let previousBlobName = `${Utils.generateMonthBlobName(previousMonth)}.json`
  let latestJson = JSON.parse(await getBlobToTextAsync(ContainerApiFilesName, latestBlobName, {}))
  let previousJson = JSON.parse(await getBlobToTextAsync(ContainerApiFilesName, previousBlobName, {}))

  return DiffGenerator.GenerateDiff(latestJson, previousJson)
}

async function saveDiff(diffJson: any): Promise<void> {
  let blobService = createBlobService(Utils.getEnvironmentSetting('AzureWebJobsStorage'))

  let createContainerIfNotExistsAsync = promisify<any, string, BlobService.CreateContainerOptions>(blobService.createContainerIfNotExists.bind(blobService))
  let createBlockBlobFromTextAsync = promisify<any, string, string, string>(blobService.createBlockBlobFromText.bind(blobService))

  await createContainerIfNotExistsAsync(ContainerDiffFilesName, {
    publicAccessLevel: 'blob'
  })

  await createBlockBlobFromTextAsync(ContainerDiffFilesName, `${Utils.generateMonthBlobName(now)}_diff.json`, JSON.stringify(diffJson, null, 4))
  await createBlockBlobFromTextAsync(ContainerDiffFilesName, `metadata.latest.diff.json`, JSON.stringify(diffJson, null, 4))
}

async function generateAndSaveTemplate(diffJson: any, localPath: any): Promise<void> {
  let blobService = createBlobService(Utils.getEnvironmentSetting('AzureWebJobsStorage'))

  let createBlockBlobFromTextAsync = promisify<any, string, string, string>(blobService.createBlockBlobFromText.bind(blobService))

  let templateGenerator = new TemplateGenerator()
  let result = templateGenerator.GenerateTemplate(diffJson, localPath)

  await createBlockBlobFromTextAsync(ContainerDiffFilesName, `${Utils.generateMonthBlobName(now)}_diff.html`, result.html)
  await createBlockBlobFromTextAsync(ContainerDiffFilesName, `${Utils.generateMonthBlobName(now)}_diffChanges.json`, JSON.stringify(result.diffChanges))
  await createBlockBlobFromTextAsync(ContainerDiffFilesName, `metadata.latest.diffChanges.json`, JSON.stringify(result.diffChanges))
  await createBlockBlobFromTextAsync(ContainerDiffFilesName, `metadata.latest.diff.html`, result.html)

  let nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  // explicitly set empty template for next month to avoid errors on 1st day of a month
  await createBlockBlobFromTextAsync(ContainerDiffFilesName, `${Utils.generateMonthBlobName(nextMonth)}_diff.html`, '<div>No data available</div>')
  await createBlockBlobFromTextAsync(ContainerDiffFilesName, `${Utils.generateMonthBlobName(nextMonth)}_diffChanges.json`, JSON.stringify({
    entities: [],
    functions: []
  }))
}
