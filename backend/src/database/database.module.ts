import { Module }                from '@nestjs/common';
import { TypeOrmModule }         from '@nestjs/typeorm';
import { Users1794268800000 }    from './migrations/users.js';
import { UserName1794268801000 } from './migrations/name.js';

@Module({
  imports: [TypeOrmModule.forRoot({
    type:             'mysql',
    host:             process.env.DB_HOST ?? 'localhost',
    port:             Number(process.env.DB_PORT ?? 3306),
    username:         process.env.DB_USER ?? 'youngdocs',
    password:         process.env.DB_PASSWORD ?? 'youngdocs',
    database:         process.env.DB_NAME ?? 'youngdocs',
    charset:          'utf8mb4',
    autoLoadEntities: true,
    synchronize:      false,
    migrationsRun:    true,
    migrations:       [Users1794268800000, UserName1794268801000],
  })],
})
export class DatabaseModule {}
