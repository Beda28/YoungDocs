import { Body, Controller, Delete, Get, Header, HttpCode, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthRequest }                                                                       from '../auth/auth.guard.js';
import { EntryDto, MonthDto }                                                                                from './entry.dto.js';
import { EntriesService }                                                                                    from './entries.service.js';


@Controller('api/entries')
@UseGuards(AuthGuard)
export class EntriesController {
  constructor(private readonly service: EntriesService) {}
  @Get()
  @Header('Cache-Control', 'no-store')
  list(@Req() req: AuthRequest, @Query() query: MonthDto) { return this.service.list(req.user.id, query.month); }
  @Post()
  add(@Req() req: AuthRequest, @Body() data: EntryDto) { return this.service.add(req.user.id, data); }
  @Delete(':id')
  @HttpCode(204)
  remove(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number) { return this.service.remove(req.user.id, id); }
}
