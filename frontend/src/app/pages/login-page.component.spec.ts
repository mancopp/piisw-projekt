import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPageComponent } from './login-page.component';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';

describe('LoginPageComponent - critical login path', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;

  let loggedCredentials: { email: string; password: string } | null = null;
  let navigatedTo: string[] | null = null;

  let mockAuthService: {
    login: (credentials: {
      email: string;
      password: string;
    }) => Observable<{ token: string; role: 'PASSENGER' | 'INSPECTOR' }>;
  };
  let mockRouter: { navigate: (path: string[]) => void };

  beforeEach(async () => {
    loggedCredentials = null;
    navigatedTo = null;

    mockAuthService = {
      login: (credentials: { email: string; password: string }) => {
        loggedCredentials = credentials;
        return of({ token: 'jwt-passenger', role: 'PASSENGER' });
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

  it('should create the login component', () => {
    expect(component).toBeTruthy();
  });

  it('should send credentials to AuthService and redirect PASSENGER to offer page', () => {
    const testFormValue = { email: 'test@test.pl', password: 'StrongPass1' };

    component['onFormSubmit'](testFormValue);

    expect(loggedCredentials).toEqual({ email: 'test@test.pl', password: 'StrongPass1' });

    expect(navigatedTo).toEqual(['/offer']);
  });

  it('should redirect INSPECTOR to the verification page', () => {
    mockAuthService.login = (credentials: { email: string; password: string }) => {
      loggedCredentials = credentials;
      return of({ token: 'jwt-inspector', role: 'INSPECTOR' });
    };

    component['onFormSubmit']({ email: 'inspector@test.pl', password: 'StrongPass1' });

    expect(loggedCredentials).toEqual({ email: 'inspector@test.pl', password: 'StrongPass1' });
    expect(navigatedTo).toEqual(['/inspector/check']);
  });
});
