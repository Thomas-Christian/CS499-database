// audit-log-test.js - Manual testing script for audit logging
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

// Test getting all audit logs
async function testGetAllAuditLogs() {
  try {
    console.log('\nTesting GET /api/audit...');
    const response = await axios.get(`${API_URL}/api/audit`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`Fetched ${response.data.count} audit logs`);
    return response.data;
  } catch (error) {
    console.error('Error fetching audit logs:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Test filtering audit logs by action
async function testFilteredAuditLogs() {
  try {
    console.log('\nTesting GET /api/audit?action=LOGIN_SUCCESS...');
    const response = await axios.get(`${API_URL}/api/audit?action=LOGIN_SUCCESS`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`Fetched ${response.data.count} login audit logs`);
    return response.data;
  } catch (error) {
    console.error('Error fetching filtered audit logs:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Test getting audit statistics
async function testAuditStats() {
  try {
    console.log('\nTesting GET /api/audit/stats...');
    const response = await axios.get(`${API_URL}/api/audit/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Audit statistics retrieved');
    return response.data;
  } catch (error) {
    console.error('Error fetching audit stats:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Test getting user activity
async function testUserActivity() {
  try {
    // First get a user ID
    const usersResponse = await axios.get(`${API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (usersResponse.data.data && usersResponse.data.data.length > 0) {
      const userId = usersResponse.data.data[0]._id;
      console.log(`\nTesting GET /api/audit/user/${userId}...`);
      
      const response = await axios.get(`${API_URL}/api/audit/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`Fetched ${response.data.count} audit logs for user`);
      return response.data;
    } else {
      console.error('No users found to test user activity');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user activity:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Run the tests in sequence
async function runTests() {
  console.log('=== Starting Audit Logging Tests ===');
  
  if (await loginAsAdmin()) {
    // Test audit log retrieval
    await testGetAllAuditLogs();
    
    // Test filtered audit logs
    await testFilteredAuditLogs();
    
    // Test audit statistics
    await testAuditStats();
    
    // Test user activity
    await testUserActivity();
  }
  
  console.log('\n=== Audit Logging Tests Complete ===');
}

// Execute all tests
runTests();