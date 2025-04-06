import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesarrollowebComponent } from './desarrolloweb.component';

describe('DesarrollowebComponent', () => {
  let component: DesarrollowebComponent;
  let fixture: ComponentFixture<DesarrollowebComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DesarrollowebComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesarrollowebComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
