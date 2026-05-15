import { Injectable, signal, effect, computed } from '@angular/core';
import { Couple, DataService } from './data.service';
import { AuthService } from './auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { switchMap, of, filter, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CoupleStoreService {
  currentCouple = signal<Couple | null | undefined>(undefined);
  
  constructor(private auth: AuthService, private dataService: DataService) {
    toObservable(this.auth.user).pipe(
      filter(user => user !== undefined),
      switchMap(user => {
        if (!user) return of(null);
        return this.dataService.getCouplesByOwner(user.uid);
      })
    ).subscribe(couples => {
      if (couples === null) {
        this.currentCouple.set(null);
      } else if (couples && couples.length > 0) {
        this.currentCouple.set(couples[0]);
      } else {
        // Automatically create a draft couple if none exists for this user
        const newCoupleId = crypto.randomUUID();
        const user = this.auth.user();
        if (user) {
          const draft: Partial<Couple> = {
            ownerId: user.uid,
            names: 'Noivos',
            message: 'Estamos muito felizes em convidar você para o nosso casamento!',
            themeConfig: {
              primaryColor: '#ec4899', // pink-500
              font: 'serif'
            }
          };
          this.dataService.createCouple(newCoupleId, draft);
        }
      }
    });
  }
}
