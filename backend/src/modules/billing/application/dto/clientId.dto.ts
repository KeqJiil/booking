import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ClientIdDto {
  @ApiProperty({ example: 'cus_ABC123XYZ', description: 'Stripe customer ID' })
  @IsNotEmpty()
  @IsString()
  clientId: string;
}
