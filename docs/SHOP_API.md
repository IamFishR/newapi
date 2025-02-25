# Shop Management API Documentation

This document outlines the available endpoints for shop management, including shops, products, categories, and inventory management.

## Authentication

All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## Shop Endpoints

### Create Shop
`POST /api/shop/shops`

Creates a new shop.

**Request Body:**
```json
{
  "name": "My Shop",
  "description": "Shop description",
  "address": "123 Main St",
  "phone": "+1234567890",
  "email": "shop@example.com",
  "business_hours": {
    "monday": "9:00-17:00",
    "tuesday": "9:00-17:00",
    "wednesday": "9:00-17:00",
    "thursday": "9:00-17:00",
    "friday": "9:00-17:00"
  }
}
```

**Response:** (201 Created)
```json
{
  "id": 1,
  "name": "My Shop",
  "description": "Shop description",
  "address": "123 Main St",
  "phone": "+1234567890",
  "email": "shop@example.com",
  "business_hours": {
    "monday": "9:00-17:00",
    "tuesday": "9:00-17:00",
    "wednesday": "9:00-17:00",
    "thursday": "9:00-17:00",
    "friday": "9:00-17:00"
  },
  "is_active": true,
  "created_by": 1,
  "created_at": "2024-02-25T12:00:00Z",
  "updated_at": "2024-02-25T12:00:00Z"
}
```

### List Shops
`GET /api/shop/shops`

Retrieves a list of shops with pagination and filtering options.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by shop name
- `is_active` (optional): Filter by active status

**Response:** (200 OK)
```json
{
  "count": 1,
  "rows": [
    {
      "id": 1,
      "name": "My Shop",
      "description": "Shop description",
      "address": "123 Main St",
      "phone": "+1234567890",
      "email": "shop@example.com",
      "business_hours": {},
      "is_active": true,
      "products": []
    }
  ]
}
```

### Get Shop Details
`GET /api/shop/shops/:id`

Retrieves detailed information about a specific shop.

**Response:** (200 OK)
```json
{
  "id": 1,
  "name": "My Shop",
  "description": "Shop description",
  "address": "123 Main St",
  "phone": "+1234567890",
  "email": "shop@example.com",
  "business_hours": {},
  "is_active": true,
  "products": [
    {
      "id": 1,
      "name": "Product 1",
      "price": 99.99,
      "category": {
        "id": 1,
        "name": "Category 1"
      }
    }
  ]
}
```

### Update Shop
`PUT /api/shop/shops/:id`

Updates an existing shop.

**Request Body:**
```json
{
  "name": "Updated Shop Name",
  "description": "Updated description",
  "address": "456 New St",
  "phone": "+1987654321",
  "email": "updated@example.com",
  "business_hours": {},
  "is_active": true
}
```

**Response:** (200 OK)
```json
{
  "id": 1,
  "name": "Updated Shop Name",
  "description": "Updated description",
  "address": "456 New St",
  "phone": "+1987654321",
  "email": "updated@example.com",
  "business_hours": {},
  "is_active": true,
  "updated_at": "2024-02-25T13:00:00Z"
}
```

### Delete Shop
`DELETE /api/shop/shops/:id`

Deletes a shop (only by the creator).

**Response:** (204 No Content)

## Product Endpoints

### Create Product
`POST /api/shop/products`

