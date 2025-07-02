import { Controller, Post, Body, Param, HttpCode, Res } from '@nestjs/common';
import { AdminAuthService } from './admin_auth.service';
import { SignInAdminDto } from './dto/sign-in.dto';
import { Response } from 'express';
import { CookieGetter } from '../common/decorators/cookie-getter.decorator';

@Controller('admin-auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @HttpCode(200)
  @Post('signin')
  async signIn(
    @Body() signInDto: SignInAdminDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.adminAuthService.signIn(signInDto, res);
  }

  @HttpCode(200)
  @Post('signout')
  signout(
    @CookieGetter('refresh_token') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.adminAuthService.signOut(refreshToken, res);
  }

  @HttpCode(200)
  @Post('refresh/:id')
  refresh(
    @Param('id') id: number,
    @CookieGetter('refresh_token') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.adminAuthService.refreshToken(+id, refreshToken, res);
  }
}
