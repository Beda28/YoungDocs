import { TableIndex, type MigrationInterface, type QueryRunner } from 'typeorm';

export class UserName1794268801000 implements MigrationInterface {
  async up(db: QueryRunner) {
    await db.createIndex('users', new TableIndex({ name: 'UQ_users_name', columnNames: ['name'], isUnique: true }));
    await db.dropColumn('users', 'email');
  }

  async down() { throw new Error('Email removal requires a backup to reverse'); }
}
