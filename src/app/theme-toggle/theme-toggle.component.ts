import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
    selector: 'app-theme-toggle',
    templateUrl: './theme-toggle.component.html',
    styleUrls: ['./theme-toggle.component.scss'],
    standalone: true,
    imports: [
        MatSlideToggleModule,
        FormsModule,
    ],
})
export class ThemeToggleComponent implements OnInit {
    isDarkMode!: boolean;

    constructor(private renderer: Renderer2) { }

    ngOnInit(): void {
        if (localStorage.getItem('theme') == 'light') {
            this.isDarkMode = true;
            this.renderer.addClass(document.body, 'alternative');
        } else {
            this.isDarkMode = false;
            this.renderer.removeClass(document.body, 'alternative');
        }

    }

    toggleTheme(): void {
        this.isDarkMode = !this.isDarkMode;
        if (this.isDarkMode) {
            this.renderer.addClass(document.body, 'alternative');
            localStorage.setItem('theme', 'light');
        } else {
            this.renderer.removeClass(document.body, 'alternative');
            localStorage.setItem('theme', 'dark');
        }
    }

}
