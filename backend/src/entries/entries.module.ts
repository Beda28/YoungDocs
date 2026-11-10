import { Module }            from '@nestjs/common';
import { TypeOrmModule }     from '@nestjs/typeorm';
import { AuthModule }        from '../auth/auth.module.js';
import { Entry }             from './entry.entity.js';
import { EntriesController } from './entries.controller.js';
import { EntriesService }    from './entries.service.js';

@Module({
  imports:     [AuthModule, TypeOrmModule.forFeature([Entry])],
  controllers: [EntriesController],
  providers:   [EntriesService],
})
export class EntriesModule {}
