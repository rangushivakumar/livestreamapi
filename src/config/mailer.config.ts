require('dotenv').config();
import { MailerAsyncOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

export const mailerConfig: MailerAsyncOptions = {
  useFactory: () => ({
    transport: {
      service: 'SendinBlue',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
    defaults: {
      from: '"narratemedia" <blurisetechnologies@gmail.com>',
    },
    template: {
      dir: process.cwd() + '/views/',
      adapter: new EjsAdapter(),
      options: {
        strict: true,
      },
    },
  }),
};