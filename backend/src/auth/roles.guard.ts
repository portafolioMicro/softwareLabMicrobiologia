import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true; // la ruta no exige un rol específico

    const { user } = context.switchToHttp().getRequest();
    if (!requiredRoles.includes(user?.rol)) {
      throw new ForbiddenException("No tienes permiso para acceder a este recurso");
    }
    return true;
  }
}