import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../user.model';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface AuthResponseData {
    kind: string;
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
}

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: true,
    imports: [
        MatCardModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        HttpClientModule,
        MatProgressSpinnerModule,
        NgIf,
        MatSnackBarModule
    ]
})
export class LoginComponent {
    isLoginMode = true;
    isLoading = false;

    isError = false;
    errorMessageHTML: string = '';
    errorMessagePosition: number = 0;
    error: string | null = null;

    constructor(private http: HttpClient, private _snackBar: MatSnackBar, private router: Router) { }

    onSubmit(form: NgForm) {
        if (!form.valid) {
            return;
        }

        const email = form.value.email;
        const password = form.value.password;

        this.isLoading = true;

        let authObs: Observable<AuthResponseData>;

        if (this.isLoginMode) {
            //* LOGIN
            authObs = this.login(email, password);
        } else {
            //* SIGNUP
            authObs = this.signup(email, password);
        }

        authObs.subscribe(
            resData => {
                this.isLoading = false;
                localStorage.setItem('userData', JSON.stringify(resData));
                this.router.navigate(['/header']);
            },
            error => {
                console.log(error);
                this.error = error.error.error.message;
                console.log(this.error);
                this.errorHandling(this.error);
                this.isLoading = false;
            }
        );

        form.reset();
    }

    onSwitchMode() {
        this.isLoginMode = !this.isLoginMode;
    }

    errorHandling(error: string | null) {
        this.isError = true;

        let message: string;
        let action: string;

        switch (error) {
            case 'EMAIL_EXISTS':
                message = 'Email je već u upotrebi';
                this.errorMessagePosition = 1;
                action = 'Zatvori';
                break;
            case 'EMAIL_NOT_FOUND':
                message = 'Email nije pronađen';
                this.errorMessagePosition = 1;
                action = 'Zatvori';
                break;
            case 'INVALID_LOGIN_CREDENTIALS':
                message = 'Pogrešni pristupni podaci';
                this.errorMessagePosition = 2;
                action = 'Zatvori';
                break;
            case 'TOO_MANY_ATTEMPTS_TRY_LATER':
                message = 'Previše pokušaja, pokušajte kasnije';
                this.errorMessagePosition = 2;
                action = 'Zatvori';
                break;
            default:
                message = 'Greška';
                action = 'Zatvori';
                break;
        }

        this.errorMessageHTML = message;

        this._snackBar.open(message, action, { duration: 2000 });

    }


    //! AUTH.SERVICE ----------------------------

    user = new Subject<User>();

    signup(email: string, password: string) {
        return this.http
            .post<AuthResponseData>(
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
            .post<AuthResponseData>(
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
        const expirationDate = new Date(new Date().getTime() + +expiresIn * 1000);
        const user = new User(
            email,
            userId,
            token,
            expirationDate
        );
        this.user.next(user);
    }
}
