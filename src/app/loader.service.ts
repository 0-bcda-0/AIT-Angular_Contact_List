import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private counter = 0;
  private isLoadingSource$ = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSource$.asObservable();

  showLoader(): void {
    setTimeout(() => {
      this.counter=+1
      this.isLoadingSource$.next(true);
    }, 0);
  }

  hideLoader(): void {
    setTimeout(() => {
      this.counter-=1
      if(this.counter< 1)
      this.isLoadingSource$.next(false);
    }, 0);
  }
}
