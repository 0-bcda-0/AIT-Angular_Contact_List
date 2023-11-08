import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { tap } from 'rxjs/operators';

import { IAuthResponseData } from '../models/IAuthResponseData.interface';

import { environment } from 'src/environments/environment.firebase';

@Injectable({ providedIn: 'root' })
export class AuthService {

    http = inject(HttpClient);

    user = new BehaviorSubject<User>(null!);

    signup(email: string, password: string) {
        return this.http
            .post<IAuthResponseData>(
                environment.firebaseConfig.authURL + environment.firebaseConfig.signUp + environment.firebaseConfig.apiKey,
                {
                    email: email,
                    password: password,
                    returnSecureToken: true
                }
            )
            .pipe(tap(resData => {
                this.handleAuthentication(
                    resData.email,
                    resData.localId,
                    resData.idToken,
                    +resData.expiresIn
                );
            }
            ));
    }

    login(email: string, password: string) {
        return this.http
            .post<IAuthResponseData>(
                environment.firebaseConfig.authURL + environment.firebaseConfig.signIn + environment.firebaseConfig.apiKey,
                {
                    email: email,
                    password: password,
                    returnSecureToken: true
                }
            )
            .pipe(tap(resData => {
                this.handleAuthentication(
                    resData.email,
                    resData.localId,
                    resData.idToken,
                    +resData.expiresIn
                );
            }
            ));

    }

    private handleAuthentication(
        email: string,
        userId: string,
        token: string,
        expiresIn: number
    ) {
        const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
        const user = new User(
            email,
            userId,
            token,
            expirationDate
        );
        this.user.next(user);
    }
}