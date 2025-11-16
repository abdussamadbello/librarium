/**
 * Test user fixtures
 * These match the users created in db-setup.ts seedTestData()
 */

export interface TestUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  membershipType?: string;
  qrCode: string;
  borrowingLimit?: number;
  renewalLimit?: number;
}

export const TEST_USERS = {
  director: {
    id: 'test-director-1',
    name: 'Test Director',
    email: 'director@test.com',
    password: 'TestPassword123!',
    role: 'director',
    qrCode: 'QR-DIRECTOR-001',
  } as TestUser,

  admin: {
    id: 'test-admin-1',
    name: 'Test Admin',
    email: 'admin@test.com',
    password: 'TestPassword123!',
    role: 'admin',
    qrCode: 'QR-ADMIN-001',
  } as TestUser,

  staff: {
    id: 'test-staff-1',
    name: 'Test Staff',
    email: 'staff@test.com',
    password: 'TestPassword123!',
    role: 'staff',
    qrCode: 'QR-STAFF-001',
  } as TestUser,

  member: {
    id: 'test-member-1',
    name: 'Test Member (Standard)',
    email: 'member@test.com',
    password: 'TestPassword123!',
    role: 'member',
    membershipType: 'standard',
    qrCode: 'QR-MEMBER-001',
    borrowingLimit: 5,
    renewalLimit: 2,
  } as TestUser,

  premium: {
    id: 'test-member-2',
    name: 'Test Member (Premium)',
    email: 'premium@test.com',
    password: 'TestPassword123!',
    role: 'member',
    membershipType: 'premium',
    qrCode: 'QR-MEMBER-002',
    borrowingLimit: 15,
    renewalLimit: 5,
  } as TestUser,

  student: {
    id: 'test-member-3',
    name: 'Test Member (Student)',
    email: 'student@test.com',
    password: 'TestPassword123!',
    role: 'member',
    membershipType: 'student',
    qrCode: 'QR-MEMBER-003',
    borrowingLimit: 10,
    renewalLimit: 3,
  } as TestUser,
};

export const DEFAULT_PASSWORD = 'TestPassword123!';
