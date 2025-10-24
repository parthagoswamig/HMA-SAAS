import { TestApp } from './test-utils';

describe('Health Check (e2e)', () => {
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await new TestApp().init();
  });

  afterAll(async () => {
    await testApp.close();
  });

  it('should return 200 for health check endpoint', async () => {
    const response = await testApp.getRequest()
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
  });
});
