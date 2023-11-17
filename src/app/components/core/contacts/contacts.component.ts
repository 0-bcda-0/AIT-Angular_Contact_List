// Angular
import { AfterViewInit, Component, ViewChild, inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { NgClass, NgIf, NgStyle } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// Angular Material
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

// My Imports
import { ConfirmDialogComponent } from 'src/app/confirm-dialog/confirm-dialog.component';
import { IContact } from '../../../models/contact.interface';
import { DateFormate } from 'src/app/shared/dateFormat.service';
import { DialogService } from '../../../services/dialog.service';
import { environment } from 'src/environments/environment.firebase';
import { MySnackbarService } from 'src/app/services/my-snackbar.service';

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
        NgIf,
        NgClass
    ]
})
export class ContactsComponent implements AfterViewInit, OnInit {
    dialogSevice = inject(DialogService);
    http = inject(HttpClient);
    formBuilder = inject(FormBuilder);
    dateFormatService = inject(DateFormate);
    dialog = inject(MatDialog);
    MySnackbarService = inject(MySnackbarService);
    route = inject(ActivatedRoute);
    router = inject(Router);

    filterForm!: FormGroup;
    myDataArray: IContact[] = [];
    isLoading: boolean = true;
    userIdToken: string = '';

    //* Za Angular Material Table
    dataSource = new MatTableDataSource(this.myDataArray);
    columnsToDisplay: string[] = ['id', 'name', 'surname', 'dateOfBirth', 'street', 'postalCode', 'phonePrefix', 'phoneNumber', 'actions'];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    ngOnInit() {
        this.filterForm = this.formBuilder.group({
            search: [''],
        });
        this.getDataAsync();
    }

    async getDataAsync(): Promise<void> {
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

                //* Za Angular Material Table
                this.dataSource = new MatTableDataSource(this.myDataArray);

                this.isLoading = false;
            } else {
                this.myDataArray = [];
            }
        } else {
            this.MySnackbarService.openSnackBar('Korisnik nije autentificiran', 'Zatvorite', 'error');
        }
    }

    async refreshDataAsync(type: string): Promise<void> {
        await this.getDataAsync();
        this.displaySnackbar(type);
    }

    displaySnackbar(type: string): void {
        if (type === 'new') {
            this.MySnackbarService.openSnackBar('Uspješno spremanje kontakta', 'Zatvori', 'success');
        } else if (type === 'edit') {
            this.MySnackbarService.openSnackBar('Uspješno uređivanje kontakta', 'Zatvori', 'success');
        } else if (type === 'delete') {
            this.MySnackbarService.openSnackBar('Uspješno brisanje kontakta', 'Zatvori', 'success');
        }
    }

    ngAfterViewInit(): void {
        //* Ako u URL imamo r=true, onda refreshamo podatke i micemo parametre, ako ne onda samo standardno prikazujemo podatke
        this.route.queryParams.subscribe(params => {
            if (params['r'] === 'true') {
                //* Dohvacanje podataka isto kao i u constructoru sa dodatnim snackbarom
                this.refreshDataAsync(params['type']);
                //* Micemo parametre
                this.router.navigate(['/core'], { queryParams: {} }).then(() => {
                    setTimeout(() => {
                        this.dataSource.paginator = this.paginator;
                        this.dataSource.sort = this.sort;
                    }, 1000);
                });
            } else {
                setTimeout(
                    () => {
                        this.dataSource.paginator = this.paginator;
                        this.dataSource.sort = this.sort;
                    }
                    , 1000);
            }
        });
    }

    openDialog(): void {
        this.dialogSevice.openDialog();
    }

    //* ViewOnly dialog
    viewContactDialog(data: IContact): void {
        this.dialogSevice.viewContactDialog(data);
    }

    //* Edit dialog
    editContactDialog(data: IContact): void {
        this.dialogSevice.editContactDialog(data);
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
            this.MySnackbarService.openSnackBar('Greška pri otvaranju dialoga', 'Zatvori', 'error');
        }
    }

    async DeleteContactAsync(element: IContact): Promise<void> {
        try {
            const id: string = element.id!;
            const dataBaseURL: string = `${environment.firebaseConfig.databaseURL}/contacts/${id}.json`;

            await lastValueFrom(this.http.delete(dataBaseURL));

            this.MySnackbarService.openSnackBar('Data has been successfully deleted from the database.', 'Zatvori', 'success');
            this.router.navigate(['/core'], { queryParams: { r: true, type: 'delete' } });
        } catch (error) {
            this.MySnackbarService.openSnackBar('Greška pri brisanju kontakta', 'Zatvori', 'error');
        }
    }

}
