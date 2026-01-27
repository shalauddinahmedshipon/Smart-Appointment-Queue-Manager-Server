import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import sendResponse from '../utils/sendResponse';
import { Public } from 'src/common/decorators/public.decorators';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private cloudinary: CloudinaryService,
  ) {}

  // ---------------- SIGN UP ----------------
  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'Create account (organization admin)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: SignupDto })
  @UseInterceptors(FileInterceptor('organizationLogo'))
  async signup(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
    @Res({ passthrough: true }) res: Response,
  ) {
    const logoUrl = file
      ? await this.cloudinary.uploadImage(file, 'organization')
      : null;

    const { account, accessToken } = await this.authService.signup({
      ...body,
      organizationLogo: logoUrl,
    });

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return sendResponse(res, {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: 'Account created successfully',
      data:account,
    });
  }

  // ---------------- LOGIN ----------------
  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { account, accessToken } = await this.authService.login(dto);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Login successful',
      data: account,
    });
  }

  // ---------------- LOGOUT ----------------
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', { path: '/' });

    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Logout successful',
      data: null,
    });
  }

  // ---------------- ME ----------------
  @Get('me')
  async getMe(@Req() req: Request) {
    console.log(req.user);
    const account = await this.authService.getMe(req.user!.id);
    return account;
  }

  // ---------------- CHANGE PASSWORD ----------------
  @Patch('change-password')
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.authService.changePassword(
      req.user!.email,
      dto,
    );

    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Password changed',
      data: result,
    });
  }
}
