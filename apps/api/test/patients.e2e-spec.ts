import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { TestApp } from './test-utils';

const logger = new Logger('PatientsE2E');

describe('PatientsController (e2e)', () => {
  let testApp: TestApp;
  let prisma: PrismaService;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    logger.log('Starting PatientsController E2E tests');
    logger.log('Initializing test environment...');
    
    testApp = await new TestApp().init();
    prisma = testApp.moduleFixture.get<PrismaService>(PrismaService);
    
    // Log database connection status
    try {
      await prisma.$connect();
      logger.log('✅ Database connection established');
    } catch (error) {
      logger.error('❌ Failed to connect to database', error);
      throw error;
    }
    
    logger.log('Cleaning up test database...');
    await testApp.cleanupDatabase();
    logger.log('Test environment ready');
    testApp = await new TestApp().init();
    prisma = testApp.moduleFixture.get<PrismaService>(PrismaService);
    await testApp.cleanupDatabase();
  });

  afterAll(async () => {
    logger.log('Cleaning up after tests...');
    if (testApp) {
      try {
        await testApp.close();
        logger.log('✅ Test app closed successfully');
      } catch (error) {
        logger.error('❌ Error closing test app', error);
        throw error;
      }
    }
  });

  describe('POST /patients', () => {
    it('should create a new patient', async () => {
      logger.log('Running test: should create a new patient');
      const patientData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        dateOfBirth: '1990-01-01',
        gender: 'MALE',
        address: '123 Test St',
        postalCode: '12345',
        bloodType: 'A_POSITIVE',
      };

      const response = await testApp.getRequest()
        .post('/patients')
        .send(patientData)
        .expect(201);

      expect(response.body).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        gender: 'MALE',
        address: '123 Test St',
        postalCode: '12345',
        bloodType: 'A_POSITIVE',
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.medicalRecordNumber).toMatch(/^MRN-\d+$/);
    });

    it('should return 400 for invalid data', async () => {
      const response = await testApp.getRequest()
        .post('/patients')
        .send({
          firstName: '', // Invalid: empty first name
          lastName: 'Doe',
          email: 'invalid-email', // Invalid email
          phone: '123', // Invalid phone
        })
        .expect(400);

      expect(response.body.message).toContain('firstName should not be empty');
      expect(response.body.message).toContain('email must be an email');
    });
  });

  describe('GET /patients', () => {
    beforeAll(async () => {
      // Create test patients
      await Promise.all([
        testApp.createTestPatient({ firstName: 'Alice', lastName: 'Smith' }),
        testApp.createTestPatient({ firstName: 'Bob', lastName: 'Johnson' }),
        testApp.createTestPatient({ 
          firstName: 'Charlie', 
          lastName: 'Brown',
          deletedAt: new Date() // Soft-deleted
        }),
      ]);
    });

    it('should return paginated list of active patients', async () => {
      const response = await testApp.getRequest()
        .get('/patients')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });

  describe('GET /patients/:id', () => {
    let testPatient: any;

    beforeAll(async () => {
      testPatient = await testApp.createTestPatient({
        firstName: 'Test',
        lastName: 'GetPatient',
        email: 'get.test@example.com',
      });
    });

    it('should return patient by ID', async () => {
      const response = await testApp.getRequest()
        .get(`/patients/${testPatient.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testPatient.id,
        firstName: 'Test',
        lastName: 'GetPatient',
        email: 'get.test@example.com',
      });
      expect(response.body.age).toBeDefined();
    });
  });

  describe('PATCH /patients/:id', () => {
    let testPatient: any;

    beforeEach(async () => {
      testPatient = await testApp.createTestPatient({
        firstName: 'Before',
        lastName: 'Update',
        email: `before.update-${Date.now()}@example.com`,
      });
    });

    it('should update patient data', async () => {
      const updateData = {
        firstName: 'After',
        phone: '+1234567890',
        address: '456 Update St',
      };

      const response = await testApp.getRequest()
        .patch(`/patients/${testPatient.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testPatient.id,
        firstName: 'After',
        lastName: 'Update',
        phone: '+1234567890',
        address: '456 Update St',
      });
    });
  });

  describe('DELETE /patients/:id', () => {
    let testPatient: any;

    beforeEach(async () => {
      testPatient = await testApp.createTestPatient({
        firstName: 'ToDelete',
        lastName: 'Patient',
        email: `delete-${Date.now()}@example.com`,
      });
    });

    it('should soft delete patient by default', async () => {
      // First delete
      await testApp.getRequest()
        .delete(`/patients/${testPatient.id}`)
        .expect(200);

      // Should not find in normal query
      const listResponse = await testApp.getRequest()
        .get('/patients')
        .expect(200);
      
      expect(listResponse.body.data.some((p: any) => p.id === testPatient.id)).toBe(false);

      // Should find with includeDeleted
      const getResponse = await testApp.getRequest()
        .get(`/patients/${testPatient.id}?includeDeleted=true`)
        .expect(200);
      
      expect(getResponse.body.id).toBe(testPatient.id);
      expect(getResponse.body.deletedAt).toBeDefined();
    });
  });
});
