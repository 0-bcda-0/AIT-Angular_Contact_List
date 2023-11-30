import { Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterOutlet } from '@angular/router';
import { LoaderService } from './loader.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    // styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [RouterOutlet, MatProgressSpinnerModule, CommonModule]
})
export class AppComponent {
    title = 'imenik-app-material';

    loaderService = inject(LoaderService);
}
