import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProfileCompleteGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    console.log(userId)

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        birthDate: true,
        mainEmailId: true,
        mainPhoneId: true,
        districtId: true,
        languageId: true,
        image: true
      },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const isProfileComplete = 
      (user.mainEmailId !== null || user.mainPhoneId !== null) &&
      user.districtId !== null &&
      user.languageId !== null &&
      user.image !== null &&
      user.birthDate !== null;

    if (!isProfileComplete) {
      throw new ForbiddenException('Please complete your profile to access this feature.');
    }

    return true;
  }
}
