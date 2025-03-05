export interface MonthlyExpense {
    category: string;
    amount: number;
}

export interface InvestmentProfile {
    riskTolerance: 'low' | 'medium' | 'high';
    investmentGoals: string[];
    preferredSectors?: string[];
    preferredAssetTypes?: string[];
}

export interface FinancialProfileAttributes {
    id: string;
    userId: number;
    monthlyIncome: number;
    monthlySavingsGoal: number;
    currentSavings: number;
    monthlyExpenses: MonthlyExpense[];
    investmentProfile: InvestmentProfile;
    lastUpdated: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

export type CreateFinancialProfileInput = Omit<FinancialProfileAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
export type UpdateFinancialProfileInput = Partial<CreateFinancialProfileInput>;