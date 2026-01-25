import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ example: 'service-uuid' })
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({ example: 'staff-uuid', required: false })
  @IsOptional()
  @IsString()
  staffId?: string;

  @ApiProperty({ example: '2026-01-25T10:30:00Z' })
  @IsDateString()
  appointmentAt: string;
}
