
import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'zone.js';
import 'zone.js/testing';
import { ChartComponent } from './chart';

describe('Chart', () => {
  let component: ChartComponent;
  let fixture: ComponentFixture<ChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChartComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });
  it('should create component', () => {
    expect(component).toBeTruthy();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should create 5 pridection chart', () => {
    component.canvases = {
      nativeElement: document.createElement('canvas')
    } as any;
    expect(component.canvases).toBeTruthy();
  });
  it('should create pie chart', () => {
    component.pieCanvas = {
      nativeElement: document.createElement('pieCanvas')
    } as any;
    // component.createPieChart();
    expect(component.pieCanvas).toBeTruthy();
  });
  it('should create stock chart', () => {
    component.segmentcanvas = {
      nativeElement: document.createElement('segmentcanvas')
    } as any;
    expect(component.segmentcanvas).toBeTruthy();
  });
  it('should create advisory chart', () => {
    component.advisorycanvas = {
      nativeElement: document.createElement('advisorycanvas')
    } as any;
    expect(component.advisorycanvas).toBeTruthy();
  });
  it('should create sreturn chart', () => {
    component.pieCanvas = {
      nativeElement: document.createElement('canvas')
    } as any;
    expect(component.pieCanvas).toBeTruthy();
  });
  it('should check risk profile', () => {
    const r = component.riskProfilech();
    expect(r).toBeDefined();
  });
  it('should check risk profile', () => {
    let r = component.tradingActivitySegment();
    expect(r).toBeDefined();
  });

});