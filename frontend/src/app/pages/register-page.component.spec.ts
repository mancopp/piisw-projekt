import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '../core/services/auth.service';
import { RegisterPageComponent } from './register-page.component';

describe('RegisterPageComponent', () => {
  let fixture: ComponentFixture<RegisterPageComponent>;
  let register: ReturnType<typeof vi.fn>;
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    register = vi.fn(() => of({ token: 'jwt-passenger', role: 'PASSENGER' }));
    navigate = vi.fn();

    await TestBed.configureTestingModule({
      imports: [RegisterPageComponent],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register,
          },
        },
        {
          provide: Router,
          useValue: {
            navigate,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPageComponent);
    fixture.detectChanges();
  });

  it('should register user and navigate to offer page', () => {
    fixture.componentInstance['onFormSubmit']({
      email: 'new-user@test.pl',
      password: 'StrongPass1',
      confirmPassword: 'StrongPass1',
    });

    expect(register).toHaveBeenCalledWith({
      email: 'new-user@test.pl',
      password: 'StrongPass1',
    });
    expect(fixture.componentInstance['lastSubmittedEmail']).toBe('new-user@test.pl');
    expect(navigate).toHaveBeenCalledWith(['/offer']);
  });
});
