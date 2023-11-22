// Angular
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { Observable, lastValueFrom } from 'rxjs';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// My Imports
import { AuthService } from '../../services/auth.service';
import { IAuthResponseData } from '../../models/IAuthResponseData.interface';
import { mySnackbarService } from 'src/app/services/my-snackbar.service';
import { environment } from 'src/environments/environment.firebase';

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
    ]
})
export class LoginComponent {
    router = inject(Router);
    authService = inject(AuthService);
    mySnackbarService = inject(mySnackbarService);
    http = inject(HttpClient);

    isLoginMode: boolean = true;
    isLoading: boolean = false;

    isError: boolean = false;
    errorMessageHTML: string = '';
    errorMessagePosition: number = 0;
    error: string | null = null;

    isPasswordResetVisible: boolean = false;
    emailForPasswordReset: string = '';

    async onSubmit(form: NgForm): Promise<void> {
        if (!form.valid) {
            return;
        }

        const email: string = form.value.email;
        const password: string = form.value.password;

        this.isLoading = true;

        let authObs: Observable<IAuthResponseData> | void;

        if (this.isLoginMode) {
            //* LOGIN
            try {
                authObs = await this.authService.loginAsync(email, password);
                this.isLoading = false;
                this.router.navigate(['/core']);
            } catch (error: any) {
                this.error = error.error.error.message;
                this.errorHandling(this.error);
                this.isLoading = false;
                this.isPasswordResetVisible = true;
                this.emailForPasswordReset = email;
            }
        } else {
            //* SIGNUP
            try {
                this.isPasswordResetVisible = false;
                authObs = await this.authService.signupAsync(email, password);
                this.emailForPasswordReset = email;
                this.isLoading = false;
                this.router.navigate(['/core']);
            } catch {
                this.mySnackbarService.openSnackBar('Došlo je do greške prilikom registracije.', 'Zatvori', 'error');
            }
        }
        form.reset();
    }

    onSwitchMode(): void {
        this.isLoginMode = !this.isLoginMode;
        this.isPasswordResetVisible = !this.isPasswordResetVisible;
    }

    errorHandling(error: string | null): void {
        this.isError = true;

        let message: string;

        switch (error) {
            case 'EMAIL_EXISTS':
                message = 'Email je već u upotrebi';
                this.errorMessagePosition = 1;
                break;
            case 'EMAIL_NOT_FOUND':
                message = 'Email nije pronađen';
                this.errorMessagePosition = 1;
                break;
            case 'INVALID_LOGIN_CREDENTIALS':
                message = 'Pogrešni pristupni podaci';
                this.errorMessagePosition = 2;
                break;
            case 'TOO_MANY_ATTEMPTS_TRY_LATER':
                message = 'Previše pokušaja, pokušajte kasnije';
                this.errorMessagePosition = 2;
                break;
            default:
                message = 'Došlo je do greške prilikom prijave.';
                break;
        }
        this.errorMessageHTML = message;
        this.mySnackbarService.openSnackBar(message, 'Zatvori', 'error');
    }

    async sendPRMwMAsync(email: string): Promise<void> {
        try {
            const url: string = environment.firebaseConfig.passResetURL + environment.firebaseConfig.apiKey;

            const requestBody = {
                email: email,
                requestType: 'PASSWORD_RESET'
            };

            const data = await lastValueFrom(this.http.post(url, requestBody));
            if (data !== null) {
                this.mySnackbarService.openSnackBar('Zahtjev za promjenu lozinke uspješno poslan na ' + email + '.', 'Zatvori', 'success');
            }
        } catch {
            this.mySnackbarService.openSnackBar('Došlo je do pogreške prilikom slanja zahtjeva za promjenu lozinke.', 'Zatvori', 'error');
        }
    }
}
