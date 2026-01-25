import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ActivityLogService {
  constructor(private prisma: PrismaService) {}

  // Get all logs for an account, optionally limit recent logs
  async findAll(accountId: string, limit?: number) {
    return this.prisma.activityLog.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
