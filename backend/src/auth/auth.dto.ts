import { Transform }        from 'class-transformer';
import { IsString, Length } from 'class-validator';

export class AuthDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(1, 50)
  name!: string;

  @IsString()
  @Length(8, 128)
  password!: string;
}
