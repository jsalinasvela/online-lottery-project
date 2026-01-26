// API client functions for raffle operations

import { Raffle } from '@/types/lottery';

export async function fetchActiveRaffle(): Promise<Raffle | null> {
  try {
    const response = await fetch('/api/raffles?status=active');

    if (!response.ok) {
      throw new Error('Failed to fetch active raffle');
    }

    const data = await response.json();
    return data.raffle;
  } catch (error) {
    console.error('Error fetching active raffle:', error);
    throw error;
  }
}

export async function fetchRaffleById(id: string): Promise<Raffle | null> {
  try {
    const response = await fetch(`/api/raffles/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch raffle');
    }

    const data = await response.json();
    return data.raffle;
  } catch (error) {
    console.error('Error fetching raffle by ID:', error);
    throw error;
  }
}

export async function fetchRaffleHistory(): Promise<Raffle[]> {
  try {
    const response = await fetch('/api/raffles');

    if (!response.ok) {
      throw new Error('Failed to fetch raffle history');
    }

    const data = await response.json();
    return data.raffles || [];
  } catch (error) {
    console.error('Error fetching raffle history:', error);
    throw error;
  }
}

export async function fetchRecentCompletedRaffle(): Promise<Raffle | null> {
  try {
    const response = await fetch('/api/raffles?status=recent-completed');

    if (!response.ok) {
      throw new Error('Failed to fetch recent completed raffle');
    }

    const data = await response.json();
    return data.raffle;
  } catch (error) {
    console.error('Error fetching recent completed raffle:', error);
    throw error;
  }
}
