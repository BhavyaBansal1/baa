import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { holding } from '../holding/holding';
import Chart from 'chart.js/auto';
import { Holdings } from '../holdings';
import { ChartComponent } from '../chart/chart';
import { BalanceService } from '../balance-service';
import { DatePipe } from '@angular/common';
import { summary } from '../summary/sumary';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [summary, holding, ChartComponent, DatePipe],
  templateUrl:'./dashboard.html',
  styleUrl: './dashboard.css',
})
export class dashboard implements AfterViewInit {

  portfolioValue: number = 0;
  date: any;
  stockChart!: Chart;
  stocks: any[] = [];

  constructor(
    public holdingservice: Holdings,
    public balanceService: BalanceService,
    public cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.date = new Date();

    setInterval(() => {
      this.date = new Date();
      this.cd.detectChanges();
    }, 1000);
  }

  ngAfterViewInit() {
    this.loadHoldings();
  }

  loadHoldings() {
    this.holdingservice.get_all_Holdings().subscribe({
      next: (data) => {
        this.stocks = data;
        this.updatePortfolioValue();

        setTimeout(() => {
          this.createStockChart();
        }, 0);

        this.cd.detectChanges();
      },
      error: () => {
        this.stocks = [];
      }
    });
  }

  updatePortfolioValue() {
    let total = 0;

    this.stocks.forEach(stock => {
      total += stock.quantity * stock.price;
    });

    this.portfolioValue = total;
  }

  getstocks() {
    return this.stocks;
  }

  createStockChart() {
    if (this.stockChart) {
      this.stockChart.destroy();
    }

    const stocks = this.getstocks();

    this.stockChart = new Chart("stockChart", {
      type: 'bar',
      data: {
        labels: stocks.map(s => s.stockName),
        datasets: [{
          label: 'Stock Quantity',
          data: stocks.map(s => s.quantity)
        }]
      },
      options: {
        responsive: true
      }
    });
  }
}