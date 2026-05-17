import { TestBed } from '@angular/core/testing';
import { BalanceService } from './balance-service';

describe('BalanceService', () => {
  let service: BalanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BalanceService);
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  it('should deduct balance on buy', () => {
    service.balanceamount = 1000;
    service.buys(100);
    expect(service.balanceamount).toBe(900);
  });

  it('should increase balance on sell', () => {
    service.balanceamount = 1000;
    service.sell(200);
    expect(service.balanceamount).toBe(1200);
  });

});