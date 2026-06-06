import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class TemplatingService {
  private readonly TEMPLATES_DIR = path.join(process.cwd(), 'src/shared/mail/templates');

  public renderTemplate(templateName: string, context: any): string {
    const templatePath = path.join(this.TEMPLATES_DIR, `${templateName}.hbs`);

    try {
      const templateSource = fs.readFileSync(templatePath, 'utf8');

      const template = Handlebars.compile(templateSource);

      const html = template(context);

      return html;
    } catch (error) {
      console.error(`Failed to render email template ${templateName}:`, error);
      throw new InternalServerErrorException(`Could not render email template: ${templateName}`);
    }
  }
}
