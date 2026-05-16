export interface TicketOffer {
  id: number;
  name: string;
  ticketType: 'SINGLE' | 'TIME' | 'PERIOD';
  fareType: 'NORMAL' | 'REDUCED';
  durationMinutes?: number | null;
  validityDays?: number | null;
  price: number;
}

export interface MyTicket {
  id: number;
  code: string;
  ticketType: 'SINGLE' | 'TIME' | 'PERIOD';
  fareType: 'NORMAL' | 'REDUCED';
  status: 'PURCHASED' | 'ACTIVATED' | 'EXPIRED' | 'INVALIDATED';
  purchasedAt: string;
  activatedAt?: string | null;
  activatedVehicleId?: string | null;

  validFrom?: string | null;
  validTo?: string | null;
}

export interface TicketPurchaseResponse {
  ticketId: number;
  code: string;
  status: 'PURCHASED' | 'ACTIVATED' | 'EXPIRED' | 'INVALIDATED';
  ticketType: 'SINGLE' | 'TIME' | 'PERIOD';
}

export interface TransactionResponse {
  id: number;
  ticketId: number;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'FAILED';
  createdAt: string;
}
