import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterFormComponent, RegisterFormValue } from './register-form.component';

describe('RegisterFormComponent', () => {
  let fixture: ComponentFixture<RegisterFormComponent>;
  let component: RegisterFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should show mismatch error and not emit when passwords are different', () => {
    const emitted: RegisterFormValue[] = [];
    component.submitted.subscribe((value) => emitted.push(value));

    (component as any).form.setValue({
      email: 'user@example.com',
      password: 'StrongPass1',
      confirmPassword: 'OtherPass1',
    });

    const formElement = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    formElement.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(emitted.length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('Hasła muszą być takie same');
  });

  it('should emit form value when form is valid', () => {
    const emitted: RegisterFormValue[] = [];
    component.submitted.subscribe((value) => emitted.push(value));

    (component as any).form.setValue({
      email: 'user@example.com',
      password: 'StrongPass1',
      confirmPassword: 'StrongPass1',
    });

    const formElement = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    formElement.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(emitted).toEqual([
      {
        email: 'user@example.com',
        password: 'StrongPass1',
        confirmPassword: 'StrongPass1',
      },
    ]);
  });
});
