import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "../types/JwtPayload";


@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'access-jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.access_key!,
      passReqToCallback: true
    })
  }

  validate(req: Request, payload: JwtPayload): JwtPayload {
    return payload 
  }
}