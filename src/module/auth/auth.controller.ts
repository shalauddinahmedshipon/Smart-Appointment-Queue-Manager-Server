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
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { UpdateAccountDto } from './dto/change-password.dto';


@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private cloudinary: CloudinaryService,
  ) {}


  @Public()
@Post('login')
async login(
  @Body() dto: LoginDto,
  @Res() res: Response,
) {
  const { account, accessToken } = await this.authService.login(dto);

  return sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: 'Login successful',
    data: {
      account,
      accessToken, // 🔥 TOKEN IN BODY
    },
  });
}


@Public()
@Post('signup')
@UseInterceptors(FileInterceptor('organizationLogo'))
async signup(
  @Body() body: any,
  @UploadedFile() file: Express.Multer.File,
  @Res() res: Response,
) {
  const logoUrl = file
    ? await this.cloudinary.uploadImage(file, 'organization')
    : null;

  const { account, accessToken } = await this.authService.signup({
    ...body,
    organizationLogo: logoUrl,
  });

  return sendResponse(res, {
    statusCode: HttpStatus.CREATED,
    success: true,
    message: 'Account created successfully',
    data: {
      account,
      accessToken, // 🔥 TOKEN IN BODY
    },
  });
}



  // ---------------- ME ----------------
  @Get('me')
  async getMe(@Req() req: Request) {
    console.log(req.user);
    const account = await this.authService.getMe(req.user!.id);
    return account;
  }

 // src/auth/auth.controller.ts
@Patch('update-account')
@UseInterceptors(FileInterceptor('organizationLogo'))
async updateAccount(
  @Body() dto: UpdateAccountDto,
  @UploadedFile() file: Express.Multer.File,
  @Req() req: Request,
  @Res() res: Response,
) {
  const logoUrl = file ? await this.cloudinary.uploadImage(file, 'organization') : undefined;

  const result = await this.authService.updateAccount(req.user!.id, dto, logoUrl);

  return sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: 'Account updated successfully',
    data: result,
  });
}

}
