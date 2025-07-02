import { ForbiddenException, Injectable } from "@nestjs/common";
import { Request } from "express";
import { ConfigService } from "@nestjs/config";
import { JwtFromRequestFunction, Strategy } from "passport-jwt";
import { JwtPayload } from "../types/JwtPayload";
import { JwtPayloadWithRefreshToken } from "../types/jwt-payload-refresh.type";
import { PassportStrategy } from "@nestjs/passport";

export const cookieExtractor: JwtFromRequestFunction = (req: Request) => {
  if (req && req.cookies) {
    // console.log(req.cookies['refresh_token'])
    return req.cookies['refresh_token'] || null

  }
  return null
};

@Injectable()
export class RefreshTokenCookieStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: cookieExtractor,
      secretOrKey: configService.get<string>("refresh_key")!,
      passReqToCallback: true,
    });
  }
  
  validate(req: Request, payload: JwtPayload): JwtPayloadWithRefreshToken {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      throw new ForbiddenException("Unauthorized")
    }

    return { ...payload, refreshToken }
  }

}