# API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Users](#users)
3. [Companies](#companies)
4. [Market Data](#market-data)
5. [Financial Data](#financial-data)
6. [Monitoring](#monitoring)

## Authentication

### Register User
- **URL**: `/users/register`
- **Method**: `POST`
- **Rate Limit**: Strict rate limiting applied
- **Payload**:
```json
{
    "username": "string",
    "email": "string",
    "password": "string"
}
```
- **Response**:
```json
{
    "status": "success",
    "data": {
        "user_id": "string",
        "name": "string",
        "email": "string"
    }
}
```

### Login
- **URL**: `/users/authenticate`
- **Method**: `POST`
- **Rate Limit**: Strict rate limiting applied
- **Payload**:
```json
{
    "email": "string",
    "password": "string"
}
```
- **Response**:
```json
{
    "user_id": "string",
    "name": "string",
    "email": "string",
    "session_token": "string"
}
```

### Logout
- **URL**: `/users/signout`
- **Method**: `POST`
- **Authentication**: Required
- **Response**:
```json
{
    "message": "Sign out successful"
}
```

## Users

### Get User Profile
- **URL**: `/users/profile`
- **Method**: `GET`
- **Authentication**: Required
- **Response**: User profile data

### Update User Profile
- **URL**: `/users/profile`
- **Method**: `PUT`
- **Authentication**: Required
- **Payload**: Updated user data
- **Response**: Updated user profile

### Get User Preferences
- **URL**: `/users/preferences`
- **Method**: `GET`
- **Authentication**: Required
- **Response**: User preferences data

### Update User Preferences
- **URL**: `/users/preferences`
- **Method**: `PUT`
- **Authentication**: Required
- **Payload**: Updated preferences data
- **Response**: Updated preferences

## Companies

### Get All Companies
- **URL**: `/companies`
- **Method**: `GET`
- **Auth**: Required
- **Response**:
```json
{
    "status": "success",
    "data": [
        {
            "symbol": "string",
            "company_name": "string",
            "isin": "string",
            "listing_date": "date",
            "face_value": "number",
            "issued_size": "number"
        }
    ]
}
```

### Get Company by Symbol
- **URL**: `/companies/:symbol`
- **Method**: `GET`
- **Auth**: Required
- **Response**:
```json
{
    "status": "success",
    "data": {
        "symbol": "string",
        "company_name": "string",
        "isin": "string",
        "listing_date": "date",
        "face_value": "number",
        "issued_size": "number"
    }
}
```

### Create Company
- **URL**: `/companies`
- **Method**: `POST`
- **Auth**: Required (admin/system only)
- **Body**:
```json
{
    "symbol": "string",
    "company_name": "string",
    "isin": "string",
    "listing_date": "date",
    "face_value": "number",
    "issued_size": "number"
}
```
- **Response**:
```json
{
    "status": "success",
    "data": {
        "symbol": "string",
        "company_name": "string",
        "isin": "string",
        "listing_date": "date",
        "face_value": "number",
        "issued_size": "number"
    }
}
```

### Update Company
- **URL**: `/companies/:symbol`
- **Method**: `PUT`
- **Auth**: Required (admin/system only)
- **Body**:
```json
{
    "company_name": "string",
    "isin": "string",
    "listing_date": "date",
    "face_value": "number",
    "issued_size": "number"
}
```
- **Response**:
```json
{
    "status": "success",
    "data": {
        "symbol": "string",
        "company_name": "string",
        "isin": "string",
        "listing_date": "date",
        "face_value": "number",
        "issued_size": "number"
    }
}
```

### Delete Company
- **URL**: `/companies/:symbol`
- **Method**: `DELETE`
- **Auth**: Required (admin/system only)
- **Response**:
```json
{
    "status": "success",
    "message": "Company deleted successfully"
}
```

### Get Company with Latest Price
- **URL**: `/companies/:symbol/with-price`
- **Method**: `GET`
- **Auth**: Required
- **Response**:
```json
{
    "status": "success",
    "data": {
        "symbol": "string",
        "company_name": "string",
        "priceData": {
            "last_price": "number",
            "date": "string"
        }
    }
}
```

### Get Company Financial Results
- **URL**: `/companies/:symbol/financials`
- **Method**: `GET`
- **Auth**: Required
- **Response**:
```json
{
    "status": "success",
    "data": {
        "symbol": "string",
        "company_name": "string",
        "financialResults": [
            {
                "to_date": "string",
                "income": "number",
                "expenditure": "number",
                "profit_before_tax": "number",
                "profit_after_tax": "number",
                "eps": "number"
            }
        ]
    }
}
```

### Get Company Indices
- **URL**: `/companies/:symbol/indices`
- **Method**: `GET`
- **Auth**: Required
- **Response**:
```json
{
    "status": "success",
    "data": [
        {
            "symbol": "string",
            "index_name": "string"
        }
    ]
}
```

### Get Corporate Actions
- **URL**: `/companies/:symbol/corporate-actions`
- **Method**: `GET`
- **Auth**: Required
- **Response**:
```json
{
    "status": "success",
    "data": [
        {
            "ex_date": "string",
            "purpose": "string"
        }
    ]
}
```

### Get Board Meetings
- **URL**: `/companies/:symbol/board-meetings`
- **Method**: `GET`
- **Auth**: Required
- **Response**:
```json
{
    "status": "success",
    "data": [
        {
            "meeting_date": "string",
            "purpose": "string"
        }
    ]
}
```

### Get Shareholding Pattern
- **URL**: `/companies/:symbol/shareholding-patterns`
- **Method**: `GET`
- **Auth**: Required
- **Response**:
```json
{
    "status": "success",
    "data": [
        {
            "period_end_date": "string",
            "promoter_group_percentage": "number",
            "public_percentage": "number",
            "employee_trusts_percentage": "number"
        }
    ]
}
```

### Get Security Info
- **URL**: `/companies/:symbol/security-info`
- **Method**: `GET`
- **Auth**: Required
- **Response**:
```json
{
    "status": "success",
    "data": {
        "board_status": "string",
        "trading_status": "string",
        "trading_segment": "string",
        "slb": "string",
        "class_of_share": "string",
        "derivatives": "string"
    }
}
```

### Get Risk Metrics
- **URL**: `/companies/:symbol/risk-metrics`
- **Method**: `GET`
- **Auth**: Required
- **Response**:
```json
{
    "status": "success",
    "data": {
        "impact_cost": "number",
        "daily_volatility": "number",
        "annual_volatility": "number",
        "security_var": "number",
        "index_var": "number",
        "var_margin": "number",
        "extreme_loss_margin": "number",
        "adhoc_margin": "number",
        "applicable_margin": "number"
    }
}
```

### Get Delivery Positions
- **URL**: `/companies/:symbol/delivery-positions`
- **Method**: `GET`
- **Auth**: Required
- **Response**:
```json
{
    "status": "success",
    "data": [
        {
            "date": "string",
            "quantity_traded": "number",
            "delivery_quantity": "number",
            "delivery_percentage": "number"
        }
    ]
}
```

### Get Comprehensive Data
- **URL**: `/companies/:symbol/comprehensive`
- **Method**: `GET`
- **Auth**: Required
- **Response**:
```json
{
    "status": "success",
    "data": {
        "symbol": "string",
        "company_name": "string",
        "priceData": {},
        "financialResults": [],
        "securityInfo": {},
        "riskMetrics": {},
        "deliveryPositions": []
    }
}
```

### Error Responses

#### Not Found (404)
```json
{
    "status": "fail",
    "message": "Company not found"
}
```

#### Validation Error (400)
```json
{
    "status": "fail",
    "message": "Validation Error",
    "errors": [
        // Validation error details
    ]
}
```

#### Permission Error (403)
```json
{
    "status": "fail",
    "message": "Insufficient role permissions"
}
```

## Market Data

### Get Latest Price Data
- **URL**: `/market-data/price-data`
- **Method**: `GET`
- **Response**: Latest price data for all symbols

### Get Price Data by Symbol
- **URL**: `/market-data/price-data/:symbol`
- **Method**: `GET`
- **Response**: Price data for specific symbol

### Get Price Data Range
- **URL**: `/market-data/price-data/:symbol/range`
- **Method**: `GET`
- **Query Parameters**: 
  - startDate: ISO date
  - endDate: ISO date
- **Response**: Price data within date range

### Get Historical Prices
- **URL**: `/market-data/historical-prices/:symbol`
- **Method**: `GET`
- **Query Parameters**:
  - marketType: string
  - limit: number (optional)
- **Response**: Historical price data

### Get Price Limits
- **URL**: `/market-data/price-limits/:symbol`
- **Method**: `GET`
- **Response**: Price limits data

### Get Market Depth
- **URL**: `/market-data/market-depth/:symbol`
- **Method**: `GET`
- **Response**: Market depth information

### Get Historical Extremes
- **URL**: `/market-data/historical-extremes/:symbol`
- **Method**: `GET`
- **Response**: Historical extreme values

## Financial Data

### Get All Financial Results
- **URL**: `/financial-data/results`
- **Method**: `GET`
- **Query Parameters**:
  - limit: number (default: 20)
  - offset: number (default: 0)
- **Response**: List of financial results

### Get Financial Results by Symbol
- **URL**: `/financial-data/results/:symbol`
- **Method**: `GET`
- **Response**: Financial results for symbol

### Get Latest Financial Result
- **URL**: `/financial-data/results/:symbol/latest`
- **Method**: `GET`
- **Response**: Latest financial result

### Get Financial Results for Period
- **URL**: `/financial-data/results/:symbol/period`
- **Method**: `GET`
- **Query Parameters**:
  - fromDate: ISO date
  - toDate: ISO date
  - isConsolidated: boolean
- **Response**: Financial results for period

### Get Audited Financial Results
- **URL**: `/financial-data/results/audited`
- **Method**: `GET`
- **Response**: List of audited financial results

## Monitoring

### Health Check
- **URL**: `/monitoring/health`
- **Method**: `GET`
- **Response**:
```json
{
    "status": "ok",
    "uptime": "number",
    "timestamp": "ISO date string",
    "connections": "number"
}
```

### Detailed Metrics (Admin Only)
- **URL**: `/monitoring/metrics`
- **Method**: `GET`
- **Authentication**: Required (Admin)
- **Response**: Detailed system metrics

## Common Response Formats

### Success Response
```json
{
    "status": "success",
    "data": {
        // Response data
    }
}
```

### Error Response
```json
{
    "status": "fail",
    "message": "Error description"
}
```

### Validation Error Response
```json
{
    "status": "fail",
    "message": "Validation Error",
    "errors": [
        // Validation error details
    ]
}
```

## Notes
- All routes are rate-limited
- Authentication is required for protected endpoints
- Dates should be provided in ISO format
- Admin endpoints require appropriate role permissions