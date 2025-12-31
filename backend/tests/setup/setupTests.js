/**
 * Test Setup File
 * 
 * Global setup for Jest tests including:
 * - MongoDB Memory Server setup
 * - Environment variables
 * - Global mocks
 * - Test utilities
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

/**
 * Setup MongoDB Memory Server before all tests
 */
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  console.log('✓ Connected to MongoDB Memory Server');
});

/**
 * Cleanup after each test
 */
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

/**
 * Cleanup after all tests
 */
afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
  console.log('✓ Disconnected from MongoDB Memory Server');
});

/**
 * Global test utilities
 */
global.testUtils = {
  createObjectId: () => new mongoose.Types.ObjectId(),
  createObjectIds: (count) => Array.from({ length: count }, () => new mongoose.Types.ObjectId()),
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  randomString: (length = 10) => Math.random().toString(36).substring(2, length + 2),
  randomNumber: (min = 0, max = 100) => Math.floor(Math.random() * (max - min + 1)) + min,
  randomEmail: () => `${Math.random().toString(36).substring(7)}@josephscollege.ac.in`,
  randomPhone: () => '9' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')
};

/**
 * Mock environment variables
 */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRE = '1h';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_REFRESH_EXPIRE = '7d';

/**
 * Custom matchers
 */
expect.extend({
  toBeValidObjectId(received) {
    const pass = mongoose.Types.ObjectId.isValid(received);
    return {
      pass,
      message: () => pass
        ? `expected ${received} not to be a valid ObjectId`
        : `expected ${received} to be a valid ObjectId`
    };
  }
});

console.log('✓ Test setup complete');