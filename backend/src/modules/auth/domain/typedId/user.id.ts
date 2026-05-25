import { USER_ID } from 'src/common/constants/typedId.names';
import { TypedId } from 'src/common/typedId/typedID.generic';

export class UserId extends TypedId<typeof USER_ID> {
  declare protected readonly type: typeof USER_ID;
  constructor(id: string) {
    super(id);
  }
}
