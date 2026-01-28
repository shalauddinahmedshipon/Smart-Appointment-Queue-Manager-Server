import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto'
import { getTokens} from './auth.utils';
import { UpdateAccountDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // ---------------- SIGN UP ----------------
  async signup(dto: {
    email: string;
    password: string;
    organizationName: string;
    organizationLogo?: string | null;
  }) {
    const exists = await this.prisma.account.findUnique({
      where: { email: dto.email },
    });

    if (exists) {
      throw new BadRequestException('Email already in use');
    }

    const hashed = await bcrypt.hash(
      dto.password,
      parseInt(process.env.SALT_ROUND!),
    );

    const account = await this.prisma.account.create({
      data: {
        email: dto.email,
        password: hashed,
        organizationName: dto.organizationName,
        organizationLogo: dto.organizationLogo,
      },
    });

    const { accessToken } = await getTokens(
      this.jwtService,
      account.id,
      account.email,
    );

    return { account, accessToken };
  }

  // ---------------- LOGIN ----------------
  async login(dto: LoginDto) {
    const account = await this.prisma.account.findUnique({
      where: { email: dto.email },
    });

    if (!account || !account.password) {
      throw new ForbiddenException('Invalid credentials');
    }



    const isMatch = await bcrypt.compare(dto.password, account.password);
    if (!isMatch) {
      throw new ForbiddenException('Invalid credentials');
    }

    const { accessToken } = await getTokens(
      this.jwtService,
      account.id,
      account.email,
    );

    return { account, accessToken };
  }

  // ---------------- ME ----------------
  async getMe(accountId: string) {
    return this.prisma.account.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        email: true,
        organizationName: true,
        organizationLogo: true,
        createdAt: true,
      },
    });
  }

  // ---------------- CHANGE PASSWORD ----------------
async updateAccount(
  accountId: string,
  dto: UpdateAccountDto,
  organizationLogo?: string,
) {
  const account = await this.prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account) throw new NotFoundException('Account not found');

  const updateData: any = {};

  // Update organization info
  if (dto.organizationName) updateData.organizationName = dto.organizationName;
  if (organizationLogo) updateData.organizationLogo = organizationLogo;

  // Update password if provided
  if (dto.oldPassword || dto.newPassword || dto.confirmPassword) {
    if (!dto.oldPassword || !dto.newPassword || !dto.confirmPassword) {
      throw new BadRequestException('All password fields must be provided');
    }

    const isMatch = await bcrypt.compare(dto.oldPassword, account.password);
    if (!isMatch) throw new BadRequestException('Old password is incorrect');

    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException("Passwords don't match");
    }

    const hashed = await bcrypt.hash(dto.newPassword, parseInt(process.env.SALT_ROUND!));
    updateData.password = hashed;
  }

  const updated = await this.prisma.account.update({
    where: { id: accountId },
    data: updateData,
  });

  return {
    message: 'Account updated successfully',
    account: {
      id: updated.id,
      email: updated.email,
      organizationName: updated.organizationName,
      organizationLogo: updated.organizationLogo,
    },
  };
}

}
