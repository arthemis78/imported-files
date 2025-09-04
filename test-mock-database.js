// Test script for Mock Database functionality
import { mockDatabaseService } from './src/services/mockDatabaseService.js';

async function testMockDatabase() {
  console.log('🧪 Testing Mock Database Functionality...');
  console.log('================================');
  
  try {
    // Test 1: Check initial state
    console.log('\n📊 Test 1: Initial State');
    const initialLicenses = await mockDatabaseService.getAllLicenses();
    console.log('Initial license count:', initialLicenses.length);
    
    // Test 2: Create a license
    console.log('\n📊 Test 2: Create License');
    const testLicense = await mockDatabaseService.createLicense('Test Client', '1month');
    console.log('Created license:', testLicense.client_name, testLicense.key);
    
    // Verify creation
    const afterCreation = await mockDatabaseService.getAllLicenses();
    console.log('License count after creation:', afterCreation.length);
    
    // Test 3: Delete the license
    console.log('\n📊 Test 3: Delete License');
    await mockDatabaseService.deleteLicense(testLicense.id);
    
    // Verify deletion
    const afterDeletion = await mockDatabaseService.getAllLicenses();
    console.log('License count after deletion:', afterDeletion.length);
    
    // Test 4: Test deactivate/reactivate
    console.log('\n📊 Test 4: Deactivate/Reactivate');
    const testLicense2 = await mockDatabaseService.createLicense('Test Client 2', '3months');
    console.log('Created second license:', testLicense2.client_name);
    
    await mockDatabaseService.deactivateLicense(testLicense2.id);
    console.log('License deactivated');
    
    const expiredLicenses = await mockDatabaseService.getExpiredLicenses();
    console.log('Expired/deactivated licenses count:', expiredLicenses.length);
    
    await mockDatabaseService.reactivateLicense(testLicense2.id);
    console.log('License reactivated');
    
    const activeLicenses = await mockDatabaseService.getActiveLicenses();
    console.log('Active licenses count:', activeLicenses.length);
    
    // Clean up
    await mockDatabaseService.deleteLicense(testLicense2.id);
    console.log('Test license 2 deleted');
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test (this is a basic test script)
console.log('Note: This is a test script template.');
console.log('To run proper tests, use the browser console or Jest testing framework.');
