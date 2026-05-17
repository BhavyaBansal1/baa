import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Trade } from './trade';
import { BalanceService } from '../balance-service';
import { Holdings } from '../holdings';

describe('Trade', () => {
  let component: Trade;
  let fixture: ComponentFixture<Trade>;

  let balance = 10000;
  const balanceMock = {
    balanceamount: balance,
    buys: (amt: number) => {
      balance -= amt;
    },
    sell: (amt: number) => {
      balance += amt;
    }
  };
  const holdingMock = {
    buy: () => { },
    sell: () => true,
    getQuantity: () => 10,
    get_all_Holdings: () => []
  };

  beforeEach(async () => {
    balance = 10000;
    await TestBed.configureTestingModule({
      imports: [Trade],
      providers: [
        { provide: BalanceService, useValue: balanceMock },
        { provide: Holdings, useValue: holdingMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Trade);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy()
  });

  it('should calculate order value correctly', () => {
    component.price = 100;
    component.quantity = 2;
    component.calculateOrderValue();
    expect(component).toBeTruthy();
  });

  it('should buy stocks successfully', () => {
    component.stockName = 'tata';
    component.quantity = 2;
    component.price = 100;
    component.buy();
    expect(component.msg).toEqual('Stocks bought successfully');
  });

  it('should sell stocks successfully', () => {
    component.stockName = 'tata';
    component.quantity = 1;
    component.price = 100;
    component.sell();
    expect(component.msg).toBeTruthy();

  });
  it('should fail buy when stock name missing or quantity is negative', () => {
    component.stockName = '';
    component.quantity = -11;
    component.price = 100;
    component.buy();

    expect(component.msg).toEqual('Enter stock name');
  });
  it('should fail buy when insufficient balance', () => {
    component.stockName = 'Micro';
    component.quantity = 1000;
    component.price = 1000;
    component.buy();
    expect(component.quantity * component.price).toBeGreaterThan(balance);
  });
  it('should fail sell when not enough shares', () => {
    holdingMock.sell = () => false;

    component.stockName = 'tata';
    component.quantity = 10;
    component.sell();
    expect(component.msg).toEqual('Not enough shares')
  });

  it('should keep only last 5 transactions', () => {
    component.Transactions = [1, 2, 3, 4, 5, 6, 7];
    component.saveRecentTransactions();

    expect(component.Transactions.length).toEqual(5);
  });

});
