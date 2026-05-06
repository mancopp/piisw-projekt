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
  });

  it('should require validFrom for PERIOD ticket type', () => {
    const emitted: PurchaseFormValue[] = [];
    component.submitted.subscribe((value) => emitted.push(value));

    fixture.componentRef.setInput('ticketType', 'PERIOD');
    fixture.detectChanges();
    (component as any).form.setValue({ validFrom: '' });

    const formElement = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    formElement.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(emitted.length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('Dla biletu okresowego data rozpoczęcia jest wymagana');
  });

  it('should emit form value for PERIOD ticket with validFrom', () => {
    const emitted: PurchaseFormValue[] = [];
    component.submitted.subscribe((value) => emitted.push(value));

    fixture.componentRef.setInput('ticketType', 'PERIOD');
    fixture.detectChanges();
    (component as any).form.setValue({ validFrom: '2026-05-10' });

    const formElement = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    formElement.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(emitted).toEqual([
      {
        validFrom: '2026-05-10',
      },
    ]);
  });

  it('should emit null validFrom for TIME ticket type', () => {
    const emitted: PurchaseFormValue[] = [];
    component.submitted.subscribe((value) => emitted.push(value));

    fixture.componentRef.setInput('ticketType', 'TIME');
    fixture.detectChanges();
    (component as any).form.setValue({ validFrom: '' });

    const formElement = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    formElement.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(emitted).toEqual([{ validFrom: null }]);
  });
});
