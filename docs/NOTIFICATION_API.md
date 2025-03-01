# Notification API Documentation

This document outlines the API endpoints for managing user notifications in the system.

## Base URL

All API routes are prefixed with `/users`.

## Authentication

All notification endpoints require authentication using a session token. Send the token via cookie `exapis_session` with your requests.

## Error Responses

Error responses follow this format:

```json
{
  "error": "Error message description"
}
```

HTTP status codes:
- 400: Bad Request - Invalid input
- 401: Unauthorized - Authentication required
- 403: Forbidden - Insufficient permissions
- 404: Not Found - Resource not found
- 500: Internal Server Error - Server error

## Endpoints

### Get All Notifications

Retrieves all notifications for the authenticated user.

**URL**: `/users/notifications`  
**Method**: `GET`  
**Authentication**: Required

**Response**:
```json
[
  {
    "id": 1,
    "user_id": 123,
    "message": "Your order #1234 has been shipped",
    "is_read": false,
    "timestamp": "2025-03-01T14:22:10.123Z"
  },
  {
    "id": 2,
    "user_id": 123,
    "message": "New market report available",
    "is_read": true,
    "timestamp": "2025-03-01T10:15:22.456Z"
  }
]
```

### Get Notification by ID

Retrieves a specific notification by its ID.

**URL**: `/users/notifications/:id`  
**Method**: `GET`  
**Authentication**: Required  
**URL Parameters**: `id=[integer]` - ID of the notification

**Response**:
```json
{
  "id": 1,
  "user_id": 123,
  "message": "Your order #1234 has been shipped",
  "is_read": false,
  "timestamp": "2025-03-01T14:22:10.123Z"
}
```

### Mark Notification as Read

Marks a specific notification as read.

**URL**: `/users/notifications/:id/read`  
**Method**: `PUT`  
**Authentication**: Required  
**URL Parameters**: `id=[integer]` - ID of the notification

**Response**:
```json
{
  "status": "success",
  "message": "Notification marked as read"
}
```

### Mark All Notifications as Read

Marks all unread notifications for the authenticated user as read.

**URL**: `/users/notifications/read-all`  
**Method**: `PUT`  
**Authentication**: Required

**Response**:
```json
{
  "status": "success",
  "message": "All notifications marked as read"
}
```

### Delete Notification

Deletes a specific notification.

**URL**: `/users/notifications/:id`  
**Method**: `DELETE`  
**Authentication**: Required  
**URL Parameters**: `id=[integer]` - ID of the notification

**Response**:
```json
{
  "status": "success",
  "message": "Notification deleted"
}
```

### Get Unread Notification Count

Returns the count of unread notifications for the authenticated user.

**URL**: `/users/notifications/unread-count`  
**Method**: `GET`  
**Authentication**: Required

**Response**:
```json
{
  "unread_count": 5
}
```

### Create Notification (Admin/System Only)

Creates a notification for a specific user. Requires admin or system role.

**URL**: `/users/notifications`  
**Method**: `POST`  
**Authentication**: Required  
**Permissions**: Admin or System role required

**Request Body**:
```json
{
  "user_id": 123,
  "message": "System maintenance scheduled for tomorrow"
}
```

**Response**:
```json
{
  "status": "success",
  "notification": {
    "id": 5,
    "user_id": 123,
    "message": "System maintenance scheduled for tomorrow",
    "is_read": false,
    "timestamp": "2025-03-01T15:30:45.123Z"
  }
}
```

### Create Bulk Notifications (Admin/System Only)

Creates notifications for multiple users at once. Requires admin or system role.

**URL**: `/users/notifications/bulk`  
**Method**: `POST`  
**Authentication**: Required  
**Permissions**: Admin or System role required

**Request Body**:
```json
{
  "user_ids": [123, 124, 125],
  "message": "New platform feature released"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Created 3 notifications",
  "count": 3
}
```

### Create Self-Notification

Creates a notification for the currently authenticated user.

**URL**: `/users/notifications/self`  
**Method**: `POST`  
**Authentication**: Required

**Request Body**:
```json
{
  "message": "Reminder to complete profile"
}
```

**Response**:
```json
{
  "status": "success",
  "notification": {
    "id": 7,
    "user_id": 123,
    "message": "Reminder to complete profile",
    "is_read": false,
    "timestamp": "2025-03-01T16:45:22.789Z"
  }
}
```

## Example Usage

### JavaScript Fetch Example

```javascript
// Get all notifications
async function getNotifications() {
  const response = await fetch('/users/notifications', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include' // Includes cookies
  });
  
  return await response.json();
}

// Create a self-notification
async function createSelfNotification(message) {
  const response = await fetch('/users/notifications/self', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ message })
  });
  
  return await response.json();
}
```

### cURL Example

```bash
# Get all notifications
curl -X GET http://localhost:3000/users/notifications \
  -H "Content-Type: application/json" \
  -b "exapis_session=YOUR_SESSION_TOKEN"

# Create a notification (admin)
curl -X POST http://localhost:3000/users/notifications \
  -H "Content-Type: application/json" \
  -b "exapis_session=YOUR_SESSION_TOKEN" \
  -d '{"user_id": 123, "message": "Important notification"}'
```