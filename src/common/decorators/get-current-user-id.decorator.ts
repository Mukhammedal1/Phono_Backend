import { createParamDecorator, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { JwtPayload } from "../types/JwtPayload";


export const GetCurrentUserId = createParamDecorator(
  (_: undefined, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest()
    const user = request.user as JwtPayload
    if (!user) {
      throw new ForbiddenException("Invalid token id")
    }
    return user.id
  }
)