import { Component } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    standalone: true,
    imports: [
        MatDialogModule,
        MatButtonModule
    ],
})
export class ConfirmDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: { message: string; title: string; action: string }) { }

}
