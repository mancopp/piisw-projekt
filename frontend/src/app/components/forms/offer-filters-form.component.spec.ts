import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OfferFiltersFormComponent, OfferFiltersValue } from './offer-filters-form.component';

describe('OfferFiltersFormComponent', () => {
  let fixture: ComponentFixture<OfferFiltersFormComponent>;
  let component: OfferFiltersFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfferFiltersFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OfferFiltersFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should emit updated filters on value changes', () => {
    const emitted: OfferFiltersValue[] = [];
    component.filtersChanged.subscribe((value) => emitted.push(value));

    (component as any).form.patchValue({
      ticketType: 'TIME',
      fareType: 'REDUCED',
    });

    expect(emitted.at(-1)).toEqual({
      ticketType: 'TIME',
      fareType: 'REDUCED',
    });
  });
});
