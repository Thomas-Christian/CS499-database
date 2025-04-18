// auth-test.js - Manual testing script for authentication
const axios = require('axios');

const API_URL = 'http://localhost:5000';
let token = null;

// Test user data
const testAdmin = {
  name: 'Admin User',
  email: 'admin@test.com',
  password: 'Password123!',
  role: 'admin'
};

const testStaff = {
  name: 'Staff User',
  email: 'staff@test.com',
  password: 'Password123!',
  role: 'staff'
};

const testVolunteer = {
  name: 'Volunteer User',
  email: 'volunteer@test.com',
  password: 'Password123!',
  role: 'volunteer'
};

// Test registration
async function testRegistration(userData) {
  try {
    console.log(`\nTesting registration for ${userData.name} (${userData.role})...`);
    const response = await axios.post(`${API_URL}/api/auth/register`, userData);
    console.log('Registration successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Test login
async function testLogin(credentials) {
  try {
    console.log(`\nTesting login for ${credentials.email}...`);
    const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
    console.log('Login successful');
    token = response.data.token;
    return response.data;
  } catch (error) {
    console.error('Login failed:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Test authenticated route
async function testGetMe() {
  try {
    console.log('\nTesting authenticated /me route...');
    const response = await axios.get(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Authenticated route successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Authenticated route failed:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Test role-based authorization
async function testRoleBasedAccess() {
  try {
    console.log('\nTesting role-based access to user management...');
    const response = await axios.get(`${API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Access granted:', response.data);
    return response.data;
  } catch (error) {
    console.error('Access denied:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Test logout
async function testLogout() {
  try {
    console.log('\nTesting logout...');
    const response = await axios.get(`${API_URL}/api/auth/logout`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Logout successful:', response.data);
    token = null;
    return response.data;
  } catch (error) {
    console.error('Logout failed:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Run the tests in sequence
async function runTests() {
  console.log('=== Starting Authentication Tests ===');
  
  // Register users
  await testRegistration(testAdmin);
  await testRegistration(testStaff);
  await testRegistration(testVolunteer);
  
  // Test admin login and permissions
  await testLogin({ email: testAdmin.email, password: testAdmin.password });
  await testGetMe();
  await testRoleBasedAccess(); // Should succeed for admin
  await testLogout();
  
  // Test staff login and permissions
  await testLogin({ email: testStaff.email, password: testStaff.password });
  await testGetMe();
  await testRoleBasedAccess(); // Should fail for staff
  await testLogout();
  
  // Test volunteer login and permissions
  await testLogin({ email: testVolunteer.email, password: testVolunteer.password });
  await testGetMe();
  await testRoleBasedAccess(); // Should fail for volunteer
  await testLogout();
  
  console.log('\n=== Authentication Tests Complete ===');
}

// Execute all tests
runTests();