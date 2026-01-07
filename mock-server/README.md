# Native Teams Wallet Mock API Server

A simple Node.js mock server that simulates the Native Teams Wallet backend API endpoints.

## Features

- **POST /auth/login** - Authentication endpoint that returns access tokens
- **GET /balances** - Returns wallet balances for the authenticated user
- **GET /transactions** - Returns paginated transaction history with filtering options
- **GET /health** - Health check endpoint

## Installation

1. Navigate to the mock-server directory:
```bash
cd mock-server
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

The server will start on port 3000 by default. You can change this by setting the `PORT` environment variable.

## API Endpoints

### Authentication

#### POST /auth/login
Authenticate a user and receive access tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "auth": {
    "access_token": "mock_access_token_1_1234567890",
    "access_token_expire": "2025-01-15T10:30:00.000Z",
    "refresh_token": "mock_refresh_token_1_1234567890",
    "refresh_token_expire": "2025-02-14T10:30:00.000Z"
  },
  "tfa": {
    "enabled": false,
    "type": null
  }
}
```

### Wallet Balances

#### GET /balances
Get all wallet balances for the authenticated user.

**Headers:**
```
Authorization: Bearer mock_access_token_1_1234567890
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "user_id": "1",
      "currency_id": 1,
      "available_balance": "1250.50",
      "current_balance": "1250.50",
      "reserved_balance": "0.00",
      "reference_number": "WAL001"
    }
  ],
  "message": [],
  "status": 200,
  "type": "general_success"
}
```

### Transactions

#### GET /transactions
Get paginated transaction history with optional filters.

**Headers:**
```
Authorization: Bearer mock_access_token_1_1234567890
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 15)
- `wallet_id` (optional): Filter by wallet ID
- `type` (optional): Filter by transaction type (`top-up` or `withdrawal`)
- `status` (optional): Filter by status (`pending`, `completed`, `failed`)
- `date_from` (optional): Filter transactions from date (YYYY-MM-DD)
- `date_to` (optional): Filter transactions to date (YYYY-MM-DD)
- `search` (optional): Search in transaction reason

**Response:**
```json
{
  "data": {
    "current_page": 1,
    "per_page": 15,
    "total": 5,
    "last_page": 1,
    "has_more": false,
    "items": [
      {
        "wallet_id": 1,
        "type": "top-up",
        "status": "completed",
        "reason": "Salary",
        "amount": 1200.00,
        "currency_id": 1,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  },
  "message": "Transactions retrieved successfully",
  "status": 200,
  "type": "general_success"
}
```

## Mock Data

The server includes mock data for:

- **Users**: 1 test user (email: `user@example.com`, password: `password123`)
- **Wallets**: 3 wallets in different currencies (EUR, USD, GBP)
- **Transactions**: 5 sample transactions with various types and statuses

## Authentication

For protected endpoints, include the access token in the Authorization header:
```
Authorization: Bearer mock_access_token_1_1234567890
```

Any token starting with `mock_` will be accepted for testing purposes.

## Testing

Run the test script to verify all endpoints are working:

```bash
npm test
```

## Example Usage

### Using curl

1. **Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

2. **Get balances:**
```bash
curl -X GET http://localhost:3000/balances \
  -H "Authorization: Bearer mock_access_token_1_1234567890"
```

3. **Get transactions:**
```bash
curl -X GET "http://localhost:3000/transactions?page=1&per_page=10" \
  -H "Authorization: Bearer mock_access_token_1_1234567890"
```

### Using JavaScript/Fetch

```javascript
// Login
const loginResponse = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { auth } = await loginResponse.json();

// Get balances
const balancesResponse = await fetch('http://localhost:3000/balances', {
  headers: { 'Authorization': `Bearer ${auth.access_token}` }
});

const balances = await balancesResponse.json();

// Get transactions
const transactionsResponse = await fetch('http://localhost:3000/transactions?page=1&per_page=10', {
  headers: { 'Authorization': `Bearer ${auth.access_token}` }
});

const transactions = await transactionsResponse.json();
```

## Notes

- This is a mock server for development/testing purposes only
- All data is in-memory and will reset when the server restarts
- Authentication tokens are not real JWT tokens and should not be used in production
- The server follows the response format from the original Laravel API documentation
