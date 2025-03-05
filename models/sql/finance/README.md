# Finance Database Structure

This directory contains all finance-related database table definitions, organized by domain.

## Directory Structure

```
finance/
├── profile/        # User financial profiles
├── budget/         # Budget categories and transactions
├── investments/    # Investment holdings and transactions
├── debt/          # Debt items and payments
├── goals/         # Financial goals and contributions
├── assets/        # Assets and liabilities
└── tax/           # Tax profiles and deductions
```

## Dependencies

Tables should be created in the following order to maintain referential integrity:

1. profile/tables.sql
   - financial_profiles (depends on users)

2. budget/tables.sql
   - budget_categories (depends on users)
   - transactions (depends on users, budget_categories)

3. investments/tables.sql
   - investments (depends on users)
   - investment_transactions (depends on users, investments)

4. debt/tables.sql
   - debt_items (depends on users)
   - debt_payments (depends on users, debt_items)

5. goals/tables.sql
   - financial_goals (depends on users)
   - goal_contributions (depends on users, financial_goals)

6. assets/tables.sql
   - assets (depends on users)
   - liabilities (depends on users)

7. tax/tables.sql
   - tax_profiles (depends on users)
   - tax_deductions (depends on users, tax_profiles)

## Indexing Strategy

Each domain includes its own performance optimization indexes based on common query patterns. Key indexes include:

- User-based filtering (user_id)
- Date-based queries (created_at, date, due_date)
- Relationship-based lookups (foreign key columns)
- Common filtering criteria (type, status, category)