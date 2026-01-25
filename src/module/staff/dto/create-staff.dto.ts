// src/staff/dto/create-staff.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { StaffStatus, StaffType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateStaffDto {
  @ApiProperty({ example: 'Farhan' })
  @IsString()
  name: string;

  @ApiProperty({ enum: StaffType })
  @IsEnum(StaffType)
  serviceType: StaffType;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  dailyCapacity?: number;

  @ApiProperty({ enum: StaffStatus, default: StaffStatus.AVAILABLE, required: false })
  @IsOptional()
  @IsEnum(StaffStatus)
  status?: StaffStatus;
}
