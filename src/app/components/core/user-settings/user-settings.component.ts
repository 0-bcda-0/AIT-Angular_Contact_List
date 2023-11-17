import { HttpClient } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { lastValueFrom } from 'rxjs';
import { IAuthResponseData } from 'src/app/models/IAuthResponseData.interface';

import { AuthService } from 'src/app/services/auth.service';
import { MySnackbarService } from 'src/app/services/my-snackbar.service';
import { UserSettingsService } from 'src/app/services/user-settings.service';
import { environment } from 'src/environments/environment.firebase';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
  ]
})
export class UserSettingsComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  http = inject(HttpClient);
  MySnackbarService = inject(MySnackbarService);
  userSettingsService = inject(UserSettingsService);

  currentUser!: IAuthResponseData;
  nameToDisplay: string | undefined;
  surnameToDisplay: string | undefined;

  subscription: any;

  ngOnInit(): void {
    this.subscription = this.userSettingsService.user.subscribe(user => {
      this.currentUser = user;
    });

    this.nameToDisplay = this.currentUser.name;
    this.surnameToDisplay = this.currentUser.surname;
  }

  async onSubmitAsync(form: NgForm): Promise<void> {
    if (!form.valid) {
      return;
    }

    const name: string = form.value.name;
    const surname: string = form.value.surname;
    try {
      await this.userSettingsService.updateUSinDatabaseAsync(this.currentUser, name, surname);
      this.userSettingsService.storeUSinLocalStorage(this.currentUser, name, surname);
      this.MySnackbarService.openSnackBar('Korisnički podaci uspješno promjenjeni.', 'Zatvori', 'success');
    } catch {
      this.MySnackbarService.openSnackBar('Došlo je do pogreške prilikom promjene korisničkih podataka', 'Zatvori', 'error');
    }
  }

  async sendPRMAsync(): Promise<void> {
    try {
      const url: string = environment.firebaseConfig.passResetURL + environment.firebaseConfig.apiKey;

      const requestBody = {
        email: this.currentUser!.email,
        requestType: 'PASSWORD_RESET'
      };

      const data = await lastValueFrom(this.http.post(url, requestBody));
      if (data !== null) {
        this.MySnackbarService.openSnackBar('Zahtjev za promjenu lozinke poslan uspješno.', 'Zatvori', 'success');
      }
    } catch {
      this.MySnackbarService.openSnackBar('Došlo je do pogreške prilikom slanja zahtjeva za promjenu lozinke.', 'Zatvori', 'error');
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
