import { Component, ViewChild, inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { NgClass, NgStyle } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ConfirmDialogComponent } from 'src/app/confirm-dialog/confirm-dialog.component';
import { IContact } from '../../../models/contact.interface';
import { DateFormate } from 'src/app/shared/dateFormat.service';
import { environment } from 'src/environments/environment.firebase';
import { mySnackbarService } from 'src/app/services/my-snackbar.service';
import { NewContactDialogComponent } from './new-contact-dialog/new-contact-dialog.component';
import {MatMenuModule} from '@angular/material/menu';

@Component({
    selector: 'app-contacts',
    templateUrl: './contacts.component.html',
    styleUrls: ['./contacts.component.scss'],
    standalone: true,
    imports: [
        MatCardModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatPaginatorModule,
        MatSortModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatInputModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        NgStyle,
        NgClass,
        MatMenuModule,
    ]
})
export class ContactsComponent implements OnInit {
    http = inject(HttpClient);
    formBuilder = inject(FormBuilder);
    dateFormatService = inject(DateFormate);
    dialog = inject(MatDialog);
    mySnackbarService = inject(mySnackbarService);
    route = inject(ActivatedRoute);
    router = inject(Router);

    filterForm!: FormGroup;
    myDataArray: IContact[] = [];
    userIdToken: string = '';

    //* Za Angular Material Table
    dataSource = new MatTableDataSource(this.myDataArray);
    columnsToDisplay: string[] = ['id', 'name', 'surname', 'dateOfBirth', 'street', 'postalCode', 'phonePrefix', 'phoneNumber', 'actions'];

    @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) { this.dataSource.paginator = paginator; }
    @ViewChild(MatSort) set sort(sort: MatSort) { this.dataSource.sort = sort; }

    ngOnInit() {
        this.filterForm = this.formBuilder.group({ search: [''] });
        this.getDataAsync();
    }

    private async getDataAsync(): Promise<void> {
        const user: string | null = localStorage.getItem('userData');
        if (user) {
            const userObj = JSON.parse(user);
            const useruid: string = userObj.localId;
            this.userIdToken = userObj.idToken;
            const dataBaseURL: string = `${environment.firebaseConfig.databaseURL}/contacts.json`;
            const data: any = await lastValueFrom(this.http.get(dataBaseURL));
            if (data !== null) {
                //* Dohvacanje ID-a iz Firebase-a, spremanje u array
                const contacts: IContact[] = Object.keys(data).map(id => ({ id, ...data[id] }));
                //* Filtracija podataka po useruid-u
                this.myDataArray = contacts.filter((contact: IContact) => contact.useruid === useruid);
                //* Dodavanje broja (1, 2, 3, ...) zbog prikaza u tablici
                this.myDataArray.forEach((contact: IContact, index: number) => {
                    contact.number = (index + 1).toString();
                });
                //* Formatiranje datuma
                this.myDataArray.forEach((contact: IContact) => {
                    contact.dateOfBirth = this.dateFormatService.formatDate(contact.dateOfBirth);
                });
                this.dataSource.data = this.myDataArray;
            } else {
                this.myDataArray = [];
            }
        } else {
            this.mySnackbarService.openSnackBar('Korisnik nije autentificiran', 'Zatvorite', 'error');
        }
    }

    // Otvori dialog za dodavanje novog kontakta (NewContactDialogComponent) 
    async openNewContactDialog(data: IContact | null, edit?: boolean): Promise<void> {
        //* Ako je edit onda komponenta autokomplita unosna polja 
        if(edit){data!.edit = edit;}

        // Bilo to edit/view/new, saljemo podatke (ili null) u dialog 
        const dialog = this.dialog.open(NewContactDialogComponent, {
            data: data
        });

        try{
            const result = await lastValueFrom(dialog.afterClosed());
            // Nakon zatvaranja dialoga, dohvacamo nove podatke ako je editirano ili dodano
            if(result){
                await this.getDataAsync();
            }
        } catch(error){
            this.mySnackbarService.openSnackBar('Došlo je do greške prilikom otvaranja dialoga', 'Zatvori', 'error');
        }
    }

    applyFilter(): void {
        const filterValue: string = this.filterForm.get('search')?.value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    async openDeleteDialogAsync(element: IContact): Promise<void> {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '350px',
            data: { title: 'Brisanje forme', message: 'Jeste li sigurni da želite izbrisati kontakt?', action: 'Obriši' },
        });

        try {
            const result = await lastValueFrom(dialogRef.afterClosed());
            if (result) {
                this.DeleteContactAsync(element);
            }
        } catch (error) {
            this.mySnackbarService.openSnackBar('Došlo je do greške prilikom otvaranja dialoga', 'Zatvori', 'error');
        }
    }

    private async DeleteContactAsync(element: IContact): Promise<void> {
        try {
            const dataBaseURL: string = `${environment.firebaseConfig.databaseURL}/contacts/${element.id}.json`;
            await lastValueFrom(this.http.delete(dataBaseURL));
            this.mySnackbarService.openSnackBar('Kontakt uspješno izbrisan.', 'Zatvori', 'success');
            await this.getDataAsync();
        } catch (error) {
            this.mySnackbarService.openSnackBar('Došlo je do greške prilikom brisanja kontakta. ', 'Zatvori', 'error');
        }
    }

}
