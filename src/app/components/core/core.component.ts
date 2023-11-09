// Angular
import { Component, inject } from '@angular/core';
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

@Component({
    selector: 'app-core',
    templateUrl: './core.component.html',
    styleUrls: ['./core.component.scss'],
    standalone: true,
    imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatSidenavModule, MatListModule, RouterLink, RouterLinkActive, RouterOutlet, ThemeToggleComponent, NgStyle]
})
export class CoreComponent {
    isMenuOpen = false;
    router = inject(Router);

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }

    logout() {
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
    }
}
