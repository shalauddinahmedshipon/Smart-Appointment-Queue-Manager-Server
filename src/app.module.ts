import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './module/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { StaffModule } from './module/staff/staff.module';
import { ServiceModule } from './module/service/service.module';
import { AppointmentModule } from './module/appointment/appointment.module';
import { ActivityLogModule } from './module/activity-log/activity-log.module';




@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      },
      defaults: {
        from: process.env.EMAIL_USER,
      },
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CloudinaryModule,
    StaffModule,
    ServiceModule,
    AppointmentModule,
    ActivityLogModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
