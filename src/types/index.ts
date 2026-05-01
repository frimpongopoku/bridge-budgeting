import { Timestamp } from "firebase/firestore";

export interface Cycle {
  id: string;
  name: string;
  expectedIncome: number;
  status: "active" | "reconciled";
  emergencyFundAllocationType: "percent" | "fixed";
  emergencyFundAllocationValue: number;
  borrowSource?: "emergencyFund" | "customFund";
  customFundName?: string;
  customFundBalance?: number;
  createdAt: Timestamp;
  reconciledAt?: Timestamp;
  reconciledEFBalance?: number;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  allocationType: "percent" | "fixed";
  allocationValue: number;
  order: number;
}

export interface Withdrawal {
  id: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  categoryEmoji: string;
  note: string;
  createdAt: Timestamp;
}
