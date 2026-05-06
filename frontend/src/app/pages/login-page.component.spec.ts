import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPageComponent } from './login-page.component';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('LoginPageComponent - Krytyczna Ścieżka Logowania', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;

  let loggedCredentials: any = null;
  let navigatedTo: any = null;

  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(async () => {
    loggedCredentials = null;
    navigatedTo = null;

    mockAuthService = {
      login: (credentials: any) => {
        loggedCredentials = credentials;
        return of({ role: 'PASSENGER' });
      },
    };

    mockRouter = {
      navigate: (path: any) => {
        navigatedTo = path;
      },
    };

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('powinien poprawnie stworzyć komponent logowania', () => {
    expect(component).toBeTruthy();
  });

  it('powinien wysłać dane do AuthService i przekierować PASAŻERA na stronę ofert', () => {
    const testFormValue = { email: 'test@test.pl', password: '123' };

    (component as any).onFormSubmit(testFormValue);

    expect(loggedCredentials).toEqual({ email: 'test@test.pl', password: '123' });

    expect(navigatedTo).toEqual(['/offer']);
  });
});
