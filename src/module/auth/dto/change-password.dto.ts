// src/user/dto/change-password.dto.ts
import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'oldPassword123',
    description: 'Your current password',
  })
  @IsString({ message: 'Old password must be a string.' })
  oldPassword: string;

  @ApiProperty({
    example: 'newSecurePass456',
    description: 'Your new password (minimum 6 characters)',
  })
  @IsString({ message: 'New password must be a string.' })
  @MinLength(6, { message: 'New password must be at least 6 characters long.' })
  newPassword: string;

  @ApiProperty({
    example: 'newSecurePass456',
    description: 'Repeat the new password to confirm',
  })
  @IsString({ message: 'Confirm password must be a string.' })
  confirmPassword: string;
}
