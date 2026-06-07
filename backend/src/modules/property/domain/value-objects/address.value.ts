import { WrongInputDataError } from 'src/common/exceptions/entityDomain.exceptions';

export class Address {
  constructor(
    public readonly city: string,
    public readonly country: string,
    public readonly address: string,
  ) {
    if (!city.trim() || !country.trim() || !address.trim())
      throw new WrongInputDataError(`Address data`);
    this.city = this.normalize(city);
    this.country = this.normalize(country);
    this.address = this.normalize(address);
  }

  private normalize(string: string) {
    return string.toLowerCase().trim();
  }

  public equals(other: Address) {
    return (
      this.city === other.city &&
      this.address === other.address &&
      this.country === other.country
    );
  }
}
