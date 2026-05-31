export interface IRateLimiterService {
  check(ip: string): Promise<void>;
}
