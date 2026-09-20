const { handleWebhook } = require('./dist/webhook/receive.js');

// Test 1: Known LID - OWNER
const test1 = {
  from: '1234567890abcdef',
  body: { text: 'Test message from owner' }
};

// Test 2: Known LID - DEALER
const test2 = {
  from: 'fedcba0987654321',
  body: { text: 'Test message from dealer' }
};

// Test 3: Unknown LID
const test3 = {
  from: '9999999999999999',
  body: { text: 'Test message from unknown' }
};

async function runTests() {
  console.log('Running tests...\n');
  
  console.log('Test 1: OWNER (1234567890abcdef)');
  const result1 = await handleWebhook(test1);
  console.log(`  Response: ${result1.response}`);
  console.log(`  Log ID: ${result1.logId}\n`);
  
  console.log('Test 2: DEALER (fedcba0987654321)');
  const result2 = await handleWebhook(test2);
  console.log(`  Response: ${result2.response}`);
  console.log(`  Log ID: ${result2.logId}\n`);
  
  console.log('Test 3: UNKNOWN (9999999999999999)');
  const result3 = await handleWebhook(test3);
  console.log(`  Response: ${result3.response}`);
  console.log(`  Log ID: ${result3.logId}\n`);
  
  console.log('All tests completed!');
}

runTests().catch(console.error);
