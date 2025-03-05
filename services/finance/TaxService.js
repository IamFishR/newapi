const { TaxProfile, TaxDeduction, User } = require('../../models');
const ValidationError = require('../../utils/ValidationError');
const { Op } = require('sequelize');

class TaxService {
    async getTaxProfile(userId) {
        const currentYear = new Date().getFullYear();
        const [profile] = await TaxProfile.findOrCreate({
            where: { 
                userId,
                taxYear: currentYear
            },
            defaults: {
                filingStatus: 'single',
                estimatedIncome: 0,
                estimatedDeductions: 0,
                estimatedTaxCredits: 0,
                withholdingAmount: 0,
                estimatedTaxLiability: 0
            },
            include: [{
                model: TaxDeduction,
                as: 'deductions'
            }]
        });

        return profile;
    }

    async updateTaxProfile(userId, data) {
        const profile = await this.getTaxProfile(userId);
        await profile.update(data);
        return this.getTaxProfile(userId);
    }

    async addTaxDeduction(userId, data) {
        const profile = await this.getTaxProfile(userId);
        
        const deduction = await TaxDeduction.create({
            userId,
            taxProfileId: profile.id,
            ...data
        });

        // Update profile's estimated deductions
        await profile.update({
            estimatedDeductions: Number(profile.estimatedDeductions) + Number(data.amount)
        });

        return deduction;
    }

    async updateTaxDeduction(id, userId, data) {
        const deduction = await TaxDeduction.findOne({
            where: { id, userId }
        });

        if (!deduction) {
            throw new ValidationError('Tax deduction not found');
        }

        const profile = await this.getTaxProfile(userId);

        // If amount changed, update profile's total deductions
        if (data.amount && data.amount !== deduction.amount) {
            const difference = Number(data.amount) - Number(deduction.amount);
            await profile.update({
                estimatedDeductions: Number(profile.estimatedDeductions) + difference
            });
        }

        await deduction.update(data);
        return deduction;
    }

    async deleteTaxDeduction(id, userId) {
        const deduction = await TaxDeduction.findOne({
            where: { id, userId },
            include: [{
                model: TaxProfile,
                as: 'taxProfile'
            }]
        });

        if (!deduction) {
            throw new ValidationError('Tax deduction not found');
        }

        // Update profile's total deductions
        await deduction.taxProfile.update({
            estimatedDeductions: Number(deduction.taxProfile.estimatedDeductions) - Number(deduction.amount)
        });

        await deduction.destroy();
    }

    getTaxCalendar(userId) {
        const currentYear = new Date().getFullYear();
        
        return {
            yearlyDeadlines: [
                {
                    date: `${currentYear}-04-15`,
                    description: 'Federal Tax Return Due',
                    type: 'federal'
                },
                {
                    date: `${currentYear}-04-15`,
                    description: 'State Tax Return Due',
                    type: 'state'
                },
                {
                    date: `${currentYear}-04-15`,
                    description: 'Last day to contribute to IRA for previous year',
                    type: 'retirement'
                }
            ],
            quarterlyDeadlines: [
                {
                    date: `${currentYear}-04-15`,
                    description: 'Q1 Estimated Tax Payment Due',
                    type: 'estimated'
                },
                {
                    date: `${currentYear}-06-15`,
                    description: 'Q2 Estimated Tax Payment Due',
                    type: 'estimated'
                },
                {
                    date: `${currentYear}-09-15`,
                    description: 'Q3 Estimated Tax Payment Due',
                    type: 'estimated'
                },
                {
                    date: `${currentYear}-01-15`,
                    description: 'Q4 Estimated Tax Payment Due',
                    type: 'estimated'
                }
            ]
        };
    }

    async calculateEstimatedTaxes(userId) {
        const profile = await this.getTaxProfile(userId);
        const income = Number(profile.estimatedIncome);
        const deductions = Number(profile.estimatedDeductions);
        const credits = Number(profile.estimatedTaxCredits);
        const withholding = Number(profile.withholdingAmount);

        // Simplified tax bracket calculation (2024 single filer brackets)
        const brackets = [
            { threshold: 11600, rate: 0.10 },
            { threshold: 47150, rate: 0.12 },
            { threshold: 100525, rate: 0.22 },
            { threshold: 191950, rate: 0.24 },
            { threshold: 243725, rate: 0.32 },
            { threshold: 609350, rate: 0.35 },
            { threshold: Infinity, rate: 0.37 }
        ];

        const taxableIncome = Math.max(0, income - deductions);
        let remainingIncome = taxableIncome;
        let totalTax = 0;
        let previousThreshold = 0;

        for (const bracket of brackets) {
            const taxableInBracket = Math.min(
                remainingIncome,
                bracket.threshold - previousThreshold
            );

            if (taxableInBracket <= 0) break;

            totalTax += taxableInBracket * bracket.rate;
            remainingIncome -= taxableInBracket;
            previousThreshold = bracket.threshold;
        }

        // Apply tax credits
        totalTax = Math.max(0, totalTax - credits);

        // Calculate remaining tax due
        const remainingDue = Math.max(0, totalTax - withholding);

        await profile.update({
            estimatedTaxLiability: totalTax
        });

        return {
            taxableIncome,
            totalTax,
            effectiveRate: (totalTax / income) * 100,
            withholding,
            remainingDue,
            quarterlyPayment: remainingDue / 4
        };
    }
}

module.exports = new TaxService();