# Mobile Wallet App

A React Native (Expo) mobile wallet application with transaction management, payouts, and balance tracking.

## Tech Stack

- **Framework**: Expo (React Native) with TypeScript
- **Navigation**: React Navigation (Bottom Tabs + Native Stack)
- **Data Fetching**: TanStack React Query
- **Global State**: Zustand
- **Styling**: NativeWind (Tailwind for React Native)
- **Secure Storage**: expo-secure-store
- **Async Storage**: @react-native-async-storage/async-storage

## Setup

### Prerequisites

- Node.js >= 18.x (recommended: 20.x+)
- npm or yarn
- Expo CLI (installed globally or via npx)
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Create environment file
# Copy the example below and save as .env
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Base URL for the wallet API (required)
EXPO_PUBLIC_API_BASE_URL=https://api.staging.example.com/v1

# Optional: force pagination mode
# - cursor: /transactions?cursor=...&limit=... (staging)
# - page:   /transactions?page=...&per_page=... (mock server)
# If omitted, the app auto-detects based on base URL heuristics.
# EXPO_PUBLIC_API_PAGINATION_MODE=cursor
```

### Run locally

#### 1) Start the mock server

```bash
cd mock-server
npm install
npm start
```

By default the mock server runs on `http://localhost:3000`.

#### 2) Set `.env`

Create your local env file manually and set `EXPO_PUBLIC_API_BASE_URL` to the mock server URL.

**Windows + iOS (Expo Go on a physical iPhone):** you must use your machine’s **LAN IP**, not `localhost`, e.g.:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.66:3000
```

> Tip: your phone and computer must be on the same Wi‑Fi/LAN.

#### 3) Start Expo

From the project root:

```bash
npm install
npx expo start -c
```

### Running the App

```bash
# Start Expo development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Run in web browser
npx expo start --web
```

## Project Structure

```
src/
├── providers/              # App providers and configuration
│   ├── AppProviders.tsx    # Root provider wrapper
│   └── QueryProvider.tsx   # React Query setup
│
├── navigation/             # Navigation configuration
│   ├── types.ts            # Navigation type definitions
│   ├── RootNavigator.tsx   # Main stack navigator
│   └── TabNavigator.tsx    # Bottom tab navigator
│
├── services/
│   └── api/                # API layer
│       ├── client.ts       # Fetch wrapper with auth injection
│       └── endpoints.ts    # API endpoint functions
│
├── storage/                # Persistent storage helpers
│   ├── secureToken.ts      # Secure token storage (expo-secure-store)
│   └── asyncStorage.ts     # General async storage helpers
│
├── components/             # Shared UI components
│   └── Toast.tsx           # Toast notification system
│
├── features/               # Feature modules
│   ├── auth/               # Authentication
│   │   └── store.ts        # Auth Zustand store
│   │
│   ├── wallet/             # Wallet/balance features
│   │   ├── store.ts        # Settings store
│   │   ├── hooks.ts        # useBalances hook
│   │   ├── HomeScreen.tsx
│   │   └── AddFundsScreen.tsx
│   │
│   ├── transactions/       # Transaction features
│   │   ├── hooks.ts        # useInfiniteTransactions, useTransactionById
│   │   ├── TransactionsScreen.tsx
│   │   └── TransactionDetailsScreen.tsx
│   │
│   ├── payouts/            # Payout features
│   │   ├── hooks.ts        # useCreatePayout
│   │   ├── SendPayoutFormScreen.tsx
│   │   ├── SendPayoutReviewScreen.tsx
│   │   └── SendPayoutSuccessScreen.tsx
│   │
│   └── info/               # Info & limits
│       └── InfoScreen.tsx
│
└── types/                  # TypeScript type definitions
    └── index.ts
```

## API Assumptions

The app can talk to either:

- the **local mock API server** in `./mock-server` (page/per_page pagination), or
- a **staging API** (cursor pagination)

The client maps API wire shapes into internal domain types (`Balance`, `Transaction`, `Payout*`).

### POST /auth/login

Request:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "auth": {
    "access_token": "mock_access_token_1_1736246400000",
    "access_token_expire": "2025-01-15T10:30:00.000Z",
    "refresh_token": "mock_refresh_token_1_1736246400000",
    "refresh_token_expire": "2025-02-14T10:30:00.000Z"
  },
  "tfa": {
    "enabled": false,
    "type": null
  }
}
```

### GET /balances

Response:

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

The client maps each wallet into a simpler `Balance`:
`{ currency: "USD", available: "1250.50", pending: "0.00" }`.

### GET /transactions

