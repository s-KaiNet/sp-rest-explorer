export class FilterManager {
  public static DefaultFilters: string[] = [
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
    'SP.ObjectSharingInformation'
  ]

  private static key = '_filters_'

  public static load(): string[] {
    let filters = window.localStorage.getItem(this.key)

    if (!filters) {
      this.save(this.DefaultFilters)
      return this.DefaultFilters
    }

    return JSON.parse(filters)
  }

  public static save(filters: string[]): void {
    window.localStorage.setItem(this.key, JSON.stringify(filters))
  }

  public static restoreDefaults(): void {
    window.localStorage.setItem(this.key, JSON.stringify(this.DefaultFilters))
  }
}
