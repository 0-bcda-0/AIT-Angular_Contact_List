import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ContactsComponent } from './components/core/contacts/contacts.component';
import { LoginComponent } from './components/login/login.component';
import { CoreComponent } from './components/core/core.component';

import { IsAuthGuard } from './services/auth.guard';
import { UserSettingsComponent } from './components/core/user-settings/user-settings.component';

const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    {
        path: 'core', component: CoreComponent, canActivate: [IsAuthGuard], children: [
        // path: 'core', component: CoreComponent, children: [
            { path: '', component: ContactsComponent },
            { path: 'contacts', component: ContactsComponent },
            { path: 'user-settings', component: UserSettingsComponent }
        ]
    },
    { path: '**', redirectTo: '/login' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
