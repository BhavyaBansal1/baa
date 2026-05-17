import { ComponentFixture, TestBed } from '@angular/core/testing';
import { dashboard } from './dashboard';
import { Holdings } from '../holdings';
import { ChangeDetectorRef } from '@angular/core';
import 'zone.js';
import 'zone.js/testing';

describe('dashboard Component (Advanced No Jasmine spies)', () => {
  let component: dashboard;
  let fixture: ComponentFixture<dashboard>;

  let updatePricesCalled = 0;
  let getAllHoldingsCalled = 0;

  const mockHoldingsService = {
    get_all_Holdings: () => {
      getAllHoldingsCalled++;
      return [
        { name: 'TCS', quantity: 10, price: 100 },
        { name: 'INFY', quantity: 5, price: 200 }
      ];
    },

    updatePrices: () => {
      updatePricesCalled++;
    }
  };

  const mockCdRef = {
    detectChanges: () => {}
  };

  beforeEach(async () => {
    updatePricesCalled = 0;
    getAllHoldingsCalled = 0;

    await TestBed.configureTestingModule({
      imports: [dashboard],
      providers: [
        { provide: Holdings, useValue: mockHoldingsService },
        { provide: ChangeDetectorRef, useValue: mockCdRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should return stocks list', () => {
    const result = component.getstocks();
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(0);
  });

  it('should update portfolio value', () => {
    const ret = component.updatePortfolioValue();
    expect(ret).not.toBeNull();
  });

  it('should create stock chart', () => {
    component.createStockChart();
    expect(component.stockChart).toBeTruthy();
  });
});