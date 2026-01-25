// src/service/service.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) {}

// src/service/service.service.ts
async create(accountId: string, dto: CreateServiceDto) {
  const exists = await this.prisma.service.findFirst({
    where: { accountId, name: dto.name },
  });

  if (exists) {
    throw new BadRequestException(
      `Service with name "${dto.name}" already exists for this clinic`,
    );
  }

  return this.prisma.service.create({
    data: {
      ...dto,
      accountId,
    },
  });
}



  async findAll(accountId: string) {
    return this.prisma.service.findMany({
      where: { accountId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(accountId: string, id: string) {
    const service = await this.prisma.service.findFirst({
      where: { id, accountId },
    });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

async update(accountId: string, id: string, dto: UpdateServiceDto) {
  const service = await this.findOne(accountId, id);

  if (dto.name && dto.name !== service.name) {
    const exists = await this.prisma.service.findFirst({
      where: { accountId, name: dto.name },
    });
    if (exists) {
      throw new BadRequestException(
        `Service with name "${dto.name}" already exists for this clinic`,
      );
    }
  }

  return this.prisma.service.update({
    where: { id },
    data: dto,
  });
}


  async remove(accountId: string, id: string) {
    await this.findOne(accountId, id);
    return this.prisma.service.delete({
      where: { id },
    });
  }
}
