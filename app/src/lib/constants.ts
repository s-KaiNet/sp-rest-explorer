export const BLOB_BASE_URL =
  'https://sprestapiexplorernew.blob.core.windows.net/api-files'

export const METADATA_URL = `${BLOB_BASE_URL}/metadata.latest.zip.json`

export function getHistoricalBlobUrl(year: number, month: number): string {
  return `${BLOB_BASE_URL}/${year}y_m${month}_metadata.zip.json`
}

export const CACHE_KEY = 'sp-explorer-metadata'

export const API_PREFIX = '_api'
