import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import * as path from 'path';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  url: configService.get<string>('DATABASE_URL'),
  entities: [
    path.join(__dirname, 'src/**/*.entity{.ts,.js}'),
  ],
  migrations: [path.join(__dirname, 'src/database/migrations/*{.ts,.js}')],
  migrationsRun: false,
  synchronize: false,
  logging: true,
  ssl: configService.get<string>('NODE_ENV') === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
});
