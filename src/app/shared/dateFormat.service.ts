import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DateFormate {
    formatDate(date: string): string {
        //* Provjera dal je date u formatu YYYY-MM-DDT00:00:00.000Z
        if (date.includes('T')) {
            //* Prebacaj iz YYYY-MM-DDT00:00:00.000Z u DD/MM/YYYY 
            const dateArray = date.split('-');
            const year = dateArray[0];
            const month = dateArray[1];
            const day = dateArray[2].split('T')[0];

            return `${day}/${month}/${year}`;
        } else {
            //* Prebacaj iz DD/MM/YYYY u YYYY-MM-DDT00:00:00.000Z
            const dateArray = date.split('/');
            const day = dateArray[0];
            const month = dateArray[1];
            const year = dateArray[2];

            return `${year}-${month}-${day}T00:00:00.000Z`;
        }
    }
}