Creates a new product.

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "sku": "PROD001",
  "barcode": "123456789",
  "price": 99.99,
  "cost_price": 50.00,
  "quantity": 100,
  "minimum_quantity": 10,
  "category_id": 1,
  "shop_id": 1
}
```

**Response:** (201 Created)
```json
{
  "id": 1,
  "name": "New Product",
  "description": "Product description",
  "sku": "PROD001",
  "barcode": "123456789",
  "price": 99.99,
  "cost_price": 50.00,
  "quantity": 100,
  "minimum_quantity": 10,
  "category_id": 1,
  "shop_id": 1,
  "is_active": true,
  "created_by": 1,
  "created_at": "2024-02-25T12:00:00Z",
  "updated_at": "2024-02-25T12:00:00Z"
}
```

### List Products
`GET /api/shop/products`

Retrieves a list of products with pagination and filtering options.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name, SKU, or barcode
- `category_id` (optional): Filter by category
- `shop_id` (optional): Filter by shop
- `is_active` (optional): Filter by active status

**Response:** (200 OK)
```json
{
  "count": 1,
  "rows": [
    {
      "id": 1,
      "name": "New Product",
      "price": 99.99,
      "quantity": 100,
      "shop": {
        "id": 1,
        "name": "My Shop"
      },
      "category": {
        "id": 1,
        "name": "Category 1"
      }
    }
  ]
}
```

### Get Product Details
`GET /api/shop/products/:id`

Retrieves detailed information about a specific product.

**Response:** (200 OK)
```json
{
  "id": 1,
  "name": "New Product",
  "description": "Product description",
  "sku": "PROD001",
  "barcode": "123456789",
  "price": 99.99,
  "cost_price": 50.00,
  "quantity": 100,
  "minimum_quantity": 10,
  "category": {
    "id": 1,
    "name": "Category 1"
  },
  "shop": {
    "id": 1,
    "name": "My Shop"
  },
  "is_active": true
}
```

### Update Product
`PUT /api/shop/products/:id`

Updates an existing product.

**Request Body:**
```json
{
  "name": "Updated Product",
  "description": "Updated description",
  "price": 149.99,
  "quantity": 200,
  "is_active": true
}
```

**Response:** (200 OK)
```json
{
  "id": 1,
  "name": "Updated Product",
  "description": "Updated description",
  "price": 149.99,
  "quantity": 200,
  "is_active": true,
  "updated_at": "2024-02-25T13:00:00Z"
}
```

### Delete Product
`DELETE /api/shop/products/:id`

Deletes a product (only by the creator).

**Response:** (204 No Content)

## Order Endpoints

### Create Order
`POST /api/shop/orders`

Creates a new order with the specified products.

**Request Body:**
```json
{
  "shop_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 2,
      "quantity": 1
    }
  ],
  "notes": "Please deliver to back entrance"
}
```

**Response:** (201 Created)
```json
{
  "id": 1,
  "shop_id": 1,
  "total_amount": 249.97,
  "status": "pending",
  "notes": "Please deliver to back entrance",
  "created_by": 1,
  "created_at": "2024-02-25T12:00:00Z",
  "updated_at": "2024-02-25T12:00:00Z",
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "quantity": 2,
      "unit_price": 99.99,
      "total_price": 199.98,
      "product": {
        "id": 1,
        "name": "Product 1",
        "sku": "PROD001"
      }
    },
    {
      "id": 2,
      "product_id": 2,
      "quantity": 1,
      "unit_price": 49.99,
      "total_price": 49.99,
      "product": {
        "id": 2,
        "name": "Product 2",
        "sku": "PROD002"
      }
    }
  ],
  "shop": {
    "id": 1,
    "name": "My Shop"
  }
}
```

### List Orders
`GET /api/shop/orders`

Retrieves a list of orders with pagination and filtering options.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `shop_id` (optional): Filter by shop
- `status` (optional): Filter by order status

**Response:** (200 OK)
```json
{
  "count": 1,
  "rows": [
    {
      "id": 1,
      "shop_id": 1,
      "total_amount": 249.97,
      "status": "pending",
      "items": [
        {
          "product": {
            "name": "Product 1",
            "sku": "PROD001"
          },
          "quantity": 2,
          "total_price": 199.98
        }
      ],
      "shop": {
        "name": "My Shop"
      }
    }
  ]
}
```

### Get Order Details
`GET /api/shop/orders/:id`

Retrieves detailed information about a specific order.

**Response:** (200 OK)
```json
{
  "id": 1,
  "shop_id": 1,
  "total_amount": 249.97,
  "status": "pending",
  "notes": "Please deliver to back entrance",
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "quantity": 2,
      "unit_price": 99.99,
      "total_price": 199.98,
      "product": {
        "id": 1,
        "name": "Product 1",
        "sku": "PROD001",
        "description": "Product description"
      }
    }
  ],
  "shop": {
    "id": 1,
    "name": "My Shop"
  },
  "created_at": "2024-02-25T12:00:00Z",
  "updated_at": "2024-02-25T12:00:00Z"
}
```

### Update Order Status
`PATCH /api/shop/orders/:id/status`

Updates the status of an existing order.

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Response:** (200 OK)
```json
{
  "id": 1,
  "status": "confirmed",
  "updated_at": "2024-02-25T13:00:00Z"
}
```

**Valid Status Values:**
- `pending`: Initial state of the order
- `confirmed`: Order has been confirmed by the shop
- `processing`: Order is being prepared
- `shipped`: Order has been shipped
- `delivered`: Order has been delivered
- `cancelled`: Order has been cancelled

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request data",
  "details": {
    "field": ["validation error message"]
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Not authorized to perform this action"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Audit Logs

All create, update, and delete operations are automatically logged in the audit trail. Each log entry contains:
- The type of operation (CREATE, UPDATE, DELETE)
- The entity affected (shop, product, category)
- The old and new values (for updates)
- The user who performed the action
- Timestamp of the action

## Rate Limiting

API endpoints are subject to rate limiting:
- 100 requests per minute per IP address
- 1000 requests per hour per user

When rate limit is exceeded, the API will return:

```json
{
  "error": "Rate limit exceeded",
  "retry_after": 60
}