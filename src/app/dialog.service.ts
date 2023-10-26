import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NewContactDialogComponent } from './new-contact-dialog/new-contact-dialog.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { Contact } from './contact.interface';


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

    deleteContactDialog(data: Contact, text: {}, action: string): void {
        this.dialog.open(ConfirmDialogComponent, {
            data: { data, text, action }
        });
    }

    closeNewContactDialog(data: null, text: {}, action: string): void {
        this.dialog.open(ConfirmDialogComponent, {
            data: { data, text, action }
        });
    }
}
