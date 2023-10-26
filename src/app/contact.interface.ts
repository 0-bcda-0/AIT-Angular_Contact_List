export interface Contact {
    id?: string;
    number?: string;
    name: string;
    surname: string;
    dateOfBirth: string;
    street: string;
    postalCode: number;
    phonePrefix: number;
    phoneNumber: number;
    uniqueID?: string;
}