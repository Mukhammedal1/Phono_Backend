import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AccessTokenStrategy, JwtStrategy, RefreshTokenCookieStrategy } from '../common/strategies';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService, JwtStrategy, RefreshTokenCookieStrategy, AccessTokenStrategy],
})
export class UserModule {}
