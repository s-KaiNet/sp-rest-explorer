export class FilterManager {
  public static filters: string[] = [
    'SP.WorkManagement',
    'SP.Directory',
    'SP.CompliancePolicy',
    'OBA',
    'SP.WorkflowServices',
    'SP.Microfeed',
    'SP.Social',
    'SP.UserProfiles',
    'PS',
    'SP.Publishing',
    'Microsoft.Office',
    'Microsoft.SharePoint',
    'SP.Analytics',
    'SP.UI',
    'SP.APIHub',
    'SP.Utilities',
    'SP.ServerSettings',
    'SP.AppPrincipalCredential',
    'SP.Sharing',
    'SP.Web',
    'Microsoft.Online.SharePoint',
    'SP.MoveCopyUtil',
    'SP.RelatedItemManager',
    'SP.AccessRequests',
    'SP.Translation',
    'SP.TeamChannelManager',
    'SP.HashtagStoreManager',
    'SP.MountPoint',
    'SP.ObjectSharingInformation',
    'SP.ApiMetadata',
    'SP.DocumentManagement',
    'SP.MetadataNavigation',
    'SPO',
    'Microsoft.BusinessData',
    'SP.BusinessData',
    'SP.AppCatalog',
    'SP.AppInstance',
    'SP.OAuth',
    'SP.AppPrincipal',
    'SP.PageInstrumentation',
    'SP.AppSite',
    'SP.AppTile',
    'SP.CurrencyList',
    'SP.File',
    'SP.Request',
    'SP.RoleDefinition'
  ]

  private static sortedFilters: string[]

  private static key = '_filters_'

  public static get DefaultFilters(): string[] {
    if (!this.sortedFilters) {
      this.sortedFilters = this.filters.sort()
    }
    return this.sortedFilters
  }

  public static load(): string[] {
    let filters = window.localStorage.getItem(this.key)

    if (!filters) {
      this.save([])
      return []
    }

    return JSON.parse(filters)
  }

  public static save(filters: string[]): void {
    window.localStorage.setItem(this.key, JSON.stringify(filters))
  }

  public static restoreDefaults(): void {
    window.localStorage.setItem(this.key, JSON.stringify([]))
  }
}
