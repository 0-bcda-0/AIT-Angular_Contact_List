import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { mySnackbarComponent } from '../my-snackbar/my-snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class mySnackbarService {
  snackbar = inject(MatSnackBar)

  public openSnackBar(message: string, action: string, snackType: string) {
    const _snackType =
      snackType !== undefined ? snackType : 'Success';

    this.snackbar.openFromComponent(mySnackbarComponent, {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      data: { message: message, action: action, snackType: _snackType, snackBar: this.snackbar }
    });
  }
}
