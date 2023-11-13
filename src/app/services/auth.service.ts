import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { tap } from 'rxjs/operators';

import { IAuthResponseData } from '../models/IAuthResponseData.interface';

import { environment } from 'src/environments/environment.firebase';

@Injectable({ providedIn: 'root' })
export class AuthService {

    http = inject(HttpClient);

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
                let name = 'user';
                let surname = this.generateTempSurname();
                this.storeToDatabase(resData.localId, name, surname);
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

    private generateTempSurname() {
        let rand = Math.floor(Math.random() * 100000);
        let randStr = rand.toString();
        return randStr;
    }

    private storeToDatabase(userId: string, name: string, surname: string) {
        const subscription = this.user.subscribe(user => {
            if (user) {
                const dataSaved = {
                    userId: userId,
                    name: name,
                    surname: surname
                };

                const dataBaseURL: string = `${environment.firebaseConfig.databaseURL}/users.json?auth=${user.token}`;

                this.http.post(dataBaseURL, dataSaved)
                    .subscribe({
                        next: () => {
                            //! MAKNUTI 
                            console.log('Spremljeno u bazu.');

                            // Unsubscribe to prevent further executions
                            subscription.unsubscribe();
                        },
                        error: () => {
                            //! NAPRAVITI SNACKBAR
                            console.log('Greška pri spremanju u bazu.');
                        }
                    });
            } else {
                console.log('User is null. Unable to retrieve token.');
            }
        });
    }

    findUsername(resData: IAuthResponseData) {
        let name = '';
        let surname = '';

        const dataBaseURL: string = `${environment.firebaseConfig.databaseURL}/users.json?auth=${resData.idToken}`;

        this.http.get(dataBaseURL).subscribe((data: any) => {
            console.log(data);
            for (const key in data) {
                if (data[key].userId === resData.localId) {
                    console.log('User found.');
                    name = data[key].name;
                    surname = data[key].surname;
                    localStorage.setItem('userData', JSON.stringify({ ...resData, name, surname }));
                }
            }
        });
    }

    // private getFromDatabase(userId: string) {
    //     // console.log('getFromDatabase()');
    //     // console.log('userId: ' + userId);
    //     const subscription = this.user.subscribe(user => {
    //         if (user) {
    //             const dataBaseURL: string = `${environment.firebaseConfig.databaseURL}/users.json?auth=${user.token}`;

    //             this.http.get(dataBaseURL).subscribe((data: any) => {
    //                 // console.log(data);
    //                 for (const key in data) {
    //                     if (data[key].userId === userId) {
    //                         console.log('User found.');
    //                         user.name = data[key].name;
    //                         user.surname = data[key].surname;
    //                     }
    //                 }
    //                 subscription.unsubscribe();
    //             });
    //         } else {
    //             console.log('User is null. Unable to retrieve token.');
    //         }
    //     });
    // }
}