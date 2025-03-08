const { sequelize, BankAccount } = require('../../models');
const BankAccountService = require('../../services/BankAccountService');

describe('BankAccountService', () => {
    let bankAccountService;

    beforeAll(async () => {
        await sequelize.sync({ force: true });
        bankAccountService = new BankAccountService();
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('findUserAccountByNumber', () => {
        it('should find a user account by account number and bank name', async () => {
            const userId = 1;
            const accountNumber = '1234567890';
            const bankName = 'Test Bank';

            // Create a test bank account
            await BankAccount.create({
                user_id: userId,
                account_number: accountNumber,
                bank_name: bankName,
                current_balance: 1000
            });

            const account = await bankAccountService.findUserAccountByNumber(userId, accountNumber, bankName);
            expect(account).not.toBeNull();
            expect(account.account_number).toBe(accountNumber);
            expect(account.bank_name).toBe(bankName);
        });

        it('should return null if no account is found', async () => {
            const userId = 2;
            const accountNumber = '0987654321';
            const bankName = 'Nonexistent Bank';

            const account = await bankAccountService.findUserAccountByNumber(userId, accountNumber, bankName);
            expect(account).toBeNull();
        });

        it('should find account by account number', async () => {
            const mockAccount = {
                accountNumber: '123456789',
                userId: 'user123',
                balance: 1000
            };
            
            bankAccountModel.findOne.mockResolvedValue(mockAccount);
            
            const result = await bankAccountService.findUserAccountByNumber('123456789');
            expect(result).toEqual(mockAccount);
        });

        it('should throw error when account not found', async () => {
            bankAccountModel.findOne.mockResolvedValue(null);
            
            await expect(
                bankAccountService.findUserAccountByNumber('nonexistent')
            ).rejects.toThrow('Bank account not found');
        });
    });
});
