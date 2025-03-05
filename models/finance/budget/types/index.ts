export interface BudgetCategoryAttributes {
    id: string;
    userId: number;
    name: string;
    budgetedAmount: number;
    color?: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

export interface TransactionAttributes {
    id: string;
    userId: number;
    categoryId: string;
    date: Date;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    recurringType: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    recurringEndDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

export interface TransactionWithCategory extends TransactionAttributes {
    category: BudgetCategoryAttributes;
}

export type CreateBudgetCategoryInput = Omit<BudgetCategoryAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
export type UpdateBudgetCategoryInput = Partial<CreateBudgetCategoryInput>;

export type CreateTransactionInput = Omit<TransactionAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
export type UpdateTransactionInput = Partial<CreateTransactionInput>;