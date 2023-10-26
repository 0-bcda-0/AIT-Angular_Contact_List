import { Component, Inject, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { NgIf, NgStyle } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';



import { Contact } from '../contact.interface';
import { DialogService } from '../dialog.service';

@Component({
    selector: 'app-new-contact-dialog',
    templateUrl: './new-contact-dialog.component.html',
    styleUrls: ['./new-contact-dialog.component.scss'],
    standalone: true,
    imports: [
        MatDialogModule,
        MatStepperModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatSelectModule,
        MatOptionModule,
        MatButtonModule,
        MatSnackBarModule,
        NgIf,
        NgStyle
    ],
})
export class NewContactDialogComponent {
    PIFormGroup!: FormGroup;
    LIFormGroup!: FormGroup;
    CIFormGroup!: FormGroup;

    isViewOnly: boolean = false;
    isEditMode: boolean = false;
    uniqueID: any;
    dataInForm: any;
    maxDate: Date = new Date();

    constructor(private _formBuilder: FormBuilder,
        private _snackBar: MatSnackBar,
        private http: HttpClient,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private router: Router,
        public dialogRef: MatDialogRef<NewContactDialogComponent>,
        private dialogSevice: DialogService,
        private renderer: Renderer2
    ) {

        this.PIFormGroup = this._formBuilder.group({
            name: [{ value: '', disabled: this.isViewOnly && !this.isEditMode }, Validators.required],
            surname: [{ value: '', disabled: this.isViewOnly && !this.isEditMode }, Validators.required],
            dateOfBirth: [{ value: '', disabled: this.isViewOnly && !this.isEditMode }, Validators.required],
        });

        this.LIFormGroup = this._formBuilder.group({
            street: [{ value: '', disabled: this.isViewOnly && !this.isEditMode }, Validators.required],
            postalCode: [{ value: '', disabled: this.isViewOnly && !this.isEditMode }, Validators.required],
        });

        this.CIFormGroup = this._formBuilder.group({
            phonePrefix: [{ value: '', disabled: this.isViewOnly && !this.isEditMode }, Validators.required],
            phoneNumber: [{ value: '', disabled: this.isViewOnly && !this.isEditMode }, Validators.required],
        });

        console.log(this.data);
        if (data) {
            //* ViewOnly/Edit contact
            // Auto filling the form
            this.isViewOnly = true;
            this.dataInForm = data;
            if (data.edit) {
                this.isEditMode = true;
            }
            this.PIFormGroup = this._formBuilder.group({
                name: [{ value: this.dataInForm.name, disabled: this.isViewOnly && !this.isEditMode }, Validators.required],
                surname: [{ value: this.dataInForm.surname, disabled: this.isViewOnly && !this.isEditMode }, Validators.required],
                dateOfBirth: [{ value: this.dataInForm.dateOfBirth, disabled: this.isViewOnly && !this.isEditMode }, Validators.required],
            });

            this.LIFormGroup = this._formBuilder.group({
                street: [{ value: this.dataInForm.street, disabled: this.isViewOnly && !this.isEditMode }, Validators.required],
                postalCode: [{ value: this.dataInForm.postalCode, disabled: this.isViewOnly && !this.isEditMode }, Validators.required],
            });

            this.CIFormGroup = this._formBuilder.group({
                phonePrefix: [{ value: this.dataInForm.phonePrefix, disabled: this.isViewOnly && !this.isEditMode }, Validators.required],
                phoneNumber: [{ value: this.dataInForm.phoneNumber, disabled: this.isViewOnly && !this.isEditMode }, Validators.required],
            });
        } else {
            //* New contact 
            this.isViewOnly = false;
            this.dataInForm = null;
        }
    }

    onSubmit() {
        if (!this.isEditMode) {
            //! First Save
            //* Generiranje random ID-a
            const uniqueID = this.createUniqueID();

            //* Sve form grupe u jedan objekt sa random ID-om 
            const formValues = Object.assign({}, { uniqueID }, this.PIFormGroup.value, this.LIFormGroup.value, this.CIFormGroup.value);

            //* Dohvacanje usera iz local storage-a
            let user = localStorage.getItem('userData');

            //* Provjera da li je user autentificirane
            if (user) {
                //* Dohvacanje useruid-a
                const userObj = JSON.parse(user);
                const useruid = userObj.localId;

                //* Kreiranje finalnog payloada
                const dataSaved = Object.assign({}, { useruid }, formValues);

                //* Kreiranje URL-a za spremanje podataka u bazu i spremanje podataka u bazu
                const dataBaseURL = `https://ng-course-3f5f5-default-rtdb.firebaseio.com/contacts.json`;
                this.http.post(dataBaseURL, dataSaved)
                    .subscribe(
                        responseData => {
                            this._snackBar.open('Data has been successfully posted to the database.', '', { duration: 2000 });
                            this.closeDialog();
                            setTimeout(() => {
                                location.reload();
                            }, 2000);
                        },
                        error => {
                            this._snackBar.open('Error posting data to the database', '', { duration: 2000 });
                        }
                    );
            } else {
                //* Korisnih nije autentificiran
                this._snackBar.open('User is not authenticated.', '', { duration: 2000 });
            }
        } else {
            //! Edit
            //* Dodavanje ID-a iz Firebase-a
            const id = this.dataInForm.id;

            //* Dohvacanje korisnika iz local storage-a
            const user = localStorage.getItem('userData');

            //* Provjera da li je korisnik autentificiran
            if (user) {
                const userObj = JSON.parse(user);

                const useruid = userObj.localId;

                //* Kreiranje finalnog payloada
                const formValues = Object.assign({}, { useruid }, this.PIFormGroup.value, this.LIFormGroup.value, this.CIFormGroup.value);

                //* Brisanje pomocnih polja
                delete formValues.edit;
                delete formValues.id;
                delete formValues.number;

                //* kreiranje URL-a za spremanje podataka u bazu i azuriranje podataka
                const dataBaseURL = `https://ng-course-3f5f5-default-rtdb.firebaseio.com/contacts/${id}.json`;
                this.http.put(dataBaseURL, formValues)
                    .subscribe(
                        responseData => {
                            this._snackBar.open('Data has been successfully edited.', '', { duration: 2000 });
                            this.closeDialog();
                            setTimeout(() => {
                                location.reload();
                            }, 2000);
                        },
                        error => {
                            this._snackBar.open('Error editing data.', '', { duration: 2000 });
                        }
                    );
            } else {
                //* Korisnik nije autentificiran
                this._snackBar.open('User is not authenticated.', '', { duration: 2000 });
            }
        }
    }

    createUniqueID() {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 5);

        let id = timestamp + randomString;

        return id;
    };

    closeDialog() {
        this.dialogRef.close();
    }

    //* Potvrdni dialog 
    closeNewContactDialog(data: null, text: {}, action: string) {
        //* Prikazivanje iskljucivo ako je forma dirty
        console.log('isEditMode', this.isEditMode);
        console.log('isViewOnly', this.isViewOnly);
        
        const isFormDirty = this.PIFormGroup.dirty || this.LIFormGroup.dirty || this.CIFormGroup.dirty;

        if (isFormDirty && ((this.isEditMode && this.isViewOnly) || (!this.isEditMode && !this.isViewOnly))) {
            this.dialogSevice.closeNewContactDialog(data, text, action);
        } else {
            this.closeDialog();
        }
    }

    //* Limitator 
    limitInputToCharacters(event: any, limit: number) {
        const inputValue = event.target.value;

        if (inputValue.length > limit) {
            event.target.value = inputValue.slice(0, limit);
        }
    }

}
