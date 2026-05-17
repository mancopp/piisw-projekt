import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { InspectorCheckPageComponent } from './inspector-check-page.component';
import { TicketService } from '../core/services/ticket.service';

describe('InspectorCheckPageComponent', () => {
  let fixture: ComponentFixture<InspectorCheckPageComponent>;
  let checkTicket: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    checkTicket = vi.fn(() => of({ status: 'VALID', reason: 'OK' }));

    await TestBed.configureTestingModule({
      imports: [InspectorCheckPageComponent],
      providers: [
        {
          provide: TicketService,
          useValue: {
            checkTicket,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InspectorCheckPageComponent);
    fixture.detectChanges(false);
  });

  it('should pass form values to service and render VALID result', () => {
    fixture.componentInstance['onFormSubmit']({
      ticketCode: 'TCK-4Q7K8R2M9P',
      vehicleId: 'KR-105',
    });

    expect(checkTicket).toHaveBeenCalledWith('TCK-4Q7K8R2M9P', 'KR-105');
    expect(fixture.componentInstance['result']()).toEqual({ status: 'VALID', reason: 'OK' });
  });

  it('should render INVALID result from service', () => {
    checkTicket.mockReturnValueOnce(of({ status: 'INVALID', reason: 'Bilet nieaktywny' }));

    fixture.componentInstance['onFormSubmit']({
      ticketCode: 'TCK-4Q7K8R2M9P',
      vehicleId: 'KR-105',
    });

    expect(fixture.componentInstance['result']()).toEqual({
      status: 'INVALID',
      reason: 'Bilet nieaktywny',
    });
  });
});
