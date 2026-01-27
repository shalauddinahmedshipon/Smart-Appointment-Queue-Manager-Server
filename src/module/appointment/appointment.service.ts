import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentStatus, ServiceDuration } from '@prisma/client';
import { addMinutes, isBefore, isAfter } from 'date-fns';

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  // ---------------- UTILS ----------------
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

  private async getTodayAppointmentsCount(staffId: string, date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return this.prisma.appointment.count({
      where: {
        staffId,
        status: AppointmentStatus.SCHEDULED,
        appointmentAt: { gte: start, lt: end },
      },
    });
  }

  private async createActivityLog(accountId: string, message: string) {
    await this.prisma.activityLog.create({ data: { accountId, message } });
  }

  // ---------------- CREATE ----------------
  async create(accountId: string, dto: CreateAppointmentDto) {
    const { serviceId, staffId, appointmentAt, customerName } = dto;

    const service = await this.prisma.service.findFirst({
      where: { id: serviceId, accountId },
    });
    if (!service) throw new BadRequestException('Service not found');

    const durationMinutes = this.durationInMinutes(service.duration);
    let assignedStaffId: string | null = staffId || null;

    // Conflict check if staff is provided
    if (assignedStaffId) {
      const conflict = await this.checkStaffConflict(
        assignedStaffId,
        new Date(appointmentAt),
        durationMinutes,
      );
      if (conflict)
        throw new BadRequestException(
          'This staff already has an appointment at this time',
        );
    } else {
      // Auto-assign staff
      assignedStaffId = await this.autoAssignStaff(
        accountId,
        service,
        new Date(appointmentAt),
      );
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        customerName,
        serviceId,
        staffId: assignedStaffId,
        accountId,
        appointmentAt: new Date(appointmentAt),
        status: AppointmentStatus.SCHEDULED,
      },
      include: { staff: true, service: true },
    });

    // Log activity
    if (assignedStaffId && appointment.staff) {
      await this.createActivityLog(
        accountId,
        `Appointment for "${customerName}" assigned to ${appointment.staff.name}`,
      );
    } else {
      await this.createActivityLog(
        accountId,
        `Appointment for "${customerName}" added to waiting queue`,
      );
    }

    return appointment;
  }

  // ---------------- UPDATE ----------------
async update(accountId: string, id: string, dto: UpdateAppointmentDto) {
  const appointment = await this.prisma.appointment.findFirstOrThrow({
    where: { id, accountId },
    include: { staff: true, service: true },
  });

  // Check if staffId or appointmentAt actually changed
  const staffChanged = dto.staffId && dto.staffId !== appointment.staffId;
  const timeChanged = dto.appointmentAt && 
    new Date(dto.appointmentAt).getTime() !== new Date(appointment.appointmentAt).getTime();

  // Only check conflicts if staff or time actually changed
  if (staffChanged || timeChanged) {
    const service = appointment.service;
    const staffId = dto.staffId || appointment.staffId;
    
    if (staffId) {
      const conflict = await this.checkStaffConflict(
        staffId,
        new Date(dto.appointmentAt || appointment.appointmentAt),
        this.durationInMinutes(service.duration),
        id, // ⚠️ IMPORTANT: Exclude current appointment from conflict check
      );
      
      if (conflict) {
        throw new BadRequestException(
          'Staff has a conflicting appointment at this time',
        );
      }
    }
  }

  const updated = await this.prisma.appointment.update({
    where: { id },
    data: { ...dto },
    include: { staff: true },
  });

  await this.createActivityLog(
    accountId,
    `Appointment for "${updated.customerName}" updated` +
      (updated.staff ? `, assigned to ${updated.staff.name}` : ''),
  );

  return updated;
}

  // ---------------- DELETE ----------------
  async remove(accountId: string, id: string) {
    const appointment = await this.prisma.appointment.findFirstOrThrow({
      where: { id, accountId },
      include: { staff: true },
    });

    await this.prisma.appointment.delete({ where: { id } });

    await this.createActivityLog(
      accountId,
      `Appointment for "${appointment.customerName}" deleted` +
        (appointment.staff ? `, was assigned to ${appointment.staff.name}` : ''),
    );

    return { message: 'Appointment removed' };
  }

  // ---------------- FIND ALL ----------------
  async findAll(accountId: string) {
    return this.prisma.appointment.findMany({
      where: { accountId },
      include: { staff: true, service: true },
      orderBy: { appointmentAt: 'asc' },
    });
  }

  // ---------------- FIND ONE ----------------
  async findOne(accountId: string, id: string) {
    return this.prisma.appointment.findFirstOrThrow({
      where: { id, accountId },
      include: { staff: true, service: true },
    });
  }

  // ---------------- WAITING QUEUE ----------------
  async getWaitingQueue(accountId: string) {
    return this.prisma.appointment.findMany({
      where: { accountId, staffId: null, status: AppointmentStatus.SCHEDULED },
      orderBy: { appointmentAt: 'asc' },
      include: { service: true },
    });
  }

async assignFromQueue(accountId: string) {
  const queue = await this.getWaitingQueue(accountId);

  let assigned = 0;
  let skipped = 0;

  for (const appointment of queue) {
    const service = await this.prisma.service.findUnique({
      where: { id: appointment.serviceId },
    });

    const staffId = await this.autoAssignStaff(
      accountId,
      service,
      appointment.appointmentAt,
    );

    if (!staffId) {
      skipped++;
      continue;
    }

    const updated = await this.prisma.appointment.update({
      where: { id: appointment.id },
      data: { staffId },
      include: { staff: true },
    });

    await this.createActivityLog(
      accountId,
      `Appointment for "${updated.customerName}" auto-assigned to ${updated.staff!.name}`,
    );

    assigned++;
  }

  return {
    processed: queue.length,
    assigned,
    skipped,
    message:
      assigned > 0
        ? `${assigned} appointment(s) assigned`
        : 'No appointments could be assigned',
  };
}


  // ---------------- CONFLICT CHECK ----------------
  async checkStaffConflict(
  staffId: string, 
  appointmentAt: Date, 
  durationMinutes: number,
  excludeAppointmentId?: string // Add this parameter
) {
  const startTime = appointmentAt;
  const endTime = new Date(appointmentAt.getTime() + durationMinutes * 60000);

  const conflict = await this.prisma.appointment.findFirst({
    where: {
      staffId,
      status: 'SCHEDULED',
      id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined, // Exclude current appointment
      appointmentAt: {
        gte: new Date(startTime.getTime() - 60 * 60000), // 1 hour before
        lt: endTime,
      },
    },
  });

  return !!conflict;
}

  // ---------------- AUTO-ASSIGN STAFF ----------------
  async autoAssignStaff(accountId: string, service: any, appointmentAt: Date) {
    const staffList = await this.prisma.staff.findMany({
      where: {
        accountId,
        serviceType: service.requiredStaffType,
        status: 'AVAILABLE',
      },
    });

    const durationMinutes = this.durationInMinutes(service.duration);

    for (const staff of staffList) {
      const conflict = await this.checkStaffConflict(
        staff.id,
        appointmentAt,
        durationMinutes,
      );
      if (conflict) continue;

      const todayAppointments = await this.getTodayAppointmentsCount(
        staff.id,
        appointmentAt,
      );
      if (todayAppointments >= staff.dailyCapacity) continue;

      return staff.id;
    }

    return null; // no staff available → waiting queue
  }
}
