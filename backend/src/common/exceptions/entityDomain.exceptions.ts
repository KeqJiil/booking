import { DomainExceptions } from './domain.exceptions';
import {
  NOT_ALLOWED,
  UNEXPECTED_DATA,
  WRONG_DOMAIN_DATA,
} from 'src/common/constants/errorConsts';

export class WrongInputDataError extends DomainExceptions {
  readonly code = WRONG_DOMAIN_DATA;
  constructor(field: string) {
    super(`Wrong data type in ${field} field`);
  }
}

export class UnexpectedDataError extends DomainExceptions {
  readonly code = UNEXPECTED_DATA;
  constructor(wrongData: string, expectedData: string) {
    super(`Unexpected data ${wrongData}, expected ${expectedData}`);
  }
}

export class NotAllowedError extends DomainExceptions {
  readonly code = NOT_ALLOWED;
  constructor(message: string) {
    super(`You are not allowed to do this action ${message}`);
  }
}
