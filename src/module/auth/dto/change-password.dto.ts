// src/user/dto/update-account.dto.ts
import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAccountDto {
  @ApiProperty({ example: 'newOrgName', description: 'Organization name', required: false })
  @IsOptional()
  @IsString()
  organizationName?: string;

  @ApiProperty({ example: 'oldPassword123', description: 'Current password', required: false })
  @IsOptional()
  @IsString()
  oldPassword?: string;

  @ApiProperty({ example: 'newPassword123', description: 'New password', required: false })
  @IsOptional()
  @IsString()
  @MinLength(6)
  newPassword?: string;

  @ApiProperty({ example: 'newPassword123', description: 'Confirm new password', required: false })
  @IsOptional()
  @IsString()
  confirmPassword?: string;
}
