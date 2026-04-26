export class GlobalBookConfirmedStatus {
  constructor(
    public readonly userId: string,
    public readonly hostId: string,
    public readonly bookingId: string,
    public readonly name: string,
  ) {}
}
