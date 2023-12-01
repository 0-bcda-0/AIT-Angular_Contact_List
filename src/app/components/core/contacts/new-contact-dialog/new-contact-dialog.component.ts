import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
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
import { DateFormate } from 'src/app/shared/dateFormat.service';
import { IContact } from '../../../../models/contact.interface';
import { ConfirmDialogComponent } from 'src/app/confirm-dialog/confirm-dialog.component';
import { environment } from 'src/environments/environment.firebase';
import { mySnackbarService } from 'src/app/services/my-snackbar.service';
import { MatIconModule } from '@angular/material/icon';

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
        MatDialogModule,
        MatIconModule,
    ],
})
export class NewContactDialogComponent {
    _formBuilder = inject(FormBuilder);
    http = inject(HttpClient);
    dialogRef = inject(MatDialogRef);
    dateFormatService = inject(DateFormate);
    dialog = inject(MatDialog);
    router = inject(Router);
    mySnackbarService = inject(mySnackbarService);

    PIFormGroup!: FormGroup;
    LIFormGroup!: FormGroup;
    CIFormGroup!: FormGroup;

    isViewOnly: boolean = false;
    isEditMode: boolean = false;
    dataInForm: IContact | null = null;
    maxDate: Date = new Date();
    userIdToken: string = '';

    constructor(@Inject(MAT_DIALOG_DATA) public data: IContact) {
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
        if (this.data) {
            //* ViewOnly/Edit contact
            // Auto filling the form
            this.isViewOnly = true;
            this.dataInForm = this.data;
            if (this.data.edit) {
                this.isEditMode = true;
                delete this.data.edit;
            }
            const formatedDate: string = this.dateFormatService.formatDate(this.data.dateOfBirth);
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

    async onSubmitAsync(): Promise<void> {
        let user = localStorage.getItem('userData');
        if (!this.isEditMode) {
            //! First Save
            //* Sve form grupe u jedan objekt sa random ID-om 
            const formValues: IContact = Object.assign({}, this.PIFormGroup.value, this.LIFormGroup.value, this.CIFormGroup.value);
            //* Provjera da li je user autentificirane
            if (user) {
                //* Dohvacanje useruid-a
                const userObj = JSON.parse(user);
                const useruid: string = userObj.localId;
                this.userIdToken = userObj.idToken;
                //* Kreiranje finalnog payloada
                const dataSaved: IContact = Object.assign({}, { useruid }, formValues);
                //* Kreiranje URL-a za spremanje podataka u bazu i spremanje podataka u bazu
                const dataBaseURL: string = `${environment.firebaseConfig.databaseURL}/contacts.json`;
                const http = await lastValueFrom(this.http.post(dataBaseURL, dataSaved));
                if (http) {
                    this.mySnackbarService.openSnackBar('Uspješno spremanje kontakta.', 'Zatvori', 'success');
                    this.dialogRef.close(true);
                } else {
                    this.mySnackbarService.openSnackBar('Pogreška pri spremanju.', 'Zatvori', 'error');
                }
            } else {
                //* Korisnih nije autentificiran
                this.mySnackbarService.openSnackBar('Korisnik nije autentificiran.', 'Zatvori', 'info');
            }
        } else {
            //! Edit
            //* Dodavanje ID-a iz Firebase-a
            const id = this.dataInForm!.id;
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
                const dataBaseURL: string = `${environment.firebaseConfig.databaseURL}/contacts/${id}.json`;
                const http = await lastValueFrom(this.http.put(dataBaseURL, formValues));
                if (http) {
                    this.mySnackbarService.openSnackBar('Uspješno uređivanje kontakta.', 'Zatvori', 'success');
                    this.dialogRef.close(true);
                } else {
                    this.mySnackbarService.openSnackBar('Pogreška pri uređivanju.', 'Zatvori', 'error');
                }
            } else {
                //* Korisnik nije autentificiran
                this.mySnackbarService.openSnackBar('Korisnik nije autentificiran.', 'Zatvori', 'info');
            }
        }
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
                    this.dialogRef.close(false);
                }
            } catch (error) {
                console.error('Greška pri otvaranju dialoga: ', error);
            }
        } else {
            this.dialogRef.close(false);
        }
    }

    //* Limitator 
    limitInputToCharacters(event: any, limit: number): void {
        const inputValue: string = event.target.value;
        if (inputValue.length > limit) {
            event.target.value = inputValue.slice(0, limit);
        }
    }

    get name() { return this.PIFormGroup.get('name'); }
    get surname() { return this.PIFormGroup.get('surname'); }
    get dateOfBirth() { return this.PIFormGroup.get('dateOfBirth'); }
    get street() { return this.LIFormGroup.get('street'); }
    get postalCode() { return this.LIFormGroup.get('postalCode'); }
    get phonePrefix() { return this.CIFormGroup.get('phonePrefix'); }
    get phoneNumber() { return this.CIFormGroup.get('phoneNumber'); }
}
