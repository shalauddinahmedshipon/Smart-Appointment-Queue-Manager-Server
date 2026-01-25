import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async create(accountId: string, dto: CreateStaffDto) {
    return this.prisma.staff.create({
      data: {
        ...dto,
        accountId,
      },
    });
  }

  async findAll(accountId: string) {
    return this.prisma.staff.findMany({
      where: { accountId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(accountId: string, id: string) {
    const staff = await this.prisma.staff.findFirst({
      where: { id, accountId },
    });
    if (!staff) throw new NotFoundException('Staff not found');
    return staff;
  }

  async update(accountId: string, id: string, dto: UpdateStaffDto) {
    await this.findOne(accountId, id);
    return this.prisma.staff.update({
      where: { id },
      data: dto,
    });
  }

  async remove(accountId: string, id: string) {
    await this.findOne(accountId, id);
    return this.prisma.staff.delete({ where: { id } });
  }
}
