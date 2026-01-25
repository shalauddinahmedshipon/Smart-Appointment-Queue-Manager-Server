import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppointmentStatus, ServiceDuration } from '@prisma/client';
import { addMinutes, isBefore } from 'date-fns';

@Injectable()
export class AppointmentCronService {
  constructor(private prisma: PrismaService) {}

  // ---------- UTILS ----------
  private durationInMinutes(duration: ServiceDuration): number {
    switch (duration) {
      case ServiceDuration.MIN_15:
        return 15;
      case ServiceDuration.MIN_30:
        return 30;
      case ServiceDuration.MIN_60:
        return 60;
      default:
        return 15;
    }
  }

  // ---------- CRON: RUN EVERY 5 MIN ----------
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleAppointmentStatusUpdates() {
    const now = new Date();

    /* ===========================
       1️⃣ CANCEL EXPIRED QUEUE
       =========================== */
    const expiredQueue = await this.prisma.appointment.findMany({
      where: {
        staffId: null,
        status: AppointmentStatus.SCHEDULED,
        appointmentAt: { lt: now },
      },
    });

    for (const appt of expiredQueue) {
      await this.prisma.appointment.update({
        where: { id: appt.id },
        data: { status: AppointmentStatus.CANCELLED },
      });

      await this.prisma.activityLog.create({
        data: {
          accountId: appt.accountId,
          message: `Waiting queue appointment for "${appt.customerName}" was cancelled (expired)`,
        },
      });
    }

    /* ===========================
       2️⃣ AUTO COMPLETE APPOINTMENTS
       =========================== */
    const scheduledAppointments = await this.prisma.appointment.findMany({
      where: {
        staffId: { not: null },
        status: AppointmentStatus.SCHEDULED,
      },
      include: { service: true },
    });

    for (const appt of scheduledAppointments) {
      const duration = this.durationInMinutes(appt.service.duration);
      const endTime = addMinutes(appt.appointmentAt, duration);

      if (isBefore(endTime, now)) {
        await this.prisma.appointment.update({
          where: { id: appt.id },
          data: { status: AppointmentStatus.COMPLETED },
        });

        await this.prisma.activityLog.create({
          data: {
            accountId: appt.accountId,
            message: `Appointment for "${appt.customerName}" marked as completed`,
          },
        });
      }
    }
  }
}
