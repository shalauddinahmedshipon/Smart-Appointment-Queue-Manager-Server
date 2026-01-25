import { Body, Controller, Get, Param, Patch, Post, Delete, Req } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Request } from 'express';

@Controller('appointment')
export class AppointmentController {
  constructor(private appointmentService: AppointmentService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateAppointmentDto) {
    const accountId = req.user!.id;
    return this.appointmentService.create(accountId, dto);
  }

  @Get()
  async findAll(@Req() req: Request) {
    const accountId = req.user!.id;
    return this.appointmentService.findAll(accountId);
  }

  @Get('waiting-queue')
  async waitingQueue(@Req() req: Request) {
    const accountId = req.user!.id;
    return this.appointmentService.getWaitingQueue(accountId);
  }

  @Patch('assign-queue')
  async assignQueue(@Req() req: Request) {
    const accountId = req.user!.id;
    return this.appointmentService.assignFromQueue(accountId);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const accountId = req.user!.id;
    return this.appointmentService.findAll(accountId); // can update for single appointment
  }

  @Patch(':id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    const accountId = req.user!.id;
    return this.appointmentService.update(accountId, id, dto);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const accountId = req.user!.id;
    return this.appointmentService.remove(accountId, id);
  }
}
