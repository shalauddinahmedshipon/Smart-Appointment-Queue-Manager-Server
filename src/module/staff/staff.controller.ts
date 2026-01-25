// src/staff/staff.controller.ts
import { Body, Controller, Get, Param, Post, Patch, Delete, Req } from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { Request } from 'express';

@Controller('staff')
export class StaffController {
  constructor(private staffService: StaffService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateStaffDto) {
    const accountId = req.user!.id;
    return this.staffService.create(accountId, dto);
  }

  @Get()
  async findAll(@Req() req: Request) {
    const accountId = req.user!.id;
    return this.staffService.findAll(accountId);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const accountId = req.user!.id;
    return this.staffService.findOne(accountId, id);
  }

  @Patch(':id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateStaffDto) {
    const accountId = req.user!.id;
    return this.staffService.update(accountId, id, dto);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const accountId = req.user!.id;
    return this.staffService.remove(accountId, id);
  }
}
