// security-test.js - Manual testing script for security features
const axios = require('axios');

const API_URL = 'http://localhost:5000';
let token = null;

// Admin credentials
const adminUser = {
  email: 'admin@test.com',
  password: 'Password123!'
};

// Login as admin
async function loginAsAdmin() {
  try {
    console.log('\nLogging in as admin...');
    const response = await axios.post(`${API_URL}/api/auth/login`, adminUser);
    token = response.data.token;
    console.log('Login successful');
    return true;
  } catch (error) {
    console.error('Login failed:', error.response ? error.response.data : error.message);
    return false;
  }
}

// Test rate limiting
async function testRateLimiting() {
  console.log('\nTesting rate limiting (sending 110 requests)...');
  const requests = [];
  
  for (let i = 0; i < 110; i++) {
    requests.push(axios.get(`${API_URL}/api/public/animals`)
      .then(() => {
        if (i % 10 === 0) console.log(`Request ${i} successful`);
      })
      .catch(error => {
        if (error.response && error.response.status === 429) {
          console.log(`Rate limit hit at request ${i}: ${error.response.data.message}`);
        } else {
          console.error(`Request ${i} failed with error:`, error.message);
        }
      }));
  }
  
  await Promise.all(requests);
  console.log('Rate limiting test complete');
}

// Test XSS protection
async function testXSSProtection() {
  console.log('\nTesting XSS protection...');
  const maliciousAnimal = {
    name: '<script>alert("XSS")</script>',
    animal_id: 'XSS-001',
    animal_type: 'Dog',
    breed: '<img src="x" onerror="alert(\'XSS\')">',
    color: 'Black',
    date_of_birth: new Date('2023-01-15'),
    datetime: new Date(),
    outcome_type: 'Available',
    sex_upon_outcome: 'Intact Male',
    age_upon_outcome_in_weeks: 68
  };
  
  try {
    const response = await axios.post(`${API_URL}/api/animals`, maliciousAnimal, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Animal created, checking if XSS was sanitized:');
    console.log('Name:', response.data.data.name);
    console.log('Breed:', response.data.data.breed);
    
    // Clean up
    await axios.delete(`${API_URL}/api/animals/${response.data.data._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error testing XSS protection:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Test NoSQL injection protection
async function testNoSQLInjection() {
  console.log('\nTesting NoSQL injection protection...');
  
  // Try a login with NoSQL injection
  const maliciousLogin = {
    email: { $ne: null },
    password: { $ne: null }
  };
  
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, maliciousLogin);
    console.error('WARNING: NoSQL injection might be possible - login succeeded unexpectedly');
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('Good: NoSQL injection was blocked');
    } else {
      console.error('Error testing NoSQL injection:', error.response ? error.response.data : error.message);
    }
    return null;
  }
}

// Test HTTP header security
async function testHeaderSecurity() {
  console.log('\nTesting HTTP security headers...');
  
  try {
    const response = await axios.get(`${API_URL}/api/public/animals`);
    console.log('Checking security headers:');
    
    const headers = response.headers;
    const securityHeaders = [
      'x-xss-protection',
      'content-security-policy',
      'x-content-type-options',
      'strict-transport-security',
      'x-frame-options'
    ];
    
    securityHeaders.forEach(header => {
      if (headers[header]) {
        console.log(`✓ ${header}: ${headers[header]}`);
      } else {
        console.log(`✗ ${header} not found`);
      }
    });
    
    return headers;
  } catch (error) {
    console.error('Error testing security headers:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Test parameter pollution protection
async function testParameterPollution() {
  console.log('\nTesting HTTP parameter pollution protection...');
  
  try {
    // Try to manipulate sorting parameters
    const response = await axios.get(`${API_URL}/api/public/animals?sort=name&sort=breed`);
    console.log('Response received, checking if HPP protected the request (only last parameter should be used)');
    return response.data;
  } catch (error) {
    console.error('Error testing parameter pollution:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Run the tests in sequence
async function runTests() {
  console.log('=== Starting Security Feature Tests ===');
  
  // Test without authentication
  await testHeaderSecurity();
  await testParameterPollution();
  
  // Test with authentication
  if (await loginAsAdmin()) {
    await testXSSProtection();
    await testNoSQLInjection();
  }
  
  // Test rate limiting - do this last as it might block subsequent requests
  await testRateLimiting();
  
  console.log('\n=== Security Feature Tests Complete ===');
}

// Execute all tests
runTests();