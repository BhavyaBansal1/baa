import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BalanceService } from '../balance-service';
import { Holdings } from '../holdings';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trade',
  imports: [FormsModule, CommonModule],
  templateUrl: './trade.html',
  styleUrl: './trade.css',
})
export class Trade implements OnInit {

  price: number = 90;
  quantity: number = 1;
  stockName: string = '';
  msg: string = '';
  Ordervalue: number = 0;
  Transactions: any[] = [];
  currenttime: any;
  holdingtype: string = 'stock';

  constructor(
    public balanceService: BalanceService,
    public holdingservice: Holdings
  ) { }

  ngOnInit() {
    this.loadBalance();
    this.loadTransactions();

    let change = (Math.random() * 10 - 5);
    this.price = Math.max(1, Math.round(this.price + change));
  }

  loadBalance() {
    this.balanceService.getBalance().subscribe();
  }

  loadTransactions() {
    this.holdingservice.getTransactions().subscribe({
      next: (data) => {
        this.Transactions = data;
      },
      error: () => {
        this.Transactions = [];
      }
    });
  }

  calculateOrderValue() {
    this.Ordervalue = this.price * this.quantity;
  }

  buy() {
    if (!this.stockName) {
      this.msg = "Enter stock name";
      return;
    }

    if (this.quantity <= 0) {
      this.msg = "Quantity must be greater than zero";
      return;
    }

    if (this.price <= 0) {
      this.msg = "Price must be greater than zero";
      return;
    }

    this.holdingservice.buy(
      this.stockName,
      this.quantity,
      this.holdingtype,
      this.price
    ).subscribe({
      next: () => {
        this.msg = "Stocks bought successfully";
        this.loadBalance();
        this.loadTransactions();
      },
      error: (err) => {
        this.msg = err.error || "Error while buying";
      }
    });
  }

  sell() {
    if (!this.stockName) {
      this.msg = "Enter stock name";
      return;
    }

    if (this.quantity <= 0) {
      this.msg = "Quantity must be greater than zero";
      return;
    }

    if (this.price <= 0) {
      this.msg = "Price must be greater than zero";
      return;
    }

    this.holdingservice.sell(
      this.stockName,
      this.quantity,
      this.holdingtype,
      this.price
    ).subscribe({
      next: () => {
        this.msg = "Stocks sold successfully";
        this.loadBalance();
        this.loadTransactions();
      },
      error: (err) => {
        this.msg = err.error || "Error while selling";
      }
    });
  }
}