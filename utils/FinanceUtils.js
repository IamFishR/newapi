class FinanceUtils {
    static calculateCompoundInterest(principal, rate, time, frequency = 12) {
        const r = rate / 100 / frequency;
        const n = frequency * time;
        return principal * Math.pow(1 + r, n);
    }

    static calculateLoanPayment(principal, annualRate, years, frequency = 12) {
        const r = annualRate / 100 / frequency;
        const n = years * frequency;
        return principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    }

    static calculateAmortizationSchedule(principal, annualRate, years, frequency = 12) {
        const monthlyPayment = this.calculateLoanPayment(principal, annualRate, years, frequency);
        const schedule = [];
        let balance = principal;
        const r = annualRate / 100 / frequency;

        for (let i = 1; i <= years * frequency; i++) {
            const interest = balance * r;
            const principalPayment = monthlyPayment - interest;
            balance -= principalPayment;

            schedule.push({
                period: i,
                payment: monthlyPayment,
                principal: principalPayment,
                interest: interest,
                balance: Math.max(0, balance)
            });
        }

        return schedule;
    }

    static calculateRateOfReturn(initialValue, finalValue, cashFlows = [], periods = 1) {
        // Internal Rate of Return calculation using Newton's method
        const guess = 0.1;
        const tolerance = 0.00001;
        let rate = guess;
        
        for (let i = 0; i < 100; i++) {
            const npv = this.calculateNPV(rate, initialValue, finalValue, cashFlows);
            const derivative = this.calculateNPVDerivative(rate, initialValue, finalValue, cashFlows);
            
            const newRate = rate - npv / derivative;
            if (Math.abs(newRate - rate) < tolerance) {
                return newRate * 100; // Convert to percentage
            }
            rate = newRate;
        }

        return null; // No convergence
    }

    static calculateNPV(rate, initialValue, finalValue, cashFlows) {
        let npv = -initialValue;
        cashFlows.forEach((cf, index) => {
            npv += cf / Math.pow(1 + rate, index + 1);
        });
        npv += finalValue / Math.pow(1 + rate, cashFlows.length + 1);
        return npv;
    }

    static calculateNPVDerivative(rate, initialValue, finalValue, cashFlows) {
        let derivative = 0;
        cashFlows.forEach((cf, index) => {
            derivative -= (index + 1) * cf / Math.pow(1 + rate, index + 2);
        });
        derivative -= (cashFlows.length + 1) * finalValue / Math.pow(1 + rate, cashFlows.length + 2);
        return derivative;
    }

    static calculateInvestmentMetrics(investment) {
        const currentValue = investment.shares * (investment.currentPrice || investment.averageCost);
        const costBasis = investment.shares * investment.averageCost;
        const unrealizedGain = currentValue - costBasis;
        const unrealizedGainPercent = (unrealizedGain / costBasis) * 100;

        return {
            currentValue,
            costBasis,
            unrealizedGain,
            unrealizedGainPercent,
            averageCost: investment.averageCost,
            shares: investment.shares
        };
    }

    static calculatePortfolioAllocation(investments) {
        const total = investments.reduce((sum, inv) => {
            const value = inv.shares * (inv.currentPrice || inv.averageCost);
            return sum + value;
        }, 0);

        return investments.map(inv => {
            const value = inv.shares * (inv.currentPrice || inv.averageCost);
            return {
                symbol: inv.symbol,
                allocation: (value / total) * 100,
                value
            };
        });
    }

    static calculateDebtMetrics(debts) {
        const totalDebt = debts.reduce((sum, debt) => sum + Number(debt.balance), 0);
        const weightedRate = debts.reduce((sum, debt) => 
            sum + (Number(debt.balance) * Number(debt.interestRate)), 0) / totalDebt;
        const monthlyPayments = debts.reduce((sum, debt) => 
            sum + Number(debt.minimumPayment), 0);

        return {
            totalDebt,
            weightedInterestRate: weightedRate,
            monthlyPayments,
            debtToIncomeRatio: null // Should be calculated with income data
        };
    }

    static formatCurrency(amount, currency = 'INR', locale = 'en-IN') {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    static formatPercentage(value, decimals = 2) {
        return `${value.toFixed(decimals)}%`;
    }

    static calculateProjectedSavings(
        currentSavings,
        monthlyContribution,
        annualInterestRate,
        years,
        compoundingFrequency = 12
    ) {
        const r = annualInterestRate / 100 / compoundingFrequency;
        const n = compoundingFrequency * years;
        const PMT = monthlyContribution;

        // Future value of current savings
        const FV1 = currentSavings * Math.pow(1 + r, n);

        // Future value of monthly contributions
        const FV2 = PMT * ((Math.pow(1 + r, n) - 1) / r);

        return FV1 + FV2;
    }

    static generateSavingsProjection(
        currentSavings,
        monthlyContribution,
        annualInterestRate,
        years,
        frequency = 12
    ) {
        const projection = [];
        for (let i = 1; i <= years * frequency; i++) {
            const projected = this.calculateProjectedSavings(
                currentSavings,
                monthlyContribution,
                annualInterestRate,
                i / frequency,
                frequency
            );
            projection.push({
                period: i,
                balance: projected,
                contributions: monthlyContribution * i,
                earnings: projected - currentSavings - (monthlyContribution * i)
            });
        }
        return projection;
    }
}

module.exports = FinanceUtils;