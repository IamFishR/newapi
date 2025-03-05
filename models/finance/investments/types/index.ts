export type InvestmentType = 'stock' | 'etf' | 'mutual_fund' | 'crypto' | 'other';
export type InvestmentTransactionType = 'buy' | 'sell';

export interface InvestmentAttributes {
    id: string;
    userId: number;
    symbol: string;
    shares: number;
    averageCost: number;
    type: InvestmentType;
    purchaseDate: Date;
    currentPrice?: number;
    lastPriceUpdate?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

export interface InvestmentTransactionAttributes {
    id: string;
    userId: number;
    investmentId: string;
    type: InvestmentTransactionType;
    shares: number;
    pricePerShare: number;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface InvestmentWithTransactions extends InvestmentAttributes {
    transactions: InvestmentTransactionAttributes[];
}

export interface InvestmentTransactionWithInvestment extends InvestmentTransactionAttributes {
    investment: InvestmentAttributes;
}

export type CreateInvestmentInput = Omit<InvestmentAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
export type UpdateInvestmentInput = Partial<CreateInvestmentInput>;

export type CreateInvestmentTransactionInput = Omit<InvestmentTransactionAttributes, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateInvestmentTransactionInput = Partial<CreateInvestmentTransactionInput>;