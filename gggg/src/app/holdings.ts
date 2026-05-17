import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Holdings {

  private apiUrl = 'http://localhost:5000/api';

  list: any[] = [];

  constructor(private http: HttpClient) {}

  resetPortfolio() {
    return this.http.post<any>(`${this.apiUrl}/portfolio/reset`, {}).pipe(
      tap((data) => {
        this.list = data.holdings || data.Holdings || [];
      })
    );
  }

  get_all_Holdings() {
    return this.http.get<any[]>(`${this.apiUrl}/holdings`).pipe(
      tap((data) => {
        this.list = data || [];
      })
    );
  }

  updatePrices() {
    return this.http.post<any[]>(`${this.apiUrl}/holdings/update-prices`, {}).pipe(
      tap((data) => {
        this.list = data || [];
      })
    );
  }

  buy(stockName: string, quantity: number, type: string, price: number) {
    return this.http.post<any>(`${this.apiUrl}/trade/buy`, {
      stockName,
      quantity,
      type,
      price
    }).pipe(
      tap((data) => {
        this.list = data.holdings || data.Holdings || [];
      })
    );
  }

  sell(stockName: string, quantity: number, type: string, price: number) {
    return this.http.post<any>(`${this.apiUrl}/trade/sell`, {
      stockName,
      quantity,
      type,
      price
    }).pipe(
      tap((data) => {
        this.list = data.holdings || data.Holdings || [];
      })
    );
  }

  getTransactions() {
    return this.http.get<any[]>(`${this.apiUrl}/transactions`);
  }

  getQuantity(stockName: string): number {
    if (!stockName) {
      return 0;
    }

    const stock = this.list.find(s =>
      s.stockName?.toLowerCase() === stockName.toLowerCase()
    );

    return stock ? stock.quantity : 0;  
  }
}