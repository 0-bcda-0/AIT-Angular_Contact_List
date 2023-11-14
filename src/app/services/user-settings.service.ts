import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from 'src/environments/environment.firebase';

interface User {
  localId: string;
  name: string;
  surname: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {
  http = inject(HttpClient);

  private userDataSource = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('userData')!));

  user = this.userDataSource.asObservable();

  refreshUser() {
    this.userDataSource.next(JSON.parse(localStorage.getItem('userData')!));
  }

  getUSfromDatabase(user: any): Observable<{ idDB: string, localId: string, name: string, surname: string }> {
    let isFound: boolean = false;

    const URL: string = environment.firebaseConfig.databaseURL + '/users.json?auth=' + user.idToken;
    return new Observable(observer => {
      this.http.get<{ [key: string]: User }>(URL).subscribe({
        next: (data) => {
          let idDB: string = '';
          let localId: string = '';
          let name: string = '';
          let surname: string = '';

          if (data !== null) {
            const users = Object.keys(data).map(idDB => ({ idDB, ...data[idDB] }));
            let searchId: string = user.localId
            for (const Resuser of users) {
              if (Resuser.localId === searchId) {
                console.log('Pronađen user u bazi.');
                idDB = Resuser.idDB;
                localId = Resuser.localId;
                name = Resuser.name;
                surname = Resuser.surname;
                isFound = true;
                break;
              } else {
                console.log('Nije pronađen user u bazi.');
              }
            }
            if (isFound === false) {
              let userSettingsData: { name:string, surname:string } = this.createUniqueUS();
              name = userSettingsData.name;
              surname = userSettingsData.surname;
              this.storeUSinDatabase(user, name, surname);
              this.storeUSinLocalStorage(user, name, surname);
            }
          } else {
            console.log('Nema podataka u bazi.');
          }

          observer.next({ idDB, localId, name, surname });
          observer.complete();
        },
        error: err => {
          observer.error(err);
        }
      });
    });
  }

  storeUSinDatabase(user: any, name: string, surname: string): void {
    const localId: string = user.localId;
    const dataToSave = { localId, name, surname };
    const dataBaseURL: string = `${environment.firebaseConfig.databaseURL}/users.json?auth=${user.idToken}`;

    this.http.post(dataBaseURL, dataToSave)
      .subscribe({
        next: () => {
          console.log('Spremljeno u bazu.');
        },
        error: () => {
          console.log('Greška pri spremanju u bazu.');
        }
      });
  }

  updateUSinDatabase(user: any, name: string, surname: string): void {
    this.getUSfromDatabase(user).subscribe({
      next: (userSettingsData: any) => {
        const localId: string = user.localId;
        const idDB: string = userSettingsData.idDB;
        const dataToSave = { localId, name, surname };
        const dataBaseURL: string = `${environment.firebaseConfig.databaseURL}/users/${idDB}.json?auth=${user.idToken}`;

        this.http.put(dataBaseURL, dataToSave)
          .subscribe({
            next: () => {
              console.log('Azurirano u bazu.');
              
            },
            error: () => {
              console.log('Greška pri spremanju u bazu.');
            }
          });
      },
      error: (err) => {
        // Error handler
      }
    });
  }

  storeUSinLocalStorage(user: any, name: string, surname: string): void {
    user.name = name;
    user.surname = surname;
    localStorage.setItem('userData', JSON.stringify(user));
  }

  createUniqueUS(): { name: string, surname: string } {
    const name: string = 'user';
    const surname: string = Math.floor(Math.random() * 100000).toString();

    return { name, surname };
  }

}
