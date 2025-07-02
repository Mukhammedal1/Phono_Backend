import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAdminAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;
    console.log(req.headers.authorization);
    if (!authHeader) {
      throw new UnauthorizedException({ message: 'Token berilmagan' });
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException({ message: "Bearer token noto'g'ri" });
    }

    try {
      let decoded = this.jwtService.verify(token, {
        secret: process.env.ADMIN_ACCESS_KEY,
      });

      if (decoded) {
        req.user = { ...decoded };
        return true;
      }
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException({
          message: 'Admin token muddati tugagan',
        });
      }
    }

    throw new UnauthorizedException({ message: "Ruxsat yo'q" });
  }
}
