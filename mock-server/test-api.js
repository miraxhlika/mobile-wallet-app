const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing Native Teams Wallet Mock API\n');

  try {
    // Test 1: Login
    console.log('1. Testing login...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log(`   Access token: ${loginData.auth.access_token.substring(0, 20)}...`);
    console.log(`   Expires: ${loginData.auth.access_token_expire}\n`);

    const accessToken = loginData.auth.access_token;

    // Test 2: Get balances
    console.log('2. Testing get balances...');
    const balancesResponse = await fetch(`${BASE_URL}/balances`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!balancesResponse.ok) {
      throw new Error(`Get balances failed: ${balancesResponse.status}`);
    }

    const balancesData = await balancesResponse.json();
    console.log('✅ Balances retrieved successfully');
    console.log(`   Found ${balancesData.data.length} wallets:`);
    balancesData.data.forEach(wallet => {
      console.log(`   - Wallet ${wallet.id}: ${wallet.available_balance} (Currency ID: ${wallet.currency_id})`);
    });
    console.log('');

    // Test 3: Get transactions
    console.log('3. Testing get transactions...');
    const transactionsResponse = await fetch(`${BASE_URL}/transactions?page=1&per_page=5`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!transactionsResponse.ok) {
      throw new Error(`Get transactions failed: ${transactionsResponse.status}`);
    }

    const transactionsData = await transactionsResponse.json();
    console.log('✅ Transactions retrieved successfully');
    console.log(`   Total transactions: ${transactionsData.data.total}`);
    console.log(`   Current page: ${transactionsData.data.current_page}`);
    console.log(`   Has more: ${transactionsData.data.has_more}`);
    console.log('   Recent transactions:');
    transactionsData.data.items.forEach(transaction => {
      console.log(`   - ${transaction.type} (${transaction.status}): ${transaction.amount} - ${transaction.reason}`);
    });
    console.log('');

    // Test 4: Test filtering
    console.log('4. Testing transaction filtering...');
    const filteredResponse = await fetch(`${BASE_URL}/transactions?type=top-up&status=completed`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!filteredResponse.ok) {
      throw new Error(`Filtered transactions failed: ${filteredResponse.status}`);
    }

    const filteredData = await filteredResponse.json();
    console.log('✅ Filtered transactions retrieved successfully');
    console.log(`   Found ${filteredData.data.total} completed top-up transactions\n`);

    // Test 5: Health check
    console.log('5. Testing health check...');
    const healthResponse = await fetch(`${BASE_URL}/health`);

    if (!healthResponse.ok) {
      throw new Error(`Health check failed: ${healthResponse.status}`);
    }

    const healthData = await healthResponse.json();
    console.log('✅ Health check successful');
    console.log(`   Status: ${healthData.status}`);
    console.log(`   Message: ${healthData.message}\n`);
    // Add this test after your existing tests
    // Test 6: Test payout/withdrawal
    console.log('6. Testing payout/withdrawal...');
    const payoutResponse = await fetch(`${BASE_URL}/payouts`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        wallet_id: 1,
        provider: 'bank',
        amount: 100.00,
        currency_id: 1,
        bank_id: 1
      })
    });

    if (!payoutResponse.ok) {
      throw new Error(`Payout failed: ${payoutResponse.status}`);
    }

    const payoutData = await payoutResponse.json();
    console.log('✅ Payout initiated successfully');
    console.log(`   Transaction ID: ${payoutData.data.id}`);
    console.log(`   Amount: ${payoutData.data.amount}`);
    console.log(`   Status: ${payoutData.data.status}`);
    console.log(`   Provider: ${payoutData.data.provider}\n`);

    console.log('🎉 All tests passed! The mock API is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nMake sure the mock server is running on port 3000:');
    console.log('npm start');
  }
}

// Run the tests
testAPI();
