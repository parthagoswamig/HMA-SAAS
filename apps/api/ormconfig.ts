import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USERNAME', 'postgres'),
  password: configService.get<string>('DB_PASSWORD', 'postgres'),
  database: configService.get<string>('DB_NAME', 'hospital_management'),
  entities: [
    __dirname + '/**/*.entity{.ts,.js}',
    __dirname + '/**/entities/*.entity{.ts,.js}',
  ],
  migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
  migrationsRun: false,
  synchronize: false,
  logging: configService.get<string>('NODE_ENV') === 'development',
  ssl: configService.get<string>('NODE_ENV') === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
