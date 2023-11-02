import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class SnackbarService {

    constructor(private snackBar: MatSnackBar) { }

    show(message: string, action: string, type: 'success' | 'error'): void {
        let panelClass: string = '';
    
        if (type === 'success') {
            panelClass = 'snackbar-success';
        } else if (type === 'error') {
            panelClass = 'snackbar-error';
        }
    
        this.snackBar.open(message, action, {
            duration: 5000,
            panelClass: [panelClass]
        });
    }
    
}
