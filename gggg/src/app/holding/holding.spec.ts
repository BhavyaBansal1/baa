import { ComponentFixture, TestBed } from '@angular/core/testing';
import { holding } from './holding';
import { Holdings } from '../holdings';
import { ChangeDetectorRef } from '@angular/core';
import 'zone.js';
import 'zone.js/testing';

describe('holding Component (Advanced No Jasmine spies)', () => {
  let component: holding;
  let fixture: ComponentFixture<holding>;

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
    detectChanges: () => { }
  };

  beforeEach(async () => {
    updatePricesCalled = 0;
    getAllHoldingsCalled = 0;

    await TestBed.configureTestingModule({
      imports: [holding],
      providers: [
        { provide: Holdings, useValue: mockHoldingsService },
        { provide: ChangeDetectorRef, useValue: mockCdRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(holding);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should return stocks list', () => {
    const result = component.getstocks();
    expect(result.length).toBe(2);
  });

  it('should call updatePrices in pagereload', () => {
    component.pagereload();
    expect(updatePricesCalled).toBeTruthy;
  });

  it('should start auto refresh when toggled ON', () => {
    component.toggle_load();

    expect(component.autore).toBeTrue();
    expect(component.intervalid).toBeTruthy();
  });

  it('should stop auto refresh when toggled OFF', () => {
    component.toggle_load(); 
    component.toggle_load(); 

    expect(component.autore).toBeFalse();
  });

  it('should handle errors in pagereload safely', () => {
    mockHoldingsService.updatePrices = () => {
      throw new Error('check failure');
    };

    expect(() => component.pagereload()).not.toThrow();
  });

  it('should have default initial values', () => {
    expect(component.portfolioValue).toBe(0);
    expect(component.autore).toBeFalse();
  });
});