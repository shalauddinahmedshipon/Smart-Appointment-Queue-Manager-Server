import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ example: 'admin@clinic.com' })
  email: string;

  @ApiProperty({ example: 'strongPassword123' })
  password: string;

  @ApiProperty({ example: 'City Health Clinic' })
  organizationName: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Organization logo',
  })
  organizationLogo?: any;
}
