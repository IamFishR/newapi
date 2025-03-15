'use strict';

const { BankAccount } = require('../../models');
const { sequelize } = require('../../config/sequelize');

describe('BankAccount Model', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    afterEach(async () => {
        await BankAccount.destroy({ where: {} });
    });

    const validBankAccount = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        account_number: '1234',
        account_name: 'Test Account',
        account_type: 'savings',
        branch_name: 'Test Branch',
        ifsc_code: '12345678901',
        micr_code: '123456789',
        currency: 'INR',
        is_primary: true,
        opening_balance: 1000.00,
        current_balance: 1000.00
    };

    describe('Validation', () => {
        it('should create a valid bank account', async () => {
            const account = await BankAccount.create(validBankAccount);
            expect(account).toBeDefined();
            expect(account.account_number).toBe('1234');
        });

        it('should fail if account number is not 4 digits', async () => {
            const invalidAccount = { ...validBankAccount, account_number: '123' };
            await expect(BankAccount.create(invalidAccount)).rejects.toThrow();
        });

        it('should fail if IFSC code is invalid length', async () => {
            const invalidAccount = { ...validBankAccount, ifsc_code: '123' };
            await expect(BankAccount.create(invalidAccount)).rejects.toThrow();
        });

        it('should fail if MICR code is invalid length', async () => {
            const invalidAccount = { ...validBankAccount, micr_code: '123' };
            await expect(BankAccount.create(invalidAccount)).rejects.toThrow();
        });

        it('should fail if currency is not 3 characters', async () => {
            const invalidAccount = { ...validBankAccount, currency: 'INVALID' };
            await expect(BankAccount.create(invalidAccount)).rejects.toThrow();
        });

        it('should not allow negative balances', async () => {
            const invalidAccount = { ...validBankAccount, opening_balance: -1000 };
            await expect(BankAccount.create(invalidAccount)).rejects.toThrow();
        });
    });

    describe('Primary Account Management', () => {
        it('should set other accounts as non-primary when creating a new primary account', async () => {
            // Create first primary account
            const account1 = await BankAccount.create(validBankAccount);
            expect(account1.is_primary).toBe(true);

            // Create second primary account
            const account2 = await BankAccount.create({
                ...validBankAccount,
                account_number: '5678'
            });

            // Reload first account
            await account1.reload();
            expect(account1.is_primary).toBe(false);
            expect(account2.is_primary).toBe(true);
        });

        it('should allow multiple non-primary accounts', async () => {
            const account1 = await BankAccount.create({
                ...validBankAccount,
                is_primary: false
            });
            const account2 = await BankAccount.create({
                ...validBankAccount,
                account_number: '5678',
                is_primary: false
            });

            expect(account1.is_primary).toBe(false);
            expect(account2.is_primary).toBe(false);
        });
    });

    describe('Instance Methods', () => {
        it('should update current balance correctly', async () => {
            const account = await BankAccount.create(validBankAccount);
            await account.update({ current_balance: 2000.00 });
            expect(account.current_balance).toBe(2000.00);
        });
    });
});