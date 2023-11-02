import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NewContactDialogComponent } from '../components/new-contact-dialog/new-contact-dialog.component'


@Injectable({ providedIn: 'root' })
export class DialogService {
    constructor(private dialog: MatDialog) { }

    openDialog(): void {
        this.dialog.open(NewContactDialogComponent);
    }

    viewContactDialog(data: any): void {
        this.dialog.open(NewContactDialogComponent, {
            data: data
        });
    }

    editContactDialog(data: any): void {
        data.edit = true;
        this.dialog.open(NewContactDialogComponent, {
            data: data
        });
    }

}
