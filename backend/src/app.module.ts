import { Module }         from '@nestjs/common';
import { HealthModule }   from './health/health.module.js';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule }     from './auth/auth.module.js';
import { EntriesModule }  from './entries/entries.module.js';
import { ReceiptsModule } from './receipts/receipts.module.js';


@Module({ imports: [DatabaseModule, AuthModule, HealthModule, EntriesModule, ReceiptsModule] })
export class AppModule {}
