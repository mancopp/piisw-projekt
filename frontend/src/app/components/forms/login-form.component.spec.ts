import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginFormComponent, LoginFormValue } from './login-form.component';

describe('LoginFormComponent', () => {
  let fixture: ComponentFixture<LoginFormComponent>;
  let component: LoginFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not emit when form is invalid', () => {
    const emitted: LoginFormValue[] = [];
    component.submitted.subscribe((value) => emitted.push(value));

    const formElement = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    formElement.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(emitted.length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('Formularz zawiera błędy');
  });

  it('should emit form value when form is valid', () => {
    const emitted: LoginFormValue[] = [];
    component.submitted.subscribe((value) => emitted.push(value));

    (component as any).form.setValue({
      email: 'user@example.com',
      password: 'StrongPass1',
    });

    const formElement = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    formElement.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(emitted).toEqual([
      {
        email: 'user@example.com',
        password: 'StrongPass1',
      },
    ]);
  });

  it('should emit even when password is short', () => {
    const emitted: LoginFormValue[] = [];
    component.submitted.subscribe((value) => emitted.push(value));

    (component as any).form.setValue({
      email: 'user@example.com',
      password: 'x',
    });

    const formElement = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    formElement.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(emitted).toEqual([
      {
        email: 'user@example.com',
        password: 'x',
      },
    ]);
  });
});
