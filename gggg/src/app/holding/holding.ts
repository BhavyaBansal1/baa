import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Holdings } from '../holdings';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-holding',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './holding.html',
  styleUrls: ['./holding.css'],
})
export class holding {

  portfolioValue: number = 0;
  list1: any[] = [];
  intervalid: any;
  autore: boolean = false;

  constructor(public holdingservice: Holdings, public cd: ChangeDetectorRef) {
    this.get_all_Holdings();
  }

  get_all_Holdings() {
    this.holdingservice.get_all_Holdings().subscribe({
      next: (data) => {
        this.list1 = data;
        this.cd.detectChanges();
      },
      error: () => {
        this.list1 = [];
      }
    });
  }

  getstocks() {
    return this.list1;
  }

  pagereload() {
    this.holdingservice.updatePrices().subscribe({
      next: (data) => {
        this.list1 = data;
        this.cd.detectChanges();
      },
      error: () => {}
    });
  }

  toggle_load() {
    this.autore = !this.autore;

    if (this.autore) {
      this.intervalid = window.setInterval(() => {
        this.pagereload();
      }, 5000);
    } else {
      if (this.intervalid) {
        clearInterval(this.intervalid);
      }
    }
  }
}