import { Table, TableForeignKey, TableIndex, type MigrationInterface, type QueryRunner } from 'typeorm';

export class Entries1794268802000 implements MigrationInterface {
  async up(db: QueryRunner) {
    await db.createTable(new Table({
      name: 'entries',
      columns: [
        { name: 'id',     type: 'int',     unsigned: true, isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'userId', type: 'int',     unsigned: true },
        { name: 'type',   type: 'enum',    enum: ['income', 'expense'] },
        { name: 'title',  type: 'varchar', length: '100' },
        { name: 'amount', type: 'int',     unsigned: true },
        { name: 'date',   type: 'date' },
      ],
      indices:     [new TableIndex({ name: 'IDX_entries_user_date', columnNames: ['userId', 'date'] })],
      foreignKeys: [new TableForeignKey({ columnNames: ['userId'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' })],
    }));
  }

  async down(db: QueryRunner) { await db.dropTable('entries'); }
}
