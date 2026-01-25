import { Controller, Get, Query, Req } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { Request } from 'express';

@Controller('activity-log')
export class ActivityLogController {
  constructor(private activityLogService: ActivityLogService) {}

  @Get()
  async findAll(@Req() req: Request, @Query('limit') limit?: string) {
    const accountId = req.user!.id;
    const limitNum = limit ? parseInt(limit) : undefined;
    return this.activityLogService.findAll(accountId, limitNum);
  }
}
