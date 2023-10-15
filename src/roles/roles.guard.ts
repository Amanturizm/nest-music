import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    if (!req.user) {
      throw new UnauthorizedException('Unauthenticated');
    }

    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedException('Unauthorized');
    }

    return true;
  }
}
