const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
const mockUsers = [
  {
    id: 1,
    email: 'user@example.com',
    password: 'password123'
  }
];

const mockWallets = [
  {
    id: 1,
    user_id: "1",
    currency_id: 1,
    available_balance: "1250.50",
    current_balance: "1250.50",
    reserved_balance: "0.00",
    reference_number: "WAL001"
  },
  {
    id: 2,
    user_id: "1",
    currency_id: 2,
    available_balance: "850.25",
    current_balance: "850.25",
    reserved_balance: "0.00",
    reference_number: "WAL002"
  },
  {
    id: 3,
    user_id: "1",
    currency_id: 9,
    available_balance: "750.00",
    current_balance: "750.00",
    reserved_balance: "0.00",
    reference_number: "WAL003"
  }
];

const mockTransactions = [
  {
    wallet_id: 1,
    type: "top-up",
    status: "completed",
    reason: "Salary",
    amount: 1200.00,
    currency_id: 1,
    created_at: "2024-01-15T10:30:00Z"
  },
  {
    wallet_id: 1,
    type: "withdrawal",
    status: "completed",
    reason: "Rent payment",
    amount: -800.00,
    currency_id: 1,
    created_at: "2024-01-14T15:45:00Z"
  },
  {
    wallet_id: 2,
    type: "top-up",
    status: "completed",
    reason: "Freelance payment",
    amount: 500.00,
    currency_id: 2,
    created_at: "2024-01-13T09:20:00Z"
  },
  {
    wallet_id: 2,
    type: "withdrawal",
    status: "pending",
    reason: "Online purchase",
    amount: -150.25,
    currency_id: 2,
    created_at: "2024-01-12T14:10:00Z"
  },
  {
    wallet_id: 3,
    type: "top-up",
    status: "completed",
    reason: "Investment return",
    amount: 750.00,
    currency_id: 9,
    created_at: "2024-01-11T11:30:00Z"
  }
];

const mockBankAccounts = [
  {
    id: 1,
    user_id: "1",
    bank_name: "Example Bank",
    account_number: "1234567890",
    iban: "GB29NWBK60161331926819",
    swift: "NWBKGB2L"
  },
  {
    id: 2,
    user_id: "1",
    bank_name: "Another Bank",
    account_number: "0987654321",
    iban: "DE89370400440532013000",
    swift: "COBADEFFXXX"
  }
];


// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or missing authentication token",
      status: 401
    });
  }

  // In a real app, you'd verify the JWT token here
  // For mock purposes, we'll accept any token that starts with 'mock_'
  if (!token.startsWith('mock_')) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid authentication token",
      status: 401
    });
  }

  next();
};

// Routes

// POST /auth/login
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Email and password are required"
    });
  }

  // Check credentials (mock validation)
  const user = mockUsers.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({
      error: "Invalid credentials"
    });
  }

  // Generate mock tokens
  const now = new Date();
  const accessTokenExpire = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
  const refreshTokenExpire = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

  res.json({
    auth: {
      access_token: `mock_access_token_${user.id}_${Date.now()}`,
      access_token_expire: accessTokenExpire.toISOString(),
      refresh_token: `mock_refresh_token_${user.id}_${Date.now()}`,
      refresh_token_expire: refreshTokenExpire.toISOString()
    },
    tfa: {
      enabled: false,
      type: null
    }
  });
});

// GET /balances (using /wallets endpoint from documentation)
app.get('/balances', authenticateToken, (req, res) => {
  res.json({
    data: mockWallets,
    message: [],
    status: 200,
    type: "general_success"
  });
});

