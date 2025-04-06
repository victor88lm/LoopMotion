import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundadoresComponent } from './fundadores.component';

describe('FundadoresComponent', () => {
  let component: FundadoresComponent;
  let fixture: ComponentFixture<FundadoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FundadoresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FundadoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
