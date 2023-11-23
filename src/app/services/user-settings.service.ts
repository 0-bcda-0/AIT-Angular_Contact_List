import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, last } from 'rxjs';
import { lastValueFrom } from 'rxjs';

import { environment } from 'src/environments/environment.firebase';
import { IAuthResponseData } from '../models/IAuthResponseData.interface';

@Injectable({
  providedIn: 'root',
})
export class UserSettingsService {
  http = inject(HttpClient);

  private userDataSource = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('userData')!));

  user = this.userDataSource.asObservable();

  refreshUser(): void {
    this.userDataSource.next(JSON.parse(localStorage.getItem('userData')!));
  }

  async getUSfromDatabaseAsync(user: IAuthResponseData): Promise<{ idDB: string; localId: string; name: string; surname: string; }> {
    let isFound: boolean = false;

    const URL: string = environment.firebaseConfig.databaseURL + '/users.json';

    const data = await lastValueFrom(this.http.get<{ [key: string]: IAuthResponseData }>(URL));

    let idDB: string = '';
    let localId: string = '';
    let name: string = '';
    let surname: string = '';

    if (data !== null) {
      const users = Object.keys(data).map((idDB) => ({ idDB, ...data[idDB], }));
      let searchId: string = user.localId;
      for (const Resuser of users) {
        if (Resuser.localId === searchId) {
          idDB = Resuser.idDB;
          localId = Resuser.localId;
          name = Resuser.name!;
          surname = Resuser.surname!;
          isFound = true;
          break;
        }
      }
      if (isFound === false) {
        let userSettingsData: { name: string; surname: string } =
          this.createUniqueUS();
        name = userSettingsData.name;
        surname = userSettingsData.surname;
        await this.storeUSinDatabaseAsync(user, name, surname);
        this.storeUSinLocalStorage(user, name, surname);
      }
    }
    return { idDB, localId, name, surname };
  }

  async storeUSinDatabaseAsync(user: IAuthResponseData, name: string, surname: string): Promise<void> {
    try {
      const localId: string = user.localId;
      const dataToSave = { localId, name, surname };
      const dataBaseURL: string = `${environment.firebaseConfig.databaseURL}/users.json?auth=` + user.idToken;

      const http = await lastValueFrom(this.http.post(dataBaseURL, dataToSave));
    } catch {
      console.log('Greška pri spremanju u bazu.');
    }
  }

  async updateUSinDatabaseAsync(user: IAuthResponseData, name: string, surname: string): Promise<void> {
    const userSettingsData: { idDB: string; localId: string; name: string; surname: string; } = await this.getUSfromDatabaseAsync(user);
    
    const localId: string = user.localId;
    const idDB: string = userSettingsData.idDB;
    const dataToSave = { localId, name, surname };
    const dataBaseURL: string = `${environment.firebaseConfig.databaseURL}/users/${idDB}.json`;

    await lastValueFrom(this.http.put(dataBaseURL, dataToSave));
  }

  storeUSinLocalStorage(user: IAuthResponseData, name: string, surname: string): void {
    user.name = name;
    user.surname = surname;
    localStorage.setItem('userData', JSON.stringify(user));
  }

  createUniqueUS(): { name: string; surname: string } {
    const name: string = 'user';
    const surname: string = Math.floor(Math.random() * 100000).toString();

    return { name, surname };
  }
}