// GET /transactions with pagination
app.get('/transactions', authenticateToken, (req, res) => {
  const {
    page = 1,
    per_page = 15,
    wallet_id,
    type,
    status,
    date_from,
    date_to,
    search
  } = req.query;

  let filteredTransactions = [...mockTransactions];

  // Apply filters
  if (wallet_id) {
    filteredTransactions = filteredTransactions.filter(t => t.wallet_id === parseInt(wallet_id));
  }

  if (type) {
    filteredTransactions = filteredTransactions.filter(t => t.type === type);
  }

  if (status) {
    filteredTransactions = filteredTransactions.filter(t => t.status === status);
  }

  if (search) {
    filteredTransactions = filteredTransactions.filter(t =>
      t.reason.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (date_from) {
    filteredTransactions = filteredTransactions.filter(t =>
      new Date(t.created_at) >= new Date(date_from)
    );
  }

  if (date_to) {
    filteredTransactions = filteredTransactions.filter(t =>
      new Date(t.created_at) <= new Date(date_to)
    );
  }

  // Sort by created_at descending (newest first)
  filteredTransactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Pagination
  const pageNum = parseInt(page);
  const perPageNum = parseInt(per_page);
  const startIndex = (pageNum - 1) * perPageNum;
  const endIndex = startIndex + perPageNum;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  const total = filteredTransactions.length;
  const lastPage = Math.ceil(total / perPageNum);
  const hasMore = pageNum < lastPage;

  res.json({
    data: {
      current_page: pageNum,
      per_page: perPageNum,
      total: total,
      last_page: lastPage,
      has_more: hasMore,
      items: paginatedTransactions
    },
    message: "Transactions retrieved successfully",
    status: 200,
    type: "general_success"
  });
});

// POST /payouts (withdrawal endpoint)
app.post('/payouts', authenticateToken, (req, res) => {
  const { wallet_id, provider, amount, currency_id, bank_id } = req.body;

  // Validate required fields
  if (!wallet_id || !provider || !amount || !currency_id) {
    return res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      error: "Bad Request",
      message: "Missing required fields: wallet_id, provider, amount, currency_id",
      path: "/payouts"
    });
  }

  // Validate provider
  if (!['bank', 'card'].includes(provider)) {
    return res.status(422).json({
      timestamp: new Date().toISOString(),
      status: 422,
      error: "Validation Error",
      message: "Provider must be either 'bank' or 'card'",
      path: "/payouts"
    });
  }

  // Validate amount
  if (amount < 0.01 || amount > 999999.99) {
    return res.status(422).json({
      timestamp: new Date().toISOString(),
      status: 422,
      error: "Validation Error",
      message: "Amount must be between 0.01 and 999999.99",
      path: "/payouts"
    });
  }

  // Check if wallet exists and belongs to user
  const wallet = mockWallets.find(w => w.id === parseInt(wallet_id) && w.user_id === "1");
  if (!wallet) {
    return res.status(404).json({
      timestamp: new Date().toISOString(),
      status: 404,
      error: "Not Found",
      message: "Wallet not found",
      path: "/payouts"
    });
  }

  // Check if currency matches wallet currency
  if (wallet.currency_id !== parseInt(currency_id)) {
    return res.status(422).json({
      timestamp: new Date().toISOString(),
      status: 422,
      error: "Validation Error",
      message: "Currency does not match wallet currency",
      path: "/payouts"
    });
  }

  // Check if bank_id is provided for bank withdrawals
  if (provider === 'bank' && !bank_id) {
    return res.status(422).json({
      timestamp: new Date().toISOString(),
      status: 422,
      error: "Validation Error",
      message: "Bank ID is required for bank withdrawals",
      path: "/payouts"
    });
  }

  // Check if bank account exists for bank withdrawals
  if (provider === 'bank') {
    const bankAccount = mockBankAccounts.find(b => b.id === parseInt(bank_id) && b.user_id === "1");
    if (!bankAccount) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: "Not Found",
        message: "Bank account not found",
        path: "/payouts"
      });
    }
  }

  // Check if sufficient balance
  const availableBalance = parseFloat(wallet.available_balance);
  if (availableBalance < amount) {
    return res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      error: "Withdrawal initiation failed",
      message: "Insufficient available balance",
      path: "/payouts"
    });
  }

  // Create withdrawal transaction
  const withdrawalTransaction = {
    id: Date.now(), // Generate unique ID
    wallet_id: parseInt(wallet_id),
    type: "withdrawal",
    status: "pending",
    reason: `${provider} withdrawal`,
    amount: -parseFloat(amount), // Negative amount for withdrawal
    currency_id: parseInt(currency_id),
    provider: provider,
    bank_id: bank_id ? parseInt(bank_id) : null,
    created_at: new Date().toISOString()
  };

  // Add to transactions list
  mockTransactions.push(withdrawalTransaction);

  // Update wallet balance (reserve the amount)
  const currentBalance = parseFloat(wallet.current_balance);
  const reservedBalance = parseFloat(wallet.reserved_balance);
  
  wallet.current_balance = (currentBalance - amount).toFixed(2);
  wallet.reserved_balance = (reservedBalance + amount).toFixed(2);
  wallet.available_balance = (availableBalance - amount).toFixed(2);

  res.json({
    data: {
      id: withdrawalTransaction.id,
      status: withdrawalTransaction.status,
      amount: parseFloat(amount),
      provider: withdrawalTransaction.provider,
      wallet_id: withdrawalTransaction.wallet_id,
      currency_id: withdrawalTransaction.currency_id,
      created_at: withdrawalTransaction.created_at
    },
    message: "Withdrawal initiated successfully",
    status: 200,
    type: "general_success"
  });
});


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mock API server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock API server running on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  POST /auth/login - Login and get access token`);
  console.log(`  GET /balances - Get wallet balances`);
  console.log(`  GET /transactions - Get transactions with pagination`);
  console.log(`  POST /payouts - Initiate withdrawal/payout`);
  console.log(`  GET /health - Health check`);
});

module.exports = app;
