// API client functions for activity operations

import { ActivityEntry } from '@/lib/data/store';

export async function fetchRecentActivity(
  raffleId: string,
  limit: number = 20
): Promise<ActivityEntry[]> {
  try {
    const response = await fetch(`/api/activity?raffleId=${raffleId}&limit=${limit}`);

    if (!response.ok) {
      throw new Error('Failed to fetch recent activity');
    }

    const data = await response.json();
    return data.activities || [];
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    throw error;
  }
}
