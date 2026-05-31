import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterCommand } from './auth.commands';

@CommandHandler(RegisterCommand)
export class RegisterCommandHandler implements ICommandHandler<RegisterCommand> {
  constructor() {}
  execute(command: RegisterCommand): Promise<void> {}
}
