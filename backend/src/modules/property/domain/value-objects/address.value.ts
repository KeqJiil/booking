import { BadRequestException } from '@nestjs/common';

export class Address {
  constructor(
    public readonly city: string,
    public readonly country: string,
    public readonly address: string,
  ) {
    if (!city || !country || !address) throw new BadRequestException();
  }
}
