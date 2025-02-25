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
- **Response**:
```json
{
    "status": "success",
    "data": [
        {
            "symbol": "string",
            "name": "string",
            "other_company_data": "..."
        }
    ]
}
```

### Get Company by Symbol
- **URL**: `/companies/:symbol`
- **Method**: `GET`
- **Response**:
```json
{
    "status": "success",
    "data": {
        "symbol": "string",
        "company_details": "..."
    }
}
```

### Get Companies by Industry
- **URL**: `/companies/industry/:industry`
- **Method**: `GET`
- **Response**: List of companies in the industry

### Get Company with Latest Price
- **URL**: `/companies/:symbol/with-price`
- **Method**: `GET`
- **Response**: Company data with latest price information

### Get Company Financial Data
- **URL**: `/companies/:symbol/financials`
- **Method**: `GET`
- **Response**: Company financial information

### Get Corporate Actions
- **URL**: `/companies/:symbol/corporate-actions`
- **Method**: `GET`
- **Response**: List of corporate actions

### Get Board Meetings
- **URL**: `/companies/:symbol/board-meetings`
- **Method**: `GET`
- **Response**: List of board meetings

### Get Shareholding Patterns
- **URL**: `/companies/:symbol/shareholding-patterns`
- **Method**: `GET`
- **Response**: Shareholding pattern data

### Get Security Info
- **URL**: `/companies/:symbol/security-info`
- **Method**: `GET`
- **Response**: Security information

### Get Risk Metrics
- **URL**: `/companies/:symbol/risk-metrics`
- **Method**: `GET`
- **Response**: Risk metrics data

### Get Delivery Positions
- **URL**: `/companies/:symbol/delivery-positions`
- **Method**: `GET`
- **Response**: Delivery positions data

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