Query params:

- `cursor` (staging API, cursor pagination)
- `limit` (staging API)
- `page` (default: `1`)
- `per_page` (default: `15`)
- `wallet_id`
- `type` (`top-up` \| `withdrawal`)
- `status` (`pending` \| `completed` \| `failed`)
- `date_from`, `date_to`
- `search` (matches `reason`, case-insensitive)

Response:

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
        "amount": 1200,
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

The client:

- maps `type: "top-up" | "withdrawal"` into domain types (`credit` / `payout`)
- maps `amount` into a formatted string
- derives a stable `id` for seed transactions that have no `id` in the mock data
- exposes a cursor-like API (`nextCursor`, `hasMore`) on top of either:
  - staging cursor pagination, or
  - mock server `current_page`/`has_more` paging.

> The mock server does **not** expose `GET /transactions/:id`; the client
> emulates it by paginating over `/transactions` until it finds the target item.

### POST /payouts

Request:

```json
{
  "wallet_id": 1,
  "provider": "bank",
  "amount": 100.0,
  "currency_id": 1,
  "bank_id": 1
}
```

Response:

```json
{
  "data": {
    "id": 1730000000000,
    "status": "pending",
    "amount": 100.0,
    "provider": "bank",
    "wallet_id": 1,
    "currency_id": 1,
    "created_at": "2024-01-15T10:30:00.000Z"
  },
  "message": "Withdrawal initiated successfully",
  "status": 200,
  "type": "general_success"
}
```

The app-level `PayoutRequest` is intentionally simpler
(`amount`, `currency`, `recipientName`, `recipientAccount`, `description`).
The client maps that into the mock server shape (selecting a `wallet_id`,
`currency_id`, `provider`, and `bank_id`) and then back into a domain-level
`PayoutResponse`.

## Pagination

- **Staging API**: cursor-based pagination via `GET /transactions?cursor=...&limit=...`
- **Mock server**: page/per_page pagination via `GET /transactions?page=...&per_page=...`
- **Default page size**: 20 items
- **Maximum total transactions**: 50 (hard cap to prevent excessive loading)

> The transactions hook also defensively de-dupes by `id` to prevent React key collisions if a backend overlaps items between pages.

## Offline read-only cache (balances + transactions)

Balances and transactions are cached via React Query and **persisted to AsyncStorage** so the app can render previously fetched data while offline.

- Persistence lives in `src/providers/QueryProvider.tsx` (`PersistQueryClientProvider`)
- Persisted data:
  - queries only (successful queries)
  - max age: 24h
- Query `networkMode` is `offlineFirst`

## Deep links

The app supports deep links:

- `wallet://tx/{id}` → opens `TransactionDetails` with `transactionId={id}`

Notes:

- **Expo Go limitation**: you generally cannot test custom schemes like `wallet://` in stock Expo Go.
- **Expo Go workaround**: use Expo’s `exp://.../--/tx/{id}` format.
- Best test path is a dev client / standalone build.

## Authentication

- Access tokens are stored securely using `expo-secure-store`
- Tokens are never logged to console
- The API client automatically injects the `Authorization: Bearer <token>` header
- Tokens are hydrated from secure storage on app startup

## Features

### Implemented (Skeleton)

- [x] App initialization with providers
- [x] Bottom tab navigation (Home, Cards, Info)
- [x] Stack navigation for detail screens
- [x] Secure token storage
- [x] API client with auth injection
- [x] Error normalization (network/HTTP/unknown)
- [x] React Query hooks for data fetching + persisted offline read-only cache
- [x] Zustand stores for global state
- [x] Toast notification system
- [x] Home screen with balances and recent activity
- [x] Currency selector (persisted) on Home
- [x] Transactions list with infinite scroll
- [x] Transactions filters (date/status/category/currency) + AsyncStorage persistence
- [x] Transaction details screen
- [x] Send payout flow (Form → Review → Success)
- [x] Add funds screen (UI only)
- [x] Info & limits screen (static)

## Security Notes

- **Never log tokens** - All token operations are done without console output
- Tokens are stored in platform-specific secure storage:
  - iOS: Keychain
  - Android: EncryptedSharedPreferences / Keystore
- The app uses HTTPS for all API calls (configured via env)

## Development

### Code Style

- TypeScript strict mode
- Functional components with hooks
- Feature-based folder structure
- Centralized type definitions

### Adding a New Feature

1. Create feature folder under `src/features/`
2. Add types to `src/types/index.ts`
3. Create hooks for data fetching
4. Add screens
5. Register routes in navigation

## License

Private - All rights reserved
