import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationSummaryComponent } from './quotation-summary.component';

describe('QuotationSummaryComponent', () => {
  let component: QuotationSummaryComponent;
  let fixture: ComponentFixture<QuotationSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuotationSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuotationSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
