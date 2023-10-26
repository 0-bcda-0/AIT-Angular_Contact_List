import { Component, Inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import {
    MatDialogRef,
    MatDialogModule,
    MAT_DIALOG_DATA,
    MatDialog,
} from '@angular/material/dialog';

import { Contact } from '../contact.interface';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
    selector: 'app-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss'],
    standalone: true,
    imports: [
        MatButtonModule,
        MatDialogModule,
        MatSnackBarModule,
        HttpClientModule,
    ],
})
export class ConfirmDialogComponent {
    dialogTitle: string;
    dialogMessage: string;
    dialogButtonText: string;

    constructor(
        public dialogRef: MatDialogRef<ConfirmDialogComponent>,
        private dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private http: HttpClient,
        private _snackBar: MatSnackBar
    ) {
        this.dialogTitle = data.text[0];
        this.dialogMessage = data.text[1];
        this.dialogButtonText = data.text[2];
    }

    closeDialog() {
        this.dialogRef.close();
    }

    dialogButtonClick() {
        switch (this.data.action) {
            case 'delete':
                this.deleteContact(this.data.data);
                break;
            case 'close':
                this.closeNewContactDialog();
                break;
            default:
                this.dialogRef.close();
        }
    }

    deleteContact(contactSelected: Contact): void {
        //* Dohvacanje podataka iz Firebase-a
        const dataBaseURL = `https://ng-course-3f5f5-default-rtdb.firebaseio.com/contacts.json`;
        this.http.get(dataBaseURL).subscribe((data: any) => {
            //* Spremanje ID-a i podataka u array
            const contacts = Object.keys(data).map((id) => ({ id, ...data[id] }));

            //* Filtriranje po uniqueID-u
            const contactToDelete: any = contacts.filter(
                (contact: any) => contact.uniqueID === contactSelected.uniqueID
            );

            //* Spremanje ID-a kontakta koji se brise
            const contactToDeleteID = contactToDelete[0].id;

            //* Kreiranje URL-a za brisanje kontakta i brisanje kontakta
            const contactToDeleteURL = `https://ng-course-3f5f5-default-rtdb.firebaseio.com/contacts/${contactToDeleteID}.json`;
            this.http.delete(contactToDeleteURL).subscribe((data: any) => {
                this._snackBar.open(
                    'Data has been successfully deleted from the database.',
                    '',
                    { duration: 2000 }
                );
                setTimeout(() => {
                    location.reload();
                }, 1000);
            });
        });
    }

    closeNewContactDialog() {
        this.dialog.closeAll();
    }
}
