
2025-03-16 14:52:05 error: Financial Operation Error during goal_get_by_id:
 FAIL  __tests__/services/finance/finance.test.js
  ● Finance Services › FinanceService › getFinancialProfile › should return user financial profile

    TypeError: Cannot read properties of undefined (reading 'create')

      22 |     beforeAll(async () => {
      23 |         // Create test user
    > 24 |         testUser = await User.create({
         |                               ^
      25 |             id: 'test-user',
      26 |             email: 'test@example.com',
      27 |             password: 'password123',

      at Object.create (__tests__/services/finance/finance.test.js:24:31)

  ● Finance Services › FinanceService › updateFinancialProfile › should validate and update profile

    TypeError: Cannot read properties of undefined (reading 'create')

      22 |     beforeAll(async () => {
      23 |         // Create test user
    > 24 |         testUser = await User.create({
         |                               ^
      25 |             id: 'test-user',
      26 |             email: 'test@example.com',
      27 |             password: 'password123',

      at Object.create (__tests__/services/finance/finance.test.js:24:31)

  ● Finance Services › DebtService › calculatePayoffStrategy › should calculate avalanche strategy correctly

    TypeError: Cannot read properties of undefined (reading 'create')

      22 |     beforeAll(async () => {
      23 |         // Create test user
    > 24 |         testUser = await User.create({
         |                               ^
      25 |             id: 'test-user',
      26 |             email: 'test@example.com',
      27 |             password: 'password123',

      at Object.create (__tests__/services/finance/finance.test.js:24:31)

  ● Finance Services › GoalsService › addContribution › should add contribution and update goal progress

    TypeError: Cannot read properties of undefined (reading 'create')

      22 |     beforeAll(async () => {
      23 |         // Create test user
    > 24 |         testUser = await User.create({
         |                               ^
      25 |             id: 'test-user',
      26 |             email: 'test@example.com',
      27 |             password: 'password123',

      at Object.create (__tests__/services/finance/finance.test.js:24:31)

  ● Finance Services › InvestmentService › addInvestmentTransaction › should validate and record investment transaction

    TypeError: Cannot read properties of undefined (reading 'create')

      22 |     beforeAll(async () => {
      23 |         // Create test user
    > 24 |         testUser = await User.create({
         |                               ^
      25 |             id: 'test-user',
      26 |             email: 'test@example.com',
      27 |             password: 'password123',

      at Object.create (__tests__/services/finance/finance.test.js:24:31)

  ● Finance Services › InvestmentService › addInvestmentTransaction › should prevent selling more shares than owned

    TypeError: Cannot read properties of undefined (reading 'create')

      22 |     beforeAll(async () => {
      23 |         // Create test user
    > 24 |         testUser = await User.create({
         |                               ^
      25 |             id: 'test-user',
      26 |             email: 'test@example.com',
      27 |             password: 'password123',

      at Object.create (__tests__/services/finance/finance.test.js:24:31)

  ● Finance Services › NetWorthService › calculateNetWorthHistory › should calculate net worth over time correctly

    TypeError: Cannot read properties of undefined (reading 'create')

      22 |     beforeAll(async () => {
      23 |         // Create test user
    > 24 |         testUser = await User.create({
         |                               ^
      25 |             id: 'test-user',
      26 |             email: 'test@example.com',
      27 |             password: 'password123',

      at Object.create (__tests__/services/finance/finance.test.js:24:31)

  ● Finance Services › TaxService › calculateEstimatedTaxes › should calculate tax liability correctly

    TypeError: Cannot read properties of undefined (reading 'create')

      22 |     beforeAll(async () => {
      23 |         // Create test user
    > 24 |         testUser = await User.create({
         |                               ^
      25 |             id: 'test-user',
      26 |             email: 'test@example.com',
      27 |             password: 'password123',

      at Object.create (__tests__/services/finance/finance.test.js:24:31)

  ● Integration Tests › Goal-Based Savings › should track goal progress with contributions

    TypeError: Cannot read properties of undefined (reading 'create')

      199 |     beforeAll(async () => {
      200 |         // Create test user
    > 201 |         testUser = await User.create({
          |                               ^
      202 |             id: 'test-user',
      203 |             email: 'test@example.com',
      204 |             password: 'password123',

      at Object.create (__tests__/services/finance/finance.test.js:201:31)

  ● Integration Tests › Investment Portfolio Management › should calculate portfolio performance correctly

    TypeError: Cannot read properties of undefined (reading 'create')

      199 |     beforeAll(async () => {
      200 |         // Create test user
    > 201 |         testUser = await User.create({
          |                               ^
      202 |             id: 'test-user',
      203 |             email: 'test@example.com',
      204 |             password: 'password123',

      at Object.create (__tests__/services/finance/finance.test.js:201:31)

  ● Integration Tests › Budget Tracking › should enforce budget limits

    TypeError: Cannot read properties of undefined (reading 'create')

      199 |     beforeAll(async () => {
      200 |         // Create test user
    > 201 |         testUser = await User.create({
          |                               ^
      202 |             id: 'test-user',
      203 |             email: 'test@example.com',
      204 |             password: 'password123',

      at Object.create (__tests__/services/finance/finance.test.js:201:31)

  ● Error Handling › should handle invalid input data

    TypeError: FinanceService.updateFinancialProfile is not a function

      284 |     it('should handle invalid input data', async () => {
      285 |         await expect(
    > 286 |             FinanceService.updateFinancialProfile('test-user', {
          |                            ^
      287 |                 monthlyIncome: -1000
      288 |             })
      289 |         ).rejects.toThrow(ValidationError);

      at Object.updateFinancialProfile (__tests__/services/finance/finance.test.js:286:28)

  ● Error Handling › should handle non-existent resources

    expect(received).rejects.toThrow(expected)

    Expected constructor: ValidationError
    Received constructor: Error

    Received message: "Error during goal_get_by_id: Cannot read properties of undefined (reading 'findOne')"

          138 |             throw new ValidationError('Contribution amount exceeds goal target');
          139 |         }
        > 140 |         throw new Error(`Error during ${operation}: ${error.message}`);
              |               ^
          141 |     }
          142 |
          143 |     static handleBudgetError(error, operation) {

          at Function.handleGoalError (services/finance/FinanceErrorHandler.js:140:15)
          at Function.handleGoalError [as handleFinancialOperationError] (services/finance/FinanceErrorHandler.js:29:29)
          at GoalsService.handleFinancialOperationError [as getGoalById] (services/finance/GoalsService.js:81:33)
          at Object.getGoalById (__tests__/services/finance/finance.test.js:294:26)

      293 |         await expect(
      294 |             GoalsService.getGoalById('non-existent', 'test-user')
    > 295 |         ).rejects.toThrow(ValidationError);
          |                   ^
      296 |     });
      297 |
      298 |     it('should handle API errors gracefully', async () => {

      at Object.toThrow (node_modules/expect/build/index.js:218:22)
      at Object.toThrow (__tests__/services/finance/finance.test.js:295:19)


  ● Test suite failed to run

    TypeError: Cannot read properties of undefined (reading 'destroy')

      32 |     afterAll(async () => {
      33 |         // Clean up test data
    > 34 |         await User.destroy({
         |                    ^
      35 |             where: { id: 'test-user' }
      36 |         });
      37 |     });

      at Object.destroy (__tests__/services/finance/finance.test.js:34:20)

  ● Test suite failed to run

    TypeError: Cannot read properties of undefined (reading 'destroy')

      209 |     afterAll(async () => {
      210 |         // Clean up test data
    > 211 |         await User.destroy({
          |                    ^
      212 |             where: { id: 'test-user' }
      213 |         });
      214 |     });

      at Object.destroy (__tests__/services/finance/finance.test.js:211:20)

----------------------------|---------|----------|---------|---------|------------------------------------
File                        | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s                  
----------------------------|---------|----------|---------|---------|------------------------------------
All files                   |   46.16 |     4.56 |   50.19 |   47.45 |                                    
 config                     |   94.73 |       50 |     100 |   94.73 |                                    
  sequelize.js              |     100 |       50 |     100 |     100 | 60                                 
  validate.js               |   88.88 |       50 |     100 |   88.88 | 38                                 
 models                     |     100 |      100 |     100 |     100 |                                    
  index.js                  |     100 |      100 |     100 |     100 |                                    
 models/audit               |     100 |      100 |     100 |     100 |                                    
  AuditLog.js               |     100 |      100 |     100 |     100 |                                    
 models/finance             |     100 |      100 |     100 |     100 |                                    
  BankAccount.js            |     100 |      100 |     100 |     100 |                                    
  BudgetCategory.js         |     100 |      100 |     100 |     100 |                                    
  FinancialResult.js        |     100 |      100 |     100 |     100 |                                    
  index.js                  |     100 |      100 |     100 |     100 |                                    
 models/finance/assets      |     100 |      100 |     100 |     100 |                                    
  Asset.js                  |     100 |      100 |     100 |     100 |                                    
  Liability.js              |     100 |      100 |     100 |     100 |                                    
  index.js                  |     100 |      100 |     100 |     100 |                                    
 models/finance/budget      |     100 |      100 |     100 |     100 |                                    
  BudgetCategory.js         |     100 |      100 |     100 |     100 |                                    
  Transaction.js            |     100 |      100 |     100 |     100 |                                    
  index.js                  |     100 |      100 |     100 |     100 |                                    
 models/finance/debt        |     100 |      100 |     100 |     100 |                                    
  DebtItem.js               |     100 |      100 |     100 |     100 |                                    
  DebtPayment.js            |     100 |      100 |     100 |     100 |                                    
  index.js                  |     100 |      100 |     100 |     100 |                                    
 models/finance/goals       |     100 |      100 |     100 |     100 |                                    
  FinancialGoal.js          |     100 |      100 |     100 |     100 |                                    
  GoalContribution.js       |     100 |      100 |     100 |     100 |                                    
  index.js                  |     100 |      100 |     100 |     100 |                                    
 models/finance/investments |     100 |      100 |     100 |     100 |                                    
  Investment.js             |     100 |      100 |     100 |     100 |                                    
  InvestmentTransaction.js  |     100 |      100 |     100 |     100 |                                    
  index.js                  |     100 |      100 |     100 |     100 |                                    
 models/finance/profile     |     100 |      100 |     100 |     100 |                                    
  FinancialProfile.js       |     100 |      100 |     100 |     100 |                                    
  index.js                  |     100 |      100 |     100 |     100 |                                    
 models/finance/tax         |     100 |      100 |     100 |     100 |                                    
  TaxDeduction.js           |     100 |      100 |     100 |     100 |                                    
  TaxProfile.js             |     100 |      100 |     100 |     100 |                                    
  index.js                  |     100 |      100 |     100 |     100 |                                    
 models/market              |     100 |      100 |     100 |     100 |                                    
  BidAsk.js                 |     100 |      100 |     100 |     100 |                                    
  HistoricalExtreme.js      |     100 |      100 |     100 |     100 |                                    
  HistoricalPrice.js        |     100 |      100 |     100 |     100 |                                    
  MarketDepth.js            |     100 |      100 |     100 |     100 |                                    
  PriceData.js              |     100 |      100 |     100 |     100 |                                    
  PriceLimit.js             |     100 |      100 |     100 |     100 |                                    
 models/shop                |     100 |      100 |     100 |     100 |                                    
  InventoryMovement.js      |     100 |      100 |     100 |     100 |                                    
  Order.js                  |     100 |      100 |     100 |     100 |                                    
  OrderItem.js              |     100 |      100 |     100 |     100 |                                    
  OrderStatusHistory.js     |     100 |      100 |     100 |     100 |                                    
  Product.js                |     100 |      100 |     100 |     100 |                                    
  ProductPriceHistory.js    |     100 |      100 |     100 |     100 |                                    
  ProductTag.js             |     100 |      100 |     100 |     100 |                                    
  Shop.js                   |     100 |      100 |     100 |     100 |                                    
  ShopAuditLog.js           |     100 |      100 |     100 |     100 |                                    
  ShopCategory.js           |     100 |      100 |     100 |     100 |                                    
 models/stock               |     100 |      100 |     100 |     100 |                                    
  Announcement.js           |     100 |      100 |     100 |     100 |                                    
  BoardMeeting.js           |     100 |      100 |     100 |     100 |                                    
  Company.js                |     100 |      100 |     100 |     100 |                                    
  CompanyIndex.js           |     100 |      100 |     100 |     100 |                                    
  CorporateAction.js        |     100 |      100 |     100 |     100 |                                    
  DeliveryPosition.js       |     100 |      100 |     100 |     100 |                                    
  RiskMetric.js             |     100 |      100 |     100 |     100 |                                    
  SecurityInfo.js           |     100 |      100 |     100 |     100 |                                    
  ShareholdingPattern.js    |     100 |      100 |     100 |     100 |                                    
 models/task                |     100 |      100 |     100 |     100 |                                    
  Project.js                |     100 |      100 |     100 |     100 |                                    
  Sprint.js                 |     100 |      100 |     100 |     100 |                                    
  Task.js                   |     100 |      100 |     100 |     100 |                                    
  TaskAssignmentHistory.js  |     100 |      100 |     100 |     100 |                                    
  TaskAttachment.js         |     100 |      100 |     100 |     100 |                                    
  TaskAuditLog.js           |     100 |      100 |     100 |     100 |                                    
  TaskComment.js            |     100 |      100 |     100 |     100 |                                    
  TaskLabel.js              |     100 |      100 |     100 |     100 |                                    
  TaskMetrics.js            |     100 |      100 |     100 |     100 |                                    
  TaskPriority.js           |     100 |      100 |     100 |     100 |                                    
  TaskStatusHistory.js      |     100 |      100 |     100 |     100 |                                    
  TaskTimeLog.js            |     100 |      100 |     100 |     100 |                                    
  TaskType.js               |     100 |      100 |     100 |     100 |                                    
 models/user                |   89.39 |        0 |   81.81 |   89.39 |                                    
  Notification.js           |     100 |      100 |     100 |     100 |                                    
  Permission.js             |     100 |      100 |     100 |     100 |                                    
  Portfolio.js              |     100 |      100 |     100 |     100 |                                    
  Role.js                   |     100 |      100 |     100 |     100 |                                    
  Transaction.js            |      80 |        0 |   66.66 |      80 | 91-92                              
  User.js                   |   70.58 |        0 |      40 |   70.58 | 25,59-65                           
  UserPreference.js         |     100 |      100 |     100 |     100 |                                    
  UserSession.js            |     100 |      100 |     100 |     100 |                                    
  WatchList.js              |     100 |      100 |     100 |     100 |                                    
 services/finance           |    7.96 |     2.43 |    3.27 |    8.35 |                                    
  DebtService.js            |    5.43 |        0 |       0 |    5.68 | 8-224                              
  FinanceErrorHandler.js    |   12.35 |     8.57 |   15.38 |   12.35 | 10,15,21-27,31-130,135,138,144-186 
  FinanceService.js         |    2.89 |        0 |       0 |    3.16 | 15-534                             
  GoalsService.js           |   10.38 |        0 |   11.11 |   10.66 | 8-66,86-212                        
  InvestmentService.js      |   11.94 |     3.57 |   11.11 |    12.3 | 8-33,43-193                        
  NetWorthService.js        |    4.58 |        0 |       0 |     4.9 | 8-253                              
  TaxService.js             |    7.84 |        0 |       0 |       8 | 7-189                              
  index.js                  |     100 |      100 |     100 |     100 |                                    
 services/market            |      75 |      100 |      50 |      75 |                                    
  MarketDataService.js      |      75 |      100 |      50 |      75 | 4                                  
 services/monitoring        |   47.05 |     37.5 |      40 |      50 |                                    
  DbLoggingService.js       |   47.05 |     37.5 |      40 |      50 | 12-24,31                           
 utils                      |   88.88 |      100 |   66.66 |   88.88 |                                    
  ValidationError.js        |      80 |      100 |      50 |      80 | 9                                  
  logger.js                 |     100 |      100 |     100 |     100 |                                    
----------------------------|---------|----------|---------|---------|------------------------------------
Test Suites: 1 failed, 1 total
Tests:       13 failed, 1 passed, 14 total
Snapshots:   0 total
Time:        3.171 s