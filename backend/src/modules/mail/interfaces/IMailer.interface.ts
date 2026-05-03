export interface IMailer {
  sendWelcome(userEmail: string): Promise<void>;
  sendNotification(
    userEmail: string,
    data: Record<string, string>,
  ): Promise<void>;
  sendForgotPassword(userEmail: string): Promise<void>;
  sendCheckOfAction(userEmail: string, actionName: string): Promise<void>;
  sendRegister(userEmail: string): Promise<void>;
}
