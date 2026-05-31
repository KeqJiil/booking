import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ITokenIssuerService } from '../../application/abstractions/TokenIssuer.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtIssuerService<
  T extends object,
> implements ITokenIssuerService<T> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly expiresInMs: number,
  ) {}

  getData(token: string): T {
    const data = this.jwtService.decode<T>(token);
    return data;
  }

  async verify(token: string): Promise<T> {
    const data = await this.jwtService.verifyAsync<T>(token);
    return data;
  }

  async sign(payload: T): Promise<string> {
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: this.expiresInMs,
    } as JwtSignOptions);
    return token;
  }
}
