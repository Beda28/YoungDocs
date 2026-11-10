import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';


export class Receipt1794268803000 implements MigrationInterface {
  async up(db: QueryRunner) { await db.addColumn('entries', new TableColumn({ name: 'receiptId', type: 'char', length: '36', isNullable: true })); }
  async down(db: QueryRunner) { await db.dropColumn('entries', 'receiptId'); }
}
