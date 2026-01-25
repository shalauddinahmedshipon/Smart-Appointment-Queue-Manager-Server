import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContentManagerDto {
  @ApiProperty({
    example: 'manager@example.com',
    description: 'Email address of the content manager',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the content manager',
  })
  @IsString()
  fullName: string;

  @ApiProperty({
    example: 'password123',
    minLength: 6,
    description: 'Password for the content manager (minimum 6 characters)',
  })
  @IsString()
  @MinLength(6)
  password: string;
}
