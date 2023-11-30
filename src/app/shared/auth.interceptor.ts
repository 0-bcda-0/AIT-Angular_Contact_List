import { Injectable, inject } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
} from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { Router } from '@angular/router';
import { LoaderService } from '../loader.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    router = inject(Router);
    loaderService = inject(LoaderService);

    userIdToken: string | null = null;
    userExpirationDate: Date | null = null;

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.loaderService.showLoader();
        const user = localStorage.getItem('userData');
        const userObj = JSON.parse(user!);
        if (user) {
            this.userIdToken = userObj.idToken;
            this.userExpirationDate = new Date(userObj.expirationDate);
        }
        if (this.userIdToken) {
            if (this.userExpirationDate! <= new Date()) {
                localStorage.removeItem('userData');
                this.router.navigate(['/login']);
            }
            const modifiedRequest = req.clone({
                params: req.params.set('auth', this.userIdToken),
            });
            return next.handle(modifiedRequest).pipe(
                (finalize(() => {
                    this.loaderService.hideLoader();
                })));
        }
        return next.handle(req);
    }
}
