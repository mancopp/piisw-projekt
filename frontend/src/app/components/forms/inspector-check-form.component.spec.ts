import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InspectorCheckFormComponent, InspectorCheckFormValue } from './inspector-check-form.component';

describe('InspectorCheckFormComponent', () => {
  let fixture: ComponentFixture<InspectorCheckFormComponent>;
  let component: InspectorCheckFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InspectorCheckFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InspectorCheckFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not emit when ticket code format is invalid', () => {
    const emitted: InspectorCheckFormValue[] = [];
    component.submitted.subscribe((value) => emitted.push(value));

    (component as any).form.setValue({
      ticketCode: 'INVALID-CODE',
      vehicleId: 'KR-105',
    });

    const formElement = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    formElement.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(emitted.length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('Kod biletu musi mieć format TCK-XXXXXXXXXX');
  });

  it('should emit form value when both fields are valid', () => {
    const emitted: InspectorCheckFormValue[] = [];
    component.submitted.subscribe((value) => emitted.push(value));

    (component as any).form.setValue({
      ticketCode: 'TCK-4Q7K8R2M9P',
      vehicleId: 'KR-105',
    });

    const formElement = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    formElement.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(emitted).toEqual([
      {
        ticketCode: 'TCK-4Q7K8R2M9P',
        vehicleId: 'KR-105',
      },
    ]);
  });
});
