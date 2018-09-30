import * as fs from 'fs'
import * as hbs from 'handlebars'

export class TemplateGenerator {
  public static GenerateTemplate(diffJson: any, templatePath: string): string {
    let hbsTemplate = fs.readFileSync(templatePath).toString()
    let template = hbs.compile(hbsTemplate)
    let entities = Object.keys(diffJson.entities)

    return template({
      entities: entities
    })
  }
}
