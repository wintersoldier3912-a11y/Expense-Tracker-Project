
export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  preferences: {
    currency: string;
    notifications: boolean;
  };
}

export interface Expense {
  id: string;
  amount: number;
  currency: string;
  date: string;
  categoryId: string; // References Category.id
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
}
