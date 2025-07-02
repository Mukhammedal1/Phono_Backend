import { ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { JwtPayload } from "../types/JwtPayload";


@Injectable()
export class UserSelfGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAuthenticated = await super.canActivate(context);

    if (!isAuthenticated)
      return false

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (!user)
      throw new ForbiddenException('User not found');

    const paramId = parseInt(request.params.id, 10);


    if (user.id !== paramId)
      throw new ForbiddenException('You are not authorized');

    return true
  }

}