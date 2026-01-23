// Prize pool and percentage calculations

export function calculateProgress(current: number, goal: number): number {
  if (goal === 0) return 0;
  return Math.min((current / goal) * 100, 100);
}

export function calculateTotalPrice(ticketPrice: number, quantity: number): number {
  return ticketPrice * quantity;
}

export function calculateRemainingAmount(goal: number, current: number): number {
  return Math.max(goal - current, 0);
}
