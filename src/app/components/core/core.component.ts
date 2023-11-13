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

@Component({
    selector: 'app-core',
    templateUrl: './core.component.html',
    styleUrls: ['./core.component.scss'],
    standalone: true,
    imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatSidenavModule, MatListModule, RouterLink, RouterLinkActive, RouterOutlet, ThemeToggleComponent, NgStyle]
})
export class CoreComponent implements OnInit {
    isMenuOpen = false;

    router = inject(Router);
    authService = inject(AuthService);

    currentUser: User | null = null;

    ngOnInit(): void {
        this.currentUser = JSON.parse(localStorage.getItem('userData')!);
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }

    logout() {
        localStorage.removeItem('userData');
        this.router.navigate(['/login']);
    }
}

