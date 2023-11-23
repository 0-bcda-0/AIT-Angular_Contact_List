import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NewContactDialogComponent } from '../components/new-contact-dialog/new-contact-dialog.component'

import { IContact } from '../models/contact.interface';


@Injectable({ providedIn: 'root' })
export class DialogService {
    dialog = inject(MatDialog);

    openDialog(): void {
        this.dialog.open(NewContactDialogComponent);
    }

    viewContactDialog(data: IContact): void {
        this.dialog.open(NewContactDialogComponent, {
            data: data
        });
    }

    editContactDialog(data: IContact): void {
        data.edit = true;
        this.dialog.open(NewContactDialogComponent, {
            data: data
        });
    }

}
