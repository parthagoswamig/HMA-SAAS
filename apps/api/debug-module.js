import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

async function debugTest() {
  try {
    console.log('Creating testing module...');
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    console.log('Testing module created successfully');
    console.log('Module providers:', moduleFixture.get(AppModule));
    process.exit(0);
  } catch (error) {
    console.error('Error creating testing module:', error);
    process.exit(1);
  }
}

debugTest();
