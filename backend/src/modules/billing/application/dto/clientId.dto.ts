import { IsNotEmpty, IsString } from 'class-validator';

export class ClientIdDto {
  @IsNotEmpty()
  @IsString()
  clientId: string;
}
