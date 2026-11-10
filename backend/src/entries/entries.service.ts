import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository }              from '@nestjs/typeorm';
import { Between, Repository }           from 'typeorm';
import { Entry }                         from './entry.entity.js';
import type { EntryDto }                 from './entry.dto.js';
import { ReceiptsService }               from '../receipts/receipts.service.js';


@Injectable()
export class EntriesService {
  constructor(
    @InjectRepository(Entry) private readonly entries: Repository<Entry>,
    private readonly receipts: ReceiptsService,
  ) {}

  list(userId: number, month: string) {
    const [year, value] = month.split('-').map(Number);
    const last         = new Date(year, value, 0).getDate();

    return this.entries.find({
      where:  { userId, date: Between(`${month}-01`, `${month}-${last}`) },
      order:  { date: 'DESC', id: 'DESC' },
      select: { id: true, type: true, title: true, amount: true, date: true, receiptId: true },
    });
  }
  async add(userId: number, data: EntryDto) {
    if (data.receiptId) await this.receipts.path(userId, data.receiptId);

    return this.entries.save(this.entries.create({ ...data, userId }));
  }
  async remove(userId: number, id: number) {
    const result = await this.entries.delete({ id, userId });
    if (!result.affected) throw new NotFoundException('내역을 찾을 수 없습니다.');
  }
}
