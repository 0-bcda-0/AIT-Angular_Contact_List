import { NgClass } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-my-snackbar',
  templateUrl: './my-snackbar.component.html',
  styleUrls: ['./my-snackbar.component.scss'],
  standalone: true,
  imports: [
    MatIconModule,
    NgClass
  ],
})
export class mySnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {};

  get getIcon(): string {
    switch (this.data.snackType) {
      case 'success':
        return 'done';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'done';
    }
  }
}
