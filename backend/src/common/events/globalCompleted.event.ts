export class GlobalBookCompletedStatus {
  constructor(
    public readonly userId: string,
    public readonly propertyId: string,
    public readonly bookingId: string,
  ) {}
}
