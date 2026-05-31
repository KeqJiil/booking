export interface IAuthQueue {
  post(eventName: string, payload: unknown): void | Promise<void>;
}
