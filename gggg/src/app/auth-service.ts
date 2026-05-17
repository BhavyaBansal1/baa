import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

import { Holdings } from './holdings';
import { BalanceService } from './balance-service';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'http://localhost:5000/api/auth';

  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(
    public rou: Router,
    private http: HttpClient,
    private holdings: Holdings,
    private balanceService: BalanceService
  ) { }

  signup(email: string, password: string, role: any) {
    return this.http.post<any>(`${this.apiUrl}/signup`, {
      email,
      password,
      role
    });
  }

  login(email: string, password: string, role: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, {
      email,
      password,
      role
    }).pipe(
      tap((res) => {
        this.userSubject.next(res.user || res.User);
      })
    );
  }

  get_user() {
    return this.userSubject.value;
  }

  isLoggedIn(): boolean {
    return this.userSubject.value !== null;
  }

  getrole() {
    const user = this.get_user();
    return user ? user.role || user.Role : null;
  }

  logout() {
    this.holdings.resetPortfolio().subscribe({
      next: () => {
        this.userSubject.next(null);
        this.holdings.list = [];
        this.balanceService.balanceamount = 10000;
        this.rou.navigate(['/']);
      },
      error: () => {
        this.userSubject.next(null);
        this.holdings.list = [];
        this.balanceService.balanceamount = 10000;
        this.rou.navigate(['/']);
      }
    });
  }
}