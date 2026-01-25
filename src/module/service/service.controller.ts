// src/service/service.controller.ts
import { Body, Controller, Get, Param, Post, Patch, Delete, Req } from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Request } from 'express';

@Controller('service')
export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateServiceDto) {
    const accountId = req.user!.id;
    return this.serviceService.create(accountId, dto);
  }

  @Get()
  async findAll(@Req() req: Request) {
    const accountId = req.user!.id;
    return this.serviceService.findAll(accountId);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const accountId = req.user!.id;
    return this.serviceService.findOne(accountId, id);
  }

  @Patch(':id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateServiceDto) {
    const accountId = req.user!.id;
    return this.serviceService.update(accountId, id, dto);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const accountId = req.user!.id;
    return this.serviceService.remove(accountId, id);
  }
}
