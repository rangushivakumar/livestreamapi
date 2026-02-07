import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { dataSourceOptions } from './config/data-source';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailerConfig } from './config/mailer.config';


@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    MailerModule.forRootAsync(mailerConfig),
    AuthModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService
  ],
})
export class AppModule {}
