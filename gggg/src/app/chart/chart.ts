import {
  Component,
  AfterViewInit,
  ViewChildren,
  QueryList,
  ElementRef,
  ViewChild,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { Holdings } from '../holdings';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart.html',
  styleUrl: './chart.css',
})
export class ChartComponent implements AfterViewInit, OnDestroy {

  Risktype: string = 'Unknown';
  tradingSegment: string = 'Unknown';

  @ViewChildren('chartCanvas') canvases!: QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChild('pieChartCanvas') pieCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('advisorychartcanvas') advisorycanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('segmentchartcanvas') segmentcanvas!: ElementRef<HTMLCanvasElement>;

  list1: any[] = [];
  stocks: any[] = [];

  totalst: number = 0;
  totalmf: number = 0;
  totalc: number = 0;

  linechart: Chart[] = [];
  piechart?: Chart;
  advisorychart?: Chart;
  segmentchart?: Chart;

  private refreshInterval: any;
  private holdingSubscription?: Subscription;

  Advisortip = [
    { name: 'Diversification', value: 90 },
    { name: 'Momentum', value: 50 },
    { name: 'Risk Balance', value: 70 },
    { name: 'Activity', value: 85 }
  ];

  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
  monthlyReturns = [10, 20, 15, 25, 30];

  segments = ['Stocks', 'Funds'];

  constructor(
    public holdingservic: Holdings,
    private cd: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.loadHoldingsAndCreateCharts();
    }, 0);

    this.refreshInterval = setInterval(() => {
      this.loadHoldingsAndCreateCharts();
    }, 5000);
  }

  loadHoldingsAndCreateCharts() {
    if (this.holdingSubscription) {
      this.holdingSubscription.unsubscribe();
    }

    this.holdingSubscription = this.holdingservic.get_all_Holdings().subscribe({
      next: (data: any[]) => {
        this.list1 = data || [];

        this.stocks = this.list1.map(item => ({
          name: item.stockName,
          basePrice: Number(item.price) || 100,
          quantity: Number(item.quantity) || 0,
          type: item.type
        }));

        this.calculatepercentage();

        this.Risktype = this.riskProfilech();
        this.tradingSegment = this.tradingActivitySegment();

        this.cd.detectChanges();

        setTimeout(() => {
          this.createCharts();
          this.createPieChart();
          this.Advisorychart();
          this.segmachart();
        }, 0);
      },
      error: (err) => {
        console.error('Error loading holdings:', err);
        this.list1 = [];
        this.stocks = [];
      }
    });
  }

  calculatepercentage() {
    this.totalst = 0;
    this.totalmf = 0;
    this.totalc = 0;

    for (let item of this.list1) {
      const type = item.type?.toLowerCase();
      const qty = Number(item.quantity) || 0;

      if (type === 'stock') {
        this.totalst += qty;
      } else {
        this.totalmf += qty;
      }
    }

    this.totalc = this.totalst + this.totalmf;
  }

  generateData(basePrice: number): number[] {
    const data: number[] = [];
    let price = basePrice;

    for (let i = 0; i < 5; i++) {
      const change = price * (Math.random() * 0.4 - 0.2);
      price = Math.max(10, Math.round(price + change));
      data.push(price);
    }

    return data;
  }

  getYears(): number[] {
    const currentYear = new Date().getFullYear();

    return [
      currentYear - 4,
      currentYear - 3,
      currentYear - 2,
      currentYear - 1,
      currentYear
    ];
  }

  createCharts() {
    const years = this.getYears();

    if (this.linechart.length) {
      this.linechart.forEach(chart => chart.destroy());
      this.linechart = [];
    }

    this.canvases.forEach((canvas, index) => {
      if (!this.stocks[index]) {
        return;
      }

      const chart = new Chart(canvas.nativeElement, {
        type: 'line',
        data: {
          labels: years,
          datasets: [
            {
              label: `${this.stocks[index].name} Price`,
              data: this.generateData(this.stocks[index].basePrice),
              fill: true,
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });

      this.linechart.push(chart);
    });
  }

  createPieChart() {
    if (!this.pieCanvas) {
      return;
    }

    if (this.piechart) {
      this.piechart.destroy();
    }

    this.piechart = new Chart(this.pieCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels: this.months,
        datasets: [
          {
            label: 'Monthly Return (%)',
            data: this.monthlyReturns
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  Advisorychart() {
    if (!this.advisorycanvas) {
      return;
    }

    if (this.advisorychart) {
      this.advisorychart.destroy();
    }

    this.advisorychart = new Chart(this.advisorycanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: this.Advisortip.map(a => a.name),
        datasets: [
          {
            label: 'Advisory Score',
            data: this.Advisortip.map(a => a.value)
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  segmachart() {
    if (!this.segmentcanvas) {
      return;
    }

    if (this.segmentchart) {
      this.segmentchart.destroy();
    }

    const stockPercentage =
      this.totalc > 0 ? Number(((this.totalst / this.totalc) * 100).toFixed(2)) : 0;

    const fundPercentage =
      this.totalc > 0 ? Number(((this.totalmf / this.totalc) * 100).toFixed(2)) : 0;

    this.segmentchart = new Chart(this.segmentcanvas.nativeElement, {
      type: 'pie',
      data: {
        labels: this.segments,
        datasets: [
          {
            label: 'User Segmentation',
            data: [stockPercentage, fundPercentage]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  riskProfilech(): string {
    if (this.totalc === 0) {
      return 'Unknown';
    }

    const stockPct = this.totalst / this.totalc;

    if (stockPct >= 0.7) {
      return 'Growth-Oriented';
    }

    if (stockPct >= 0.45) {
      return 'Balanced';
    }

    return 'Conservative';
  }

  tradingActivitySegment(): string {
    const recentCount = this.totalc;

    if (recentCount >= 90) {
      return 'Active Trader';
    }

    if (recentCount >= 70) {
      return 'Consistent Investor';
    }

    return 'Passive Investor';
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    if (this.holdingSubscription) {
      this.holdingSubscription.unsubscribe();
    }

    this.linechart.forEach(chart => chart.destroy());

    if (this.piechart) {
      this.piechart.destroy();
    }

    if (this.advisorychart) {
      this.advisorychart.destroy();
    }

    if (this.segmentchart) {
      this.segmentchart.destroy();
    }
  }
}