import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { NgIf, NgStyle } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';

import { SnackbarService } from '../../services/snackbar.service';
import { DateFormate } from 'src/app/shared/dateFormat.service';
import { IContact } from '../../models/contact.interface';
import { ConfirmDialogComponent } from 'src/app/confirm-dialog/confirm-dialog.component';

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
        NgIf,
        NgStyle,
        MatDialogModule
    ],
})
export class NewContactDialogComponent {
    PIFormGroup!: FormGroup;
    LIFormGroup!: FormGroup;
    CIFormGroup!: FormGroup;

    isViewOnly: boolean = false;
    isEditMode: boolean = false;
    dataInForm: IContact | null = null;
    maxDate: Date = new Date();

    userIdToken: string = '';

    constructor(@Inject(MAT_DIALOG_DATA) public data: any,
        private _formBuilder: FormBuilder,
        private http: HttpClient,
        private dialogRef: MatDialogRef<NewContactDialogComponent>,
        private snackbarService: SnackbarService,
        private dateFormatService: DateFormate,
        private dialog: MatDialog,
        private router: Router
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

        if (data) {
            //* ViewOnly/Edit contact
            // Auto filling the form
            this.isViewOnly = true;
            this.dataInForm = data;
            if (data.edit) {
                this.isEditMode = true;
            }

            const formatedDate = this.dateFormatService.formatDate(data.dateOfBirth);

            this.PIFormGroup = this._formBuilder.group({
                name: [{ value: this.dataInForm!.name, disabled: this.isViewOnly && !this.isEditMode }, Validators.required],
                surname: [{ value: this.dataInForm!.surname, disabled: this.isViewOnly && !this.isEditMode }, Validators.required],
                dateOfBirth: [{ value: formatedDate, disabled: this.isViewOnly && !this.isEditMode }, Validators.required],
            });

            this.LIFormGroup = this._formBuilder.group({
                street: [{ value: this.dataInForm!.street, disabled: this.isViewOnly && !this.isEditMode }, Validators.required],
                postalCode: [{ value: this.dataInForm!.postalCode, disabled: this.isViewOnly && !this.isEditMode }, Validators.required],
            });

            this.CIFormGroup = this._formBuilder.group({
                phonePrefix: [{ value: this.dataInForm!.phonePrefix, disabled: this.isViewOnly && !this.isEditMode }, Validators.required],
                phoneNumber: [{ value: this.dataInForm!.phoneNumber, disabled: this.isViewOnly && !this.isEditMode }, Validators.required],
            });
        } else {
            //* New contact 
            this.isViewOnly = false;
            this.dataInForm = null;
        }
    }

    onSubmit(): void{
        if (!this.isEditMode) {
            //! First Save

            //* Sve form grupe u jedan objekt sa random ID-om 
            const formValues: IContact = Object.assign({}, this.PIFormGroup.value, this.LIFormGroup.value, this.CIFormGroup.value);

            //* Dohvacanje usera iz local storage-a
            let user = localStorage.getItem('userData');

            //* Provjera da li je user autentificirane
            if (user) {
                //* Dohvacanje useruid-a
                const userObj = JSON.parse(user);
                const useruid: string = userObj.localId;

                this.userIdToken = userObj.idToken;

                //* Kreiranje finalnog payloada
                const dataSaved: IContact = Object.assign({}, { useruid }, formValues);

                //* Kreiranje URL-a za spremanje podataka u bazu i spremanje podataka u bazu
                const dataBaseURL: string = `https://ng-course-3f5f5-default-rtdb.firebaseio.com/contacts.json?auth=${this.userIdToken}`;
                this.http.post(dataBaseURL, dataSaved)
                    .subscribe({
                        next: () => {
                            this.closeDialog();
                            this.router.navigate(['/header'], { queryParams: { r: true, type: 'new' } });
                        },
                        error: () => {
                            this.snackbarService.show('Pogreška pri spremanju.', 'Zatvori', 'error');
                        }
                    });

            } else {
                //* Korisnih nije autentificiran
                this.snackbarService.show('Korisnik nije autentificiran.', 'Zatvori', 'error');
            }
        } else {
            //! Edit
            //* Dodavanje ID-a iz Firebase-a
            const id = this.dataInForm!.id;

            //* Dohvacanje korisnika iz local storage-a
            const user = localStorage.getItem('userData');

            //* Provjera da li je korisnik autentificiran
            if (user) {
                const userObj = JSON.parse(user);

                const useruid: string = userObj.localId;

                this.userIdToken = userObj.idToken;

                //* Kreiranje finalnog payloada
                const formValues = Object.assign({}, { useruid }, this.PIFormGroup.value, this.LIFormGroup.value, this.CIFormGroup.value);

                //* Brisanje pomocnih polja
                delete formValues.edit;
                delete formValues.id;
                delete formValues.number;

                //* kreiranje URL-a za spremanje podataka u bazu i azuriranje podataka
                const dataBaseURL: string = `https://ng-course-3f5f5-default-rtdb.firebaseio.com/contacts/${id}.json?auth=${this.userIdToken}`;
                this.http.put(dataBaseURL, formValues)
                    .subscribe({
                        next: () => {
                            this.closeDialog();
                            this.router.navigate(['/header'], { queryParams: { r: true, type: 'edit' } });
                        },
                        error: (error) => {
                            this.snackbarService.show('Pogreška pri uređivanju.', 'Zatvori', 'error');
                        }
                    });

            } else {
                //* Korisnik nije autentificiran
                this.snackbarService.show('Korisnik nije autentificiran.', 'Zatvori', 'error');
            }
        }
    }

    closeDialog(): void {
        this.dialogRef.close();
    }

    async openCloseDialogAsync(): Promise<void> {
        const isFormDirty: boolean = this.PIFormGroup.dirty || this.LIFormGroup.dirty || this.CIFormGroup.dirty;

        //* Prikazivanje forme iskljucivo ako je forma dirty
        if (isFormDirty && ((this.isEditMode && this.isViewOnly) || (!this.isEditMode && !this.isViewOnly))) {
            const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                width: '350px',
                data: {
                    title: 'Zatvaranje forme',
                    message: 'Jeste li sigurni da želite zatvoriti formu za novi kontakt?',
                    action: 'Zatvori'
                },
            });

            try {
                const result = await lastValueFrom(dialogRef.afterClosed());
                if (result) {
                    this.closeDialog();
                }
            } catch (error) {
                console.error('Greška pri otvaranju dialoga: ', error);
            }
        } else {
            this.closeDialog();
        }
    }


    //* Limitator 
    limitInputToCharacters(event: any, limit: number): void {
        const inputValue: string = event.target.value;

        if (inputValue.length > limit) {
            event.target.value = inputValue.slice(0, limit);
        }
    }

}
