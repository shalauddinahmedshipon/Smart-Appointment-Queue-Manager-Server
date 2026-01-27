import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppointmentStatus } from '@prisma/client';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(accountId: string) {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    // 1. Total appointments today (SCHEDULED + COMPLETED today)
    const totalToday = await this.prisma.appointment.count({
      where: {
        accountId,
        appointmentAt: {
          gte: todayStart,
          lte: todayEnd,
        },
        status: {
          in: [AppointmentStatus.SCHEDULED, AppointmentStatus.COMPLETED],
        },
      },
    });

    // 2. Completed today
    const completedToday = await this.prisma.appointment.count({
      where: {
        accountId,
        appointmentAt: {
          gte: todayStart,
          lte: todayEnd,
        },
        status: AppointmentStatus.COMPLETED,
      },
    });

    // 3. Pending today (SCHEDULED today)
    const pendingToday = await this.prisma.appointment.count({
      where: {
        accountId,
        appointmentAt: {
          gte: todayStart,
          lte: todayEnd,
        },
        status: AppointmentStatus.SCHEDULED,
      },
    });

    // 4. Waiting queue count (all time, not just today)
    const waitingQueue = await this.prisma.appointment.count({
      where: {
        accountId,
        staffId: null,
        status: AppointmentStatus.SCHEDULED,
      },
    });


    const staffList = await this.prisma.staff.findMany({
    where: { accountId, status: 'AVAILABLE' },
    select: {
      id: true,
      name: true,
      dailyCapacity: true,
    },
  });

  const staffLoadPromises = staffList.map(async (staff) => {
    const todayAppointments = await this.prisma.appointment.count({
      where: {
        staffId: staff.id,
        status: AppointmentStatus.SCHEDULED,
        appointmentAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    return {
      name: staff.name,
      load: `${todayAppointments}/${staff.dailyCapacity}`,
      status: todayAppointments >= staff.dailyCapacity ? 'Booked' : 'OK',
    };
  });

  const staffLoad = await Promise.all(staffLoadPromises);

  return {
    todayTotal: totalToday,
    completedToday,
    pendingToday,
    waitingQueue,
    staffLoad, 
  };

   
  }
}