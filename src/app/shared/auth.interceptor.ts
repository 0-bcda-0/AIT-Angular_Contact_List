import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    userIdToken: string | null = null;

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const user = localStorage.getItem('userData');
        const userObj = JSON.parse(user!);
        if (user) {
            this.userIdToken = userObj.idToken;
        }
        if (this.userIdToken) {
            const modifiedRequest = req.clone({
                params: req.params.set('auth', this.userIdToken),
            });
            return next.handle(modifiedRequest);
        }
        return next.handle(req);
    }
}
