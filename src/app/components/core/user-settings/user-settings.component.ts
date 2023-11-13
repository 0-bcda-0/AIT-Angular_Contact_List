import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { User } from 'src/app/models/user.model';

import { AuthService } from 'src/app/services/auth.service';
import { MySnackbarService } from 'src/app/services/my-snackbar.service';
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
export class UserSettingsComponent {
  authService = inject(AuthService);
  http = inject(HttpClient);
  MySnackbarService = inject(MySnackbarService);

  currentUser!: any;

  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem('userData')!);
  }

  onSubmit(form: NgForm): void {
    if (!form.valid) {
      return;
    }

    const name: string = form.value.name;
    const surname: string = form.value.surname;
    
    let users: any = [];
    
    const retriveurl = environment.firebaseConfig.databaseURL + '/users.json?auth=' + this.currentUser.idToken;
    this.http.get(retriveurl).subscribe({
      next: (data: any) => {
        if (data !== null) {
          users = Object.values(data);
          for (const user of users) {
            if (user.userId === this.currentUser.localId) {
              user.name = name;
              user.surname = surname;

              const sendurl = environment.firebaseConfig.databaseURL + '/users/' + user.userId + '.json?auth=' + this.currentUser.idToken;
              this.http.put(sendurl, user).subscribe({
                next: (responseData: any) => {
                  if (responseData !== null) {
                    this.MySnackbarService.openSnackBar('Podaci uspješno ažurirani.', 'Zatvori', 'success');

                    this.currentUser.name = name;
                    this.currentUser.surname = surname;

                    localStorage.setItem('userData', JSON.stringify(this.currentUser));

                    setInterval(() => {
                      window.location.reload();
                    }, 2100);
                  }
                },
                error: (error: any) => {
                  this.MySnackbarService.openSnackBar('Došlo je do pogreške prilikom ažuriranja podataka.', 'Zatvori', 'error');
                }
              });

              break;
            } else {
              this.MySnackbarService.openSnackBar('Korisnik nije pronađen', 'Zatvori', 'error');
            }
          }
        }
      },
      error: (error: any) => {
        this.MySnackbarService.openSnackBar('Došlo je do pogreške prilikom dohvaćanja podataka.', 'Zatvori', 'error');
      }
    });
  }


  onSubmit2(form: NgForm): void {
    if (!form.valid) {
      return;
    }

    const name: string = form.value.name;
    const surname: string = form.value.surname;

    console.log('name: ' + name);
    console.log('surname: ' + surname);

    // Get users from database into array
    let users: any = [];
    const retriveurl = environment.firebaseConfig.databaseURL + '/users.json?auth=' + this.currentUser.idToken;

    this.http.get(retriveurl).subscribe({
      next: (data: any) => {
        if (data !== null) {
          users = Object.values(data);
          for (const user of users) {
            if (user.userId === this.currentUser.localId) {
              console.log('User found.');
              return user;
            }
          }
        }
      },
      error: (error: any) => {
        this.MySnackbarService.openSnackBar('Došlo je do pogreške prilikom dohvaćanja podataka.', 'Zatvori', 'error');
      }
    });

    console.log('users');
    console.log(users);


    const requestBody = {
      name: name,
      surname: surname
    };

    const sendurl = environment.firebaseConfig.databaseURL + '/users/' + this.currentUser.localId + '.json?auth=' + this.currentUser.idToken;

    this.http.put(sendurl, requestBody).subscribe({
      next: (data: any) => {
        if (data !== null) {
          this.MySnackbarService.openSnackBar('Podaci uspješno ažurirani.', 'Zatvori', 'success');
        }
      },
      error: (error: any) => {
        this.MySnackbarService.openSnackBar('Došlo je do pogreške prilikom ažuriranja podataka.', 'Zatvori', 'error');
      }
    });

  }

  sendPRM(): void {
    const url = environment.firebaseConfig.passResetURL + environment.firebaseConfig.apiKey;

    const requestBody = {
      email: this.currentUser!.email,
      requestType: 'PASSWORD_RESET'
    };

    this.http.post(url, requestBody).subscribe({
      next: (data: any) => {
        if (data !== null) {
          this.MySnackbarService.openSnackBar('Zahtjev za promjenu lozinke poslan uspješno.', 'Zatvori', 'success');
        }
      },
      error: (error: any) => {
        this.MySnackbarService.openSnackBar('Došlo je do pogreške prilikom slanja zahtjeva za promjenu lozinke.', 'Zatvori', 'error');
      }
    });

  }



}
