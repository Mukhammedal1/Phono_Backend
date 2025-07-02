import { createParamDecorator, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { JwtPayload } from "../types/JwtPayload";
import { JwtPayloadWithRefreshToken } from "../types/jwt-payload-refresh.type";


export const GetCurrentUser = createParamDecorator(
  (data: keyof JwtPayloadWithRefreshToken, context: ExecutionContext) =>{
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload
    if(!user)
      throw new ForbiddenException("Invalid token user")

    if(!data)
      return user;

    return user[data]
  }
)