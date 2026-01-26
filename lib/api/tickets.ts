// API client functions for ticket operations

import { Ticket, PurchaseTransaction } from '@/types/lottery';

export async function purchaseTickets(
  raffleId: string,
  userId: string,
  quantity: number
): Promise<PurchaseTransaction | null> {
  try {
    const response = await fetch('/api/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raffleId, userId, quantity }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to purchase tickets');
    }

    const data = await response.json();
    return data.transaction;
  } catch (error) {
    console.error('Error purchasing tickets:', error);
    throw error;
  }
}

export async function fetchUserTickets(
  raffleId: string,
  userId: string
): Promise<Ticket[]> {
  try {
    const response = await fetch(`/api/tickets?raffleId=${raffleId}&userId=${userId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch user tickets');
    }

    const data = await response.json();
    return data.tickets || [];
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    throw error;
  }
}
