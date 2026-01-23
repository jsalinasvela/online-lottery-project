// API client functions for ticket operations

import { Ticket, PurchaseTransaction } from '@/types/lottery';

export async function purchaseTickets(
  raffleId: string,
  userId: string,
  quantity: number
): Promise<PurchaseTransaction | null> {
  // TODO: Implement API call
  return null;
}

export async function fetchUserTickets(
  raffleId: string,
  userId: string
): Promise<Ticket[]> {
  // TODO: Implement API call
  return [];
}
