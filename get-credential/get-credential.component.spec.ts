import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetCredentialComponent } from './get-credential.component';

describe('GetCredentialComponent', () => {
  let component: GetCredentialComponent;
  let fixture: ComponentFixture<GetCredentialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GetCredentialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetCredentialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
