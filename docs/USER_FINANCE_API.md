# Finance API Documentation

## Overview
This document describes the API endpoints for managing personal finances, including budgeting, investments, debt management, goals, and tax planning.

## Base URL
```
/api/finance
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Common Response Format
```json
{
    "status": "success|error",
    "data": {},
    "message": "Operation successful|Error message"
}
```

## Endpoints

### Financial Profile

#### GET /profile
Get user's financial profile.

Response:
```json
{
    "monthlyIncome": 5000,
    "monthlySavingsGoal": 1000,
    "currentSavings": 15000,
    "monthlyExpenses": {
        "housing": 1500,
        "utilities": 200,
        "transportation": 300,
        "groceries": 400,
        "healthcare": 200,
        "entertainment": 300,
        "other": 100
    },
    "investmentProfile": {
        "currentInvestments": 50000,
        "monthlyInvestmentGoal": 500,
        "riskTolerance": "medium"
    }
}
```

#### PUT /profile
Update financial profile.

### Budget Management

#### GET /budget/categories
Get all budget categories.

#### POST /budget/categories
Create a new budget category.

#### PUT /budget/categories/:id
Update a budget category.

#### GET /budget/transactions
Get budget transactions with optional filters:
- startDate
- endDate
- categoryId
- type (income|expense)

#### POST /budget/transactions
Record a new transaction.

### Debt Management

#### GET /debt
Get all debt items.

#### POST /debt
Add a new debt item.

#### PUT /debt/:id
Update debt details.

#### POST /debt/:id/payment
Record a debt payment.

#### GET /debt/analytics
Get debt analytics and payoff strategies.

### Financial Goals

#### GET /goals
Get all financial goals.

#### POST /goals
Create a new financial goal.

#### PUT /goals/:id
Update a financial goal.

#### POST /goals/:id/contribution
Add a contribution to a goal.

#### GET /goals/analytics
Get goal progress analytics.

### Investment Management

#### GET /investments
Get investment portfolio.

#### POST /investments
Add a new investment.

#### PUT /investments/:id
Update investment details.

#### POST /investments/:id/transaction
Record an investment transaction (buy/sell).

#### GET /investments/analytics
Get portfolio analytics and performance metrics.

### Net Worth Tracking

#### GET /networth
Get current net worth breakdown.

#### GET /networth/history
Get net worth history with optional date range.

#### GET /networth/analytics
Get net worth analytics and trends.

### Tax Planning

#### GET /tax/profile
Get tax profile for current year.

#### PUT /tax/profile
Update tax profile.

#### POST /tax/deductions
Add a tax deduction.

#### GET /tax/deductions
Get all tax deductions.

#### GET /tax/calendar
Get tax deadlines and important dates.

#### GET /tax/estimates
Get estimated tax calculations.

## Error Codes

- 400: Bad Request - Invalid input data
- 401: Unauthorized - Missing or invalid token
- 403: Forbidden - Insufficient permissions
- 404: Not Found - Resource not found
- 409: Conflict - Resource conflict
- 500: Internal Server Error

## Rate Limits

- Standard rate limit: 100 requests per minute
- Bulk operations: 20 requests per minute
- Market data operations: 50 requests per minute

## Additional Information

### Date Formats
All dates should be provided in ISO 8601 format: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ssZ`

### Numerical Values
- All monetary values are stored and returned with 2 decimal places
- Percentages are stored and returned with 2 decimal places
- Investment shares are stored with 6 decimal places

### Pagination
For endpoints that return lists, use query parameters:
- page (default: 1)
- limit (default: 20, max: 100)
- sort (field to sort by)
- order (asc|desc)

### Webhooks
Available webhook events:
- finance.transaction.created
- finance.goal.reached
- finance.investment.priceAlert
- finance.debt.paymentDue
- finance.tax.deadlineApproaching