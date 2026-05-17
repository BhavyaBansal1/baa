import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Holdings } from '../holdings';
import { BalanceService } from '../balance-service';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-summary',
  imports: [CommonModule],
  templateUrl: './sumary.html',
  styleUrl: './sumary.css'
})
export class summary {

  holdings: any[] = [];

  portfolioValue = 0;
  totalStocks = 0;
  totalFunds = 0;

  stockPercent = 0;
  fundPercent = 0;

  riskProfile = '';
  activity = '';
  date = new Date();

  constructor(
    private holdingService: Holdings,
    public balanceService: BalanceService,
public cd: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.loadData();

    setInterval(() => {
      this.loadData();
      this.date = new Date();
      this.cd.detectChanges();
    }, 1000);
  }

  loadData() {
  this.holdingService.get_all_Holdings().subscribe({
    next: (data) => {
      this.holdings = data;

      this.portfolioValue = 0;
      this.totalStocks = 0;
      this.totalFunds = 0;

      this.holdings.forEach(h => {
        this.portfolioValue += h.quantity * h.price;

        if (h.type?.toLowerCase() === 'stock') {
          this.totalStocks += h.quantity;
        } else {
          this.totalFunds += h.quantity;
        }
      });

      const total = this.totalStocks + this.totalFunds;

      this.stockPercent = total ? (this.totalStocks / total) * 100 : 0;
      this.fundPercent = total ? (this.totalFunds / total) * 100 : 0;

      const stockPct = total ? this.totalStocks / total : 0;

      if (stockPct >= 0.7) this.riskProfile = 'Growth-Oriented';
      else if (stockPct >= 0.45) this.riskProfile = 'Balanced';
      else this.riskProfile = 'Conservative';

      if (total >= 70) this.activity = 'Active Trader';
      else if (total >= 40) this.activity = 'Consistent Investor';
      else this.activity = 'Passive Investor';

      this.cd.detectChanges();
    },
    error: () => {
      this.holdings = [];
    }
  });

  this.balanceService.getBalance().subscribe();
}
}