import { AUTH_ID } from 'src/common/constants/typedId.names';
import { TypedId } from 'src/common/typedId/typedID.generic';

export class AuthId extends TypedId<typeof AUTH_ID> {
  declare protected readonly type: typeof AUTH_ID;
  constructor(id: string) {
    super(id);
  }
}
