import { Table, type MigrationInterface, type QueryRunner } from 'typeorm';

export class Users1794268800000 implements MigrationInterface {
  async up(db: QueryRunner) {
    await db.createTable(new Table({
      name: 'users',
      columns: [
        { name: 'id',        type: 'int',      unsigned: true, isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'email',     type: 'varchar',  length: '254', isUnique: true },
        { name: 'name',      type: 'varchar',  length: '50' },
        { name: 'password',  type: 'varchar',  length: '200' },
        { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
      ],
    }));
  }

  async down(db: QueryRunner) { await db.dropTable('users'); }
}
