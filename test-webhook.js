const { handleWebhook } = require('./dist/webhook/receive.js');

async function runTests() {
  console.log('Starting tests...');
  
  // Test 1: OWNER
  console.log('\n=== Test 1: OWNER ===');
  const test1 = { from: '1234567890abcdef', body: { text: 'Test message from owner' } };
  const result1 = await handleWebhook(test1);
  console.log('Response:', result1.response);
  console.log('Log ID:', result1.logId);
  
  // Test 2: DEALER
  console.log('\n=== Test 2: DEALER ===');
  const test2 = { from: 'fedcba0987654321', body: { text: 'Test message from dealer' } };
  const result2 = await handleWebhook(test2);
  console.log('Response:', result2.response);
  console.log('Log ID:', result2.logId);
  
  // Test 3: UNKNOWN
  console.log('\n=== Test 3: UNKNOWN ===');
  const test3 = { from: '9999999999999999', body: { text: 'Test message from unknown' } };
  const result3 = await handleWebhook(test3);
  console.log('Response:', result3.response);
  console.log('Log ID:', result3.logId);
  
  console.log('\n=== All tests completed ===');
}

runTests().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
