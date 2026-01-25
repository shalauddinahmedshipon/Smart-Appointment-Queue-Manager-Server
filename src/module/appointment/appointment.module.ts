import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { AppointmentCronService } from './appointment-cron.service';

@Module({
  controllers: [AppointmentController],
  providers: [AppointmentService, AppointmentCronService],
})
export class AppointmentModule {}
