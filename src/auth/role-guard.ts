import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private roles: string[]) {}

    canActivate(context: ExecutionContext): boolean {
        if (this.roles.length === 0) {
            return true; // No roles required, allow access
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        const userRoles: string = user && user.role;
        for (const role of this.roles) {
            if (userRoles && userRoles === role) {
                return true; 
            }
        }
        return false;
    }
}