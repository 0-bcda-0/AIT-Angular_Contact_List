// Angular
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { lastValueFrom } from 'rxjs';

// My imports
import { IAuthResponseData } from '../models/IAuthResponseData.interface';
import { environment } from 'src/environments/environment.firebase';
import { UserSettingsService } from './user-settings.service';

@Injectable({ providedIn: 'root' })
export class AuthService  {
    http = inject(HttpClient);
    userSettingsService = inject(UserSettingsService);

    user = new BehaviorSubject<User>(null!);

    async signupAsync(email: string, password: string): Promise<void> {
        const resData = await lastValueFrom(this.http.post<IAuthResponseData>(
            environment.firebaseConfig.authURL + environment.firebaseConfig.signUp + environment.firebaseConfig.apiKey,
            {
                email: email,
                password: password,
                returnSecureToken: true
            }
        ));

        // Kreiranje jedinstvenog imena i prezimena
        let userSettingsData: { name: string, surname: string } = this.userSettingsService.createUniqueUS();
        let name: string = userSettingsData.name;
        let surname: string = userSettingsData.surname;

        // Spremanje u DB i LS
        await this.userSettingsService.storeUSinDatabaseAsync(resData, name, surname);

        this.userSettingsService.storeUSinLocalStorage(resData, name, surname);

        this.handleAuthentication(
            resData.email,
            resData.localId,
            resData.idToken,
            +resData.expiresIn,
        );
    }

    async loginAsync(email: string, password: string): Promise<void> {
        const resData: IAuthResponseData = await lastValueFrom(this.http.post<IAuthResponseData>(
            environment.firebaseConfig.authURL + environment.firebaseConfig.signIn + environment.firebaseConfig.apiKey,
            {
                email: email,
                password: password,
                returnSecureToken: true
            }
        ));

        let name: string = '.';
        let surname: string = '.';
        this.userSettingsService.storeUSinLocalStorage(resData, name, surname);
        const userSettingsData: { idDB: string, localId: string, name: string, surname: string } = await this.userSettingsService.getUSfromDatabaseAsync(resData);

        name = userSettingsData.name;
        surname = userSettingsData.surname;
        this.userSettingsService.storeUSinLocalStorage(resData, name, surname);

        this.userSettingsService.refreshUser();
        this.handleAuthentication(
            resData.email,
            resData.localId,
            resData.idToken,
            +resData.expiresIn,
        );
    }

    private handleAuthentication(
        email: string,
        userId: string,
        token: string,
        expiresIn: number,
    ): void {
        let expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
        // TESTING - 30s 
        // let expirationDate = new Date(new Date().getTime() + 30000);

        let userData = localStorage.getItem('userData');
        let userDataObj = JSON.parse(userData!);
        userDataObj.expirationDate = expirationDate;
        localStorage.setItem('userData', JSON.stringify(userDataObj));

        const user = new User(
            email,
            userId,
            token,
            expirationDate,
        );
        this.user.next(user);
    }
}