import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { DialogService } from '../dialog.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormControl, FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Contact } from '../contact.interface';

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
        HttpClientModule,
        MatSnackBarModule,
    ],
})
export class ContactsComponent implements AfterViewInit {

    searchFormControl = new FormControl();

    myDataArray: Array<Contact> = [];

    constructor(private dialogSevice: DialogService,
        private http: HttpClient,
        private _snackBar: MatSnackBar) {

        //* Dohvacanje uid-a iz local storage-a
        const user = localStorage.getItem('userData');

        //* Provjera da li je user autentificiran
        if (user) {
            //* Dohvacanje useruid-a
            const userObj = JSON.parse(user);
            const useruid = userObj.localId;

            //* Dohvacanje podataka iz baze sa istim useruid-om
            const dataBaseURL = `https://ng-course-3f5f5-default-rtdb.firebaseio.com/contacts.json`;
            this.http.get(dataBaseURL).subscribe((data: any) => {
                if (data !== null) {
                    //* Dohvacanje ID-a iz Firebase-a, spremanje u array
                    // const contacts: any = Object.values(data);
                    const contacts = Object.keys(data).map(id => ({ id, ...data[id] }));

                    //* Filtracija podataka po useruid-u
                    this.myDataArray = contacts.filter((contact: any) => contact.useruid === useruid);

                    //* Dodavanje broja (1, 2, 3, ...) zbog prikaza u tablici
                    this.myDataArray.forEach((contact, index) => {
                        contact.number = (index + 1).toString();
                    });

                    //* Formatiranje datuma
                    this.myDataArray.forEach((contact) => {
                        contact.dateOfBirth = this.formatDate(contact.dateOfBirth);
                    });

                    //* Za Angular Material Table
                    this.dataSource = new MatTableDataSource(this.myDataArray);

                } else {
                    //* Ako nema podataka u bazi, isprazni array
                    this.myDataArray = [];
                }
            }
            );
        } else {
            //* Korisnik nije autentificiran 
            this._snackBar.open('Korisnik nije autentificiran', '', { duration: 2000 });
        }
    }

    //* Za Angular Material Table
    dataSource = new MatTableDataSource(this.myDataArray);
    columnsToDisplay: string[] = ['id', 'name', 'surname', 'dateOfBirth', 'street', 'postalCode', 'phonePrefix', 'phoneNumber', 'actions'];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    ngAfterViewInit() {
        // this.dataSource.paginator = this.paginator;
        // this.dataSource.sort = this.sort;
        //! Mozda linija koja rjesi problem
        // setTimeout(() => this.dataSource.paginator = this.paginator);
        setTimeout(
            () => {
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            }
            , 1000);
    }

    //? Vise se ne koristi 
    openDialog(): void {
        this.dialogSevice.openDialog();
    }

    //* ViewOnly dialog
    viewContactDialog(data: Contact): void {
        this.dialogSevice.viewContactDialog(data);
    }

    //* Edit dialog
    editContactDialog(data: Contact): void {
        this.dialogSevice.editContactDialog(data);
    }

    //* Delete dialog potvrde
    deleteContactDialog(data: Contact, text: {}, action: string): void {
        this.dialogSevice.deleteContactDialog(data, text, action);
    }

    //! Zelim da se ovo vrati ovdje ali neznam kako iz confirm-dialog.component.ts poslati "naredbu" da se ovo izvrsi

    // deleteContact(contactSelected: Contact): void {
    //   //* Getting the data from the database
    //   const dataBaseURL = `https://ng-course-3f5f5-default-rtdb.firebaseio.com/contacts.json`;
    //   this.http.get(dataBaseURL).subscribe((data: any) => {
    //     //* Extracting ID from Firebase, storing it all in array
    //     const contacts = Object.keys(data).map(id => ({ id, ...data[id] }));

    //     //* Filter the data by uniqueID
    //     const contactToDelete: any = contacts.filter((contact: any) => contact.uniqueID === contactSelected.uniqueID);

    //     //* Extracting ID from the array
    //     const contactToDeleteID = contactToDelete[0].id;

    //     //* Constructing the URL and sending delete request to the database
    //     const contactToDeleteURL = `https://ng-course-3f5f5-default-rtdb.firebaseio.com/contacts/${contactToDeleteID}.json`;
    //     this.http.delete(contactToDeleteURL).subscribe((data: any) => {
    //       this._snackBar.open('Data has been successfully deleted from the database.','',{duration: 2000});
    //       setTimeout(() => {
    //         location.reload();
    //       }, 2000);
    //     }); 
    //   });
    // }

    formatDate(date: string): string {
        //* Provjera dal je date u formatu YYYY-MM-DDT00:00:00.000Z
        if (date.includes('T')) {
            const dateArray = date.split('-');
            const year = dateArray[0];
            const month = dateArray[1];
            const day = dateArray[2].split('T')[0];

            return `${day}/${month}/${year}`;
        }
        return date;
    }

    applyFilter() {
        const filterValue = this.searchFormControl.value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }
}
