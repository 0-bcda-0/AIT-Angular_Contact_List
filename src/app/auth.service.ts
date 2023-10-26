// import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { Injectable } from '@angular/core';

// import { enableProdMode, importProvidersFrom } from "@angular/core";
// import { bootstrapApplication } from "@angular/platform-browser";


// interface AuthResponseData {
//     kind: string;
//     idToken: string;
//     email: string;
//     refreshToken: string;
//     expiresIn: string;
//     localId: string;
//     registered?: boolean;
// }

// @Injectable({ providedIn: 'root'})
// export class AuthService {


//     constructor(private http: HttpClient) {}
    

//     signup(email: string, password: string) {
//         return this.http.post<AuthResponseData>
//         ('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBQ0Se7T3dFJse5Xo3NfOxWojtHLNyKGCo', 
//         {
//             email: email, 
//             password: password,
//             returnSecureToken: true
//         });
//     }
// }