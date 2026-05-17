import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { TransactionResponse } from '../core/models/ticket.dto';
import { TicketService } from '../core/services/ticket.service';
import { TransactionsPageComponent } from './transactions-page.component';

describe('TransactionsPageComponent', () => {
  let fixture: ComponentFixture<TransactionsPageComponent>;
  let transactions: TransactionResponse[];

  beforeEach(async () => {
    transactions = [
      {
        id: 1,
        ticketId: 101,
        amount: 4.6,
        currency: 'PLN',
        status: 'SUCCESS',
        createdAt: new Date('2026-05-17T08:00:00.000Z').toISOString(),
      },
      {
        id: 2,
        ticketId: 102,
        amount: 110,
        currency: 'PLN',
        status: 'SUCCESS',
        createdAt: new Date('2026-05-17T08:10:00.000Z').toISOString(),
      },
    ];

    await TestBed.configureTestingModule({
      imports: [TransactionsPageComponent],
      providers: [
        {
          provide: TicketService,
          useValue: {
            getMyTransactions: () => of(transactions),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionsPageComponent);
    fixture.detectChanges();
  });

  it('should render loaded transactions', () => {
    const pageText = fixture.nativeElement.textContent as string;
    expect(pageText).toContain('ID: 1');
    expect(pageText).toContain('#101');
    expect(pageText).toContain('4.60 PLN');
  });

  it('should show empty state when there are no transactions', () => {
    transactions = [];
    fixture = TestBed.createComponent(TransactionsPageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Brak historii transakcji');
  });
});
