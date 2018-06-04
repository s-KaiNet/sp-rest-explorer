import { DocLink } from '../models/DocLink'

export class DocLinks {
  private static links: DocLink[] = [
    {
      name: 'Working with folders and files with REST',
      url:
        'https://docs.microsoft.com/en-us/sharepoint/dev/sp-add-ins/working-with-folders-and-files-with-rest',
      templateUrl: [/^web\/GetFolder/i, /^web\/folders/i, /^web\/files/i, /^files/i, /^web\/GetFile/i, /^web\/lists\/.*AttachmentFiles/i, /^web\/lists\/.*Folder/i, /^web\/lists\/.*File/i]
    },
    {
      name: 'Social feed REST API reference for SharePoint',
      url:
        'https://docs.microsoft.com/en-us/sharepoint/dev/general-development/social-feed-rest-api-reference-for-sharepoint',
      templateUrl: [/^social\.feed/i]
    },
    {
      name: 'Following people and content REST API reference for SharePoint',
      url:
        'https://docs.microsoft.com/en-us/sharepoint/dev/general-development/following-people-and-content-rest-api-reference-for-sharepoint',
      templateUrl: [/^social\.following/i]
    },
    {
      name: 'Hub site REST API',
      url:
        'https://docs.microsoft.com/en-us/sharepoint/dev/features/hub-site/hub-site-rest-api',
      templateUrl: [/^SP\.HubSites/i, /^HubSites/i, /^web\/.*HubSite/i, /^site\/JoinHubSite/i, /^site\/.*HubSite/i]
    },
    {
      name: 'Site design and site script REST API',
      url:
        'https://docs.microsoft.com/en-us/sharepoint/dev/declarative-customization/site-design-rest-api',
      templateUrl: [/^Microsoft\.SharePoint\.Utilities\..*SiteScript/i, /^Microsoft\.SharePoint\.Utilities\..*SiteDesign/i]
    },
    {
      name: 'SharePoint site theming: REST API',
      url:
        'https://docs.microsoft.com/en-us/sharepoint/dev/declarative-customization/site-theming/sharepoint-site-theming-rest-api',
      templateUrl: [/^thememanager/i]
    },
    {
      name: 'SharePoint list webhooks',
      url:
        'https://docs.microsoft.com/en-us/sharepoint/dev/apis/webhooks/lists/overview-sharepoint-list-webhooks',
      templateUrl: [/^web\/lists\/.*subscriptions/i, /^lists\/.*subscriptions/i]
    },
    {
      name: 'Application Lifecycle Management (ALM) APIs',
      url:
        'https://docs.microsoft.com/en-us/sharepoint/dev/apis/alm-api-for-spfx-add-ins',
      templateUrl: [/^web\/tenantappcatalog/i, /^web\/sitecollectionappcatalog/i]
    },
    {
      name: 'Working with lists and list items with REST',
      url:
        'https://docs.microsoft.com/en-us/sharepoint/dev/sp-add-ins/working-with-lists-and-list-items-with-rest',
      templateUrl: [/^web\/lists/i, /^web\/GetList/i, /^lists/i]
    }
  ]

  public static hasLink(path: string): boolean {
    for (const link of this.links) {
      for (const regexp of link.templateUrl) {
        if (regexp.test(path)) {
          return true
        }
      }
    }

    return false
  }

  public static getLink(path: string): DocLink {
    for (const link of this.links) {
      for (const regexp of link.templateUrl) {
        if (regexp.test(path)) {
          return link
        }
      }
    }

    return null
  }
}
