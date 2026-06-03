import { TypedId } from '../../../../common/typedId/typedID.generic';
import { PAYMENT_INTEND_ID } from '../../../../common/constants/typedId.names';

export class PaymentIntendId extends TypedId<typeof PAYMENT_INTEND_ID> {
  declare protected readonly type: typeof PAYMENT_INTEND_ID;
  constructor(id: string) {
    super(id);
  }
}
