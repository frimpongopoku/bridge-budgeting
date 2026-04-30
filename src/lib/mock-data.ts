export const mockUser = {
  name: 'Emmanuel',
  email: 'mrfimpong@gmail.com',
  avatar: 'E',
}

export const mockEmergencyFund = {
  balance: 4500,
  totalBorrowed: 840,
  remainingBalance: 3660,
}

export const mockCycle = {
  id: 'april-2026',
  name: 'April 2026',
  expectedIncome: 3200,
  status: 'active' as const,
  createdAt: '2026-04-01',
  emergencyFundAllocation: 20,
}

export const mockCategories = [
  { id: '1', name: 'Rent', emoji: '🏠', allocationType: 'percent' as const, allocationValue: 35, borrowed: 1120 },
  { id: '2', name: 'Food', emoji: '🛒', allocationType: 'percent' as const, allocationValue: 20, borrowed: 240 },
  { id: '3', name: 'Transport', emoji: '🚗', allocationType: 'percent' as const, allocationValue: 10, borrowed: 80 },
  { id: '4', name: 'Utilities', emoji: '💡', allocationType: 'percent' as const, allocationValue: 8, borrowed: 0 },
  { id: '5', name: 'Entertainment', emoji: '🎬', allocationType: 'percent' as const, allocationValue: 7, borrowed: 40 },
]

export const mockWithdrawals = [
  { id: '1', amount: 1120, categoryName: 'Rent', categoryEmoji: '🏠', note: 'Monthly rent', date: 'Apr 28, 2026' },
  { id: '2', amount: 80,   categoryName: 'Transport', categoryEmoji: '🚗', note: 'Fuel top-up', date: 'Apr 27, 2026' },
  { id: '3', amount: 40,   categoryName: 'Entertainment', categoryEmoji: '🎬', note: 'Netflix + Spotify', date: 'Apr 25, 2026' },
  { id: '4', amount: 180,  categoryName: 'Food', categoryEmoji: '🛒', note: 'Weekly groceries', date: 'Apr 24, 2026' },
  { id: '5', amount: 60,   categoryName: 'Food', categoryEmoji: '🛒', note: 'Dinner out', date: 'Apr 22, 2026' },
]

export const mockHistoryCycles = [
  {
    id: 'march-2026',
    name: 'March 2026',
    expectedIncome: 3200,
    totalBorrowed: 920,
    status: 'reconciled' as const,
    closedAt: 'Mar 31, 2026',
    categoriesCount: 5,
    emergencyFundImpact: +640,
  },
  {
    id: 'february-2026',
    name: 'February 2026',
    expectedIncome: 3000,
    totalBorrowed: 650,
    status: 'reconciled' as const,
    closedAt: 'Feb 28, 2026',
    categoriesCount: 5,
    emergencyFundImpact: +600,
  },
  {
    id: 'january-2026',
    name: 'January 2026',
    expectedIncome: 3200,
    totalBorrowed: 1100,
    status: 'reconciled' as const,
    closedAt: 'Jan 31, 2026',
    categoriesCount: 4,
    emergencyFundImpact: +140,
  },
  {
    id: 'december-2025',
    name: 'December 2025',
    expectedIncome: 3200,
    totalBorrowed: 780,
    status: 'reconciled' as const,
    closedAt: 'Dec 31, 2025',
    categoriesCount: 5,
    emergencyFundImpact: +680,
  },
]

export function calcAllocated(income: number, allocType: 'percent' | 'fixed', value: number) {
  return allocType === 'percent' ? (income * value) / 100 : value
}
