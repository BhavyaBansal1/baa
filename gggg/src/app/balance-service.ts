import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BalanceService {

  private apiUrl = 'http://localhost:5000/api';

  balanceamount: number = 10000;

  constructor(private http: HttpClient) {}

  getBalance() {
    return this.http.get<number>(`${this.apiUrl}/balance`).pipe(
      tap((balance) => {
        this.balanceamount = Number(balance);
      })
    );
  }

  refreshBalance() {
    this.getBalance().subscribe({
      next: () => {},
      error: () => {
        this.balanceamount = 10000;
      }
    });
  }
}