import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PurchaseFormValue, PurchaseOptionsFormComponent } from './purchase-options-form.component';

describe('PurchaseOptionsFormComponent', () => {
  let fixture: ComponentFixture<PurchaseOptionsFormComponent>;
  let component: PurchaseOptionsFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseOptionsFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseOptionsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should require validFrom for PERIOD ticket type', () => {
    const emitted: PurchaseFormValue[] = [];
    component.submitted.subscribe((value) => emitted.push(value));

    (component as any).form.setValue({
      ticketType: 'PERIOD',
      validFrom: '',
    });

    const formElement = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    formElement.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(emitted.length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('Dla biletu okresowego data rozpoczęcia jest wymagana');
  });

  it('should emit form value for PERIOD ticket with validFrom', () => {
    const emitted: PurchaseFormValue[] = [];
    component.submitted.subscribe((value) => emitted.push(value));

    (component as any).form.setValue({
      ticketType: 'PERIOD',
      validFrom: '2026-05-10',
    });

    const formElement = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    formElement.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(emitted).toEqual([
      {
        ticketType: 'PERIOD',
        validFrom: '2026-05-10',
      },
    ]);
  });
});
