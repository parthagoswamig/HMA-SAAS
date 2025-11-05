import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables
config();

async function generateMigration() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [
      path.join(__dirname, '../src/**/*.entity{.ts,.js}'),
    ],
    migrations: [path.join(__dirname, '../src/database/migrations/*{.ts,.js}')],
    migrationsRun: false,
    synchronize: false,
    logging: true,
  });

  await dataSource.initialize();
  
  console.log('Generating migration...');
  
  const migration = await dataSource.createQueryRunner().createMigration(
    'src/database/migrations',
    false,
    {
      name: 'InitialIPDModule',
      up: async (queryRunner) => {
        // This will be populated by TypeORM
      },
      down: async (queryRunner) => {
        // This will be populated by TypeORM
      },
    }
  );

  console.log('Migration generated successfully!');
  console.log('Migration path:', migration);
  
  await dataSource.destroy();
}

generateMigration().catch(error => {
  console.error('Error generating migration:', error);
  process.exit(1);
});
