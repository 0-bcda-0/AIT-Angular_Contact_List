import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ContactsComponent } from './components/core/contacts/contacts.component';
import { LoginComponent } from './components/login/login.component';
import { CoreComponent } from './components/core/core.component';

import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    {
        path: 'core', component: CoreComponent, canActivate: [AuthGuard], children: [
            { path: '', component: ContactsComponent },
        ]
    },
    { path: '**', redirectTo: '/login' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
