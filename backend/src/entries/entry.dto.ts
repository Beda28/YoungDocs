import { Transform }                                                                          from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, IsUUID, Length, Matches, Max, Min } from 'class-validator';


export class EntryDto {
  @IsIn(['income', 'expense'])
  type!: 'income' | 'expense';


  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(1, 100)
  title!: string;


  @IsInt()
  @Min(1)
  @Max(2147483647)
  amount!: number;


  @Matches(/^[1-9]\d{3}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  date!: string;


  @IsOptional()
  @IsUUID('4')
  receiptId?: string;
}


export class MonthDto {
  @Matches(/^[1-9]\d{3}-(0[1-9]|1[0-2])$/)
  month!: string;
}
