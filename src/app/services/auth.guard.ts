import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Injectable, inject } from "@angular/core";
import { AuthService } from "./auth.service";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
class AuthGuard {
    authService = inject(AuthService);
    router = inject(Router);

    canActivate(
        route: ActivatedRouteSnapshot,
        router: RouterStateSnapshot
    ): boolean | UrlTree | Promise<boolean> | Observable<boolean | UrlTree> {
        if (localStorage.getItem('userData')) {
            return true;
        }
        return this.authService.user.pipe(
            map(user => {
                const isAuth = !!user;
                if (isAuth) {
                    return true;
                }
                return this.router.createUrlTree(['/login']);
            })
        );
    }
}

export const IsAuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    return inject(AuthGuard).canActivate(route, state);
}