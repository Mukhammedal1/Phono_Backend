import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResponseFields } from '../common/types/response.type';
import { GetCurrentUserId } from '../common/decorators/get-current-user-id.decorator';
import { GetCurrentUser } from '../common/decorators/get-current-user.decorator';
import { RefreshTokenGuard } from '../common/guards/refresh-token.guard';
import { VerifyDto } from './dto/verify-otp.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }

  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post("signin")
  async signIn(@Body() signInDto: SignInDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.signIn(signInDto, res);
  }

  @ApiBearerAuth()
  @UseGuards(RefreshTokenGuard)
  @HttpCode(200)
  @Post("signout")
  async signOut(@GetCurrentUserId() userId: number, @Res({ passthrough: true }) res: Response): Promise<boolean> {
    return this.authService.signOut(userId, res);
  }

  @ApiBearerAuth()
  @UseGuards(RefreshTokenGuard)
  @HttpCode(200)
  @Post('refresh')
  async refreshToken(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<ResponseFields> {
    return this.authService.refreshToken(userId, refreshToken, res);
  }


  @HttpCode(200)
  @Post("verifyotp")
  verifyOtp(@Body() verifyDto: VerifyDto) {
    return this.authService.verifyOtp(verifyDto);
  }
}
