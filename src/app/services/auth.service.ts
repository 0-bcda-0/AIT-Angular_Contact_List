import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { tap } from 'rxjs/operators';

import { IAuthResponseData } from '../models/IAuthResponseData.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
    
    constructor(private http: HttpClient) { }

    user = new BehaviorSubject<User>(null!);

    signup(email: string, password: string) {
        return this.http
            .post<IAuthResponseData>(
                'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBQ0Se7T3dFJse5Xo3NfOxWojtHLNyKGCo',
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
                'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBQ0Se7T3dFJse5Xo3NfOxWojtHLNyKGCo',
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