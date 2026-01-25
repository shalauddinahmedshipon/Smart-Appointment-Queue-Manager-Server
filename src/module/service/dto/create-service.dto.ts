// src/service/dto/create-service.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { StaffType, ServiceDuration } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'Consultation' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ServiceDuration })
  @IsEnum(ServiceDuration)
  duration: ServiceDuration;

  @ApiProperty({ enum: StaffType })
  @IsEnum(StaffType)
  requiredStaffType: StaffType;
}
