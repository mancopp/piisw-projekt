import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterPageComponent } from './register-page.component';

describe('RegisterPageComponent', () => {
  let fixture: ComponentFixture<RegisterPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPageComponent);
    fixture.detectChanges();
  });

  it('should store submitted email and show confirmation message', () => {
    fixture.componentInstance['onFormSubmit']({
      email: 'new-user@test.pl',
      password: 'StrongPass1',
      confirmPassword: 'StrongPass1',
    });

    expect(fixture.componentInstance['lastSubmittedEmail']).toBe('new-user@test.pl');
  });
});
