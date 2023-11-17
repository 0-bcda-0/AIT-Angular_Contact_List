// Angular
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgStyle } from '@angular/common';

// Angualr Material
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

// My Imports
import { ThemeToggleComponent } from '../../theme-toggle/theme-toggle.component';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { UserSettingsService } from 'src/app/services/user-settings.service';

@Component({
    selector: 'app-core',
    templateUrl: './core.component.html',
    styleUrls: ['./core.component.scss'],
    standalone: true,
    imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatSidenavModule, MatListModule, RouterLink, RouterLinkActive, RouterOutlet, ThemeToggleComponent, NgStyle]
})
export class CoreComponent implements OnInit {
    router = inject(Router);
    authService = inject(AuthService);
    userSettingsService = inject(UserSettingsService);

    subscription: any;
    currentUser: User | null = null;
    isMenuOpen: boolean = false;

    ngOnInit(): void {
        this.currentUser = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')!) : null;
    }

    toggleMenu(): void {
        this.isMenuOpen = !this.isMenuOpen;
    }

    logout(): void {
        localStorage.removeItem('userData');
        this.router.navigate(['/login']);
    }
}

