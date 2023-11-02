import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { lastValueFrom, take } from 'rxjs';
import { NgIf, NgStyle } from '@angular/common';

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
import { DialogService } from '../../../services/dialog.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { ActivatedRoute, Router } from '@angular/router';


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
        NgIf
    ],
})
export class ContactsComponent implements AfterViewInit {

    filterForm: FormGroup;

    myDataArray: Array<IContact> = [];

    isLoading: boolean = true;

    userIdToken: string = '';

    constructor(private dialogSevice: DialogService,
        private http: HttpClient,
        private formBuilder: FormBuilder,
        private dateFormatService: DateFormate,
        public dialog: MatDialog,
        private snackbarService: SnackbarService,
        private route: ActivatedRoute,
        private router: Router,
    ) {

        //* Inicializacija sa praznim stringom
        this.filterForm = this.formBuilder.group({
            search: [''],
        });

        this.getData();
    }

    getData(): void {
        //* Dohvacanje uid-a iz local storage-a
        const user: string | null= localStorage.getItem('userData');

        //* Provjera da li je user autentificiran
        if (user) {
            //* Dohvacanje useruid-a
            const userObj = JSON.parse(user);
            const useruid: string = userObj.localId;

            this.userIdToken = userObj.idToken;


            //* Dohvacanje podataka iz baze sa istim useruid-om
            const dataBaseURL: string = `https://ng-course-3f5f5-default-rtdb.firebaseio.com/contacts.json?auth=${this.userIdToken}`;
            this.http.get(dataBaseURL).subscribe((data: any) => {
                if (data !== null) {
                    //* Dohvacanje ID-a iz Firebase-a, spremanje u array
                    // const contacts: any = Object.values(data);
                    const contacts: Array<IContact> = Object.keys(data).map(id => ({ id, ...data[id] }));

                    //* Filtracija podataka po useruid-u
                    this.myDataArray = contacts.filter((contact: any) => contact.useruid === useruid);

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
                    //* Ako nema podataka u bazi, isprazni array
                    this.myDataArray = [];
                }
            }
            );
        } else {
            //* Korisnik nije autentificiran 
            this.snackbarService.show('Korisnik nije autentificiran', 'Zatvorite', 'error');
        }
    }

    refreshData(type: string): void{
        this.getData();
        this.displaySnackbar(type);
    }

    displaySnackbar(type: string): void {
        if (type === 'new') {
            this.snackbarService.show('Uspješno spremanje kontakta', 'Zatvori', 'success');
        } else if (type === 'edit') {
            this.snackbarService.show('Uspješno uređivanje kontakta', 'Zatvori', 'success');
        } else if (type === 'delete') {
            this.snackbarService.show('Uspješno brisanje kontakta', 'Zatvori', 'success');
        }
    }

    //* Za Angular Material Table
    dataSource = new MatTableDataSource(this.myDataArray);
    columnsToDisplay: Array<string> = ['id', 'name', 'surname', 'dateOfBirth', 'street', 'postalCode', 'phonePrefix', 'phoneNumber', 'actions'];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    ngAfterViewInit(): void{
        //* Ako u URL imamo r=true, onda refreshamo podatke i micemo parametre, ako ne onda samo standardno prikazujemo podatke
        this.route.queryParams.subscribe(params => {
            if (params['r'] === 'true') {
                //* Dohvacanje podataka isto kao i u constructoru sa dodatnim snackbarom
                this.refreshData(params['type']);
                //* Micemo parametre
                this.router.navigate(['/header'], { queryParams: {} }).then(() => {
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

    //? Vise se ne koristi 
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
            data: {
                title: 'Brisanje forme',
                message: 'Jeste li sigurni da želite izbrisati kontakt?',
                action: 'Obriši'
            },
        });

        try {
            const result = await lastValueFrom(dialogRef.afterClosed());
            if (result) {
                this.asyncDeleteContact(element);
            }
        } catch (error) {
            this.snackbarService.show('Greška pri otvaranju dialoga', 'Zatvori', 'error');
        }
    }

    async asyncDeleteContact(element: IContact): Promise<void> {
        try {
            const id: string = element.id!;

            const dataBaseURL: string = `https://ng-course-3f5f5-default-rtdb.firebaseio.com/contacts/${id}.json?auth=${this.userIdToken}`;
            await lastValueFrom(this.http.delete(dataBaseURL));
            this.snackbarService.show('Data has been successfully deleted from the database.', 'Zatvori', 'success');
            this.router.navigate(['/header'], { queryParams: { r: true, type: 'delete' } });
        }
        catch (error) {
            this.snackbarService.show('Greška pri brisanju kontakta', 'Zatvori', 'error');
        }
    }
}
