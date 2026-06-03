import { TypedId } from '../../../../common/typedId/typedID.generic';
import { PAYMENT_ID } from '../../../../common/constants/typedId.names';

export class PaymentId extends TypedId<typeof PAYMENT_ID> {
  declare protected readonly type: typeof PAYMENT_ID;
  constructor(id: string) {
    super(id);
  }
}
