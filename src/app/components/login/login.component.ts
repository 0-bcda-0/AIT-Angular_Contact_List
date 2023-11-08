// Angular
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NgIf, NgStyle } from '@angular/common';
import { Observable } from 'rxjs';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// My Imports
import { AuthService } from '../../services/auth.service';
import { IAuthResponseData } from '../../models/IAuthResponseData.interface';
import { MySnackbarService } from 'src/app/services/my-snackbar.service';

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
        NgStyle,
    ]
})
export class LoginComponent {
    router = inject(Router);
    authService = inject(AuthService);
    MySnackbarService = inject(MySnackbarService);

    isLoginMode: boolean = true;
    isLoading: boolean = false;

    isError: boolean = false;
    errorMessageHTML: string = '';
    errorMessagePosition: number = 0;
    error: string | null = null;

    onSubmit(form: NgForm): void {
        if (!form.valid) {
            return;
        }

        const email: string = form.value.email;
        const password: string = form.value.password;

        this.isLoading = true;

        let authObs: Observable<IAuthResponseData>;

        if (this.isLoginMode) {
            //* LOGIN
            authObs = this.authService.login(email, password);
        } else {
            //* SIGNUP
            authObs = this.authService.signup(email, password);
        }

        authObs.subscribe({
            next: (resData: IAuthResponseData) => {
                this.isLoading = false;
                localStorage.setItem('userData', JSON.stringify(resData));
                this.router.navigate(['/core']);
            },
            error: (error) => {
                this.error = error.error.error.message;
                this.errorHandling(this.error);
                this.isLoading = false;
            }
        });
        form.reset();
    }

    onSwitchMode(): void {
        this.isLoginMode = !this.isLoginMode;
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
                message = 'Greška';
                break;
        }
        this.errorMessageHTML = message;
        this.MySnackbarService.openSnackBar(message, 'Zatvori', 'error');
    }
}
