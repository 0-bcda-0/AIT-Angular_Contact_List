import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { tap } from 'rxjs/operators';

import { IAuthResponseData } from '../models/IAuthResponseData.interface';

import { environment } from 'src/environments/environment.firebase';
import { UserSettingsService } from './user-settings.service';

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {

    http = inject(HttpClient);
    userSettingsService = inject(UserSettingsService);

    subscription: any;

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
                // Kreiranje jedinstvenog imena i prezimena
                let userSettingsData: { name: string, surname: string } = this.userSettingsService.createUniqueUS();
                let name: string = userSettingsData.name;
                let surname: string = userSettingsData.surname;

                // Spremanje u DB i LS
                this.userSettingsService.storeUSinDatabase(resData, name, surname);
                this.userSettingsService.storeUSinLocalStorage(resData, name, surname);

                this.handleAuthentication(
                    resData.email,
                    resData.localId,
                    resData.idToken,
                    +resData.expiresIn,
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
                let name: string = '.';
                let surname: string = '.';
                // Dohvacanje imena i prezimena iz baze i spremanje u LS
                this.subscription = this.userSettingsService.getUSfromDatabase(resData).subscribe({
                    next: (userSettingsData) => {
                        name = userSettingsData.name;
                        surname = userSettingsData.surname;
                        this.userSettingsService.storeUSinLocalStorage(resData, name, surname);
                        this.userSettingsService.refreshUser();
                    },
                    error: (err) => {
                        console.log('Error: ' + err);
                    }
                });
                //? Zasto bez pozivanja ove funkcije ne radi kada sam vec pozvao istu funkciju u gornjem subscribe-u?
                //? Kada pozivam ovu, onda uopce ni nemam name i surname, a na kraju krajeva je sve kako spada... 
                this.userSettingsService.storeUSinLocalStorage(resData, name, surname);
                this.handleAuthentication(
                    resData.email,
                    resData.localId,
                    resData.idToken,
                    +resData.expiresIn,
                );
            }
            ));
    }

    private handleAuthentication(
        email: string,
        userId: string,
        token: string,
        expiresIn: number,
    ) {
        const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
        const user = new User(
            email,
            userId,
            token,
            expirationDate,
        );
        this.user.next(user);
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
}