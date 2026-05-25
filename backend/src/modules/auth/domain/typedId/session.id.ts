import { SESSION_ID } from 'src/common/constants/typedId.names';
import { TypedId } from 'src/common/typedId/typedID.generic';

export class SessionId extends TypedId<typeof SESSION_ID> {
  declare protected type: typeof SESSION_ID;
  constructor(id: string) {
    super(id);
  }
}
