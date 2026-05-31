import { IRegisterData } from '../../types';
import { UserId } from '../typedId/user.id';

export interface IRegisterRepository {
  save(userId: UserId, uuid: string): Promise<void>;
  getById(uuid: string): Promise<IRegisterData | null>;
}
