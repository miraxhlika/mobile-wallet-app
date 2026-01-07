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

Create your local env file:

```bash
cp .env.example .env
```

Set `EXPO_PUBLIC_API_BASE_URL` to the mock server URL.

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

The app assumes the following API response shapes:

### GET /balances

```json
[
  {
    "currency": "USD",
    "available": "1000.00",
    "pending": "50.00"
  }
]
```

### GET /transactions

Query params: `cursor`, `limit`, `type`, `status`, `currency`

```json
{
  "data": [
    {
      "id": "tx_123",
      "type": "credit|debit|payout|refund",
      "status": "pending|completed|failed|cancelled",
      "amount": "100.00",
      "currency": "USD",
      "description": "Payment received",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "metadata": {}
    }
  ],
  "nextCursor": "cursor_abc",
  "hasMore": true
}
```

### GET /transactions/:id

Returns a single transaction object (same shape as above).

### POST /payouts

Request:

```json
{
  "amount": "100.00",
  "currency": "USD",
  "recipientName": "John Doe",
  "recipientAccount": "john@example.com",
  "description": "Payment for services"
}
```

Response:

```json
{
  "id": "payout_123",
  "status": "pending|processing|completed|failed",
  "amount": "100.00",
  "currency": "USD",
  "recipientName": "John Doe",
  "recipientAccount": "john@example.com",
  "description": "Payment for services",
  "createdAt": "2024-01-01T00:00:00Z",
  "estimatedArrival": "2024-01-03T00:00:00Z"
}
```

## Pagination

- Transactions use cursor-based pagination
- Default page size: 10 items
- **Maximum total transactions: 50** (capped to prevent excessive data loading)
- The app stops fetching more pages when either:
  - 50 transactions have been loaded
  - The API returns `hasMore: false`

## Authentication

- Access tokens are stored securely using `expo-secure-store`
- Tokens are never logged to console
- The API client automatically injects the `Authorization: Bearer <token>` header
- Tokens are hydrated from secure storage on app startup

## Features

### Implemented (Skeleton)

- [x] App initialization with providers
- [x] Bottom tab navigation (Home, Transactions, Info)
- [x] Stack navigation for detail screens
- [x] Secure token storage
- [x] API client with auth injection
- [x] Error normalization (network/HTTP/unknown)
- [x] React Query hooks for data fetching
- [x] Zustand stores for global state
- [x] Toast notification system
- [x] Home screen with balances and recent activity
- [x] Transactions list with infinite scroll
- [x] Transaction details screen
- [x] Send payout flow (Form → Review → Success)
- [x] Add funds screen (UI only)
- [x] Info & limits screen (static)

### TODO (Future Implementation)

- [ ] Actual API integration
- [ ] Login/logout flow
- [ ] Biometric authentication
- [ ] Pull-to-refresh on all screens
- [ ] Filter/search transactions
- [ ] Receipt download
- [ ] Push notifications
- [ ] Currency selector
- [ ] Dark mode support

